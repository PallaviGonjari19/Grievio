from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from institutions.models import Institution, InstitutionStatus
from accounts.models import User, UserRole, ApprovalStatus

class HealthAndAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.institution = Institution.objects.create(
            name="Apex Institute of Technology",
            code="APEX-TECH",
            contact_email="admin@apex.edu"
        )
        self.admin_user = User.objects.create_user(
            username="apex_admin",
            email="admin@apex.edu",
            password="AdminPassword123!",
            role=UserRole.ADMIN,
            institution=self.institution,
            approval_status=ApprovalStatus.APPROVED
        )

    def test_root_index_endpoint(self):
        url = reverse('root_index')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['platform'], 'Grievio')
        self.assertIn('endpoints', data)

    def test_health_check_endpoint(self):
        url = reverse('health_check')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data['status'], 'online')
        self.assertEqual(data['database'], 'ok')

    def test_api_root_endpoint(self):
        url = reverse('api_root')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn('endpoints', data)

    def test_student_registration_approval_workflow(self):
        # 1. Student registers with college code
        register_url = reverse('register')
        payload = {
            "username": "student1",
            "email": "student1@apex.edu",
            "password": "StrongPassword123!",
            "role": "STUDENT",
            "institution_code": "APEX-TECH"
        }
        res = self.client.post(register_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username="student1")
        # Must be in PENDING status
        self.assertEqual(user.approval_status, ApprovalStatus.PENDING)
        self.assertFalse(user.is_approved())

        # 2. College Admin lists pending users
        self.client.force_authenticate(user=self.admin_user)
        pending_url = reverse('pending_users')
        pending_res = self.client.get(pending_url)
        self.assertEqual(pending_res.status_code, status.HTTP_200_OK)
        results = pending_res.data.get('results', pending_res.data)
        self.assertTrue(any(u['username'] == 'student1' for u in results))

        # 3. College Admin approves student
        approve_url = reverse('approve_user', kwargs={'pk': user.id})
        approve_res = self.client.post(approve_url, {'action': 'approve'}, format='json')
        self.assertEqual(approve_res.status_code, status.HTTP_200_OK)

        user.refresh_from_db()
        self.assertEqual(user.approval_status, ApprovalStatus.APPROVED)
        self.assertTrue(user.is_approved())

    def test_privilege_escalation_prevented(self):
        """Verify that public registration rejects attempts to register as ADMIN or SUPERADMIN."""
        register_url = reverse('register')
        payload = {
            "username": "attacker",
            "email": "attacker@apex.edu",
            "password": "StrongPassword123!",
            "role": "SUPERADMIN",
            "institution_code": "APEX-TECH"
        }
        res = self.client.post(register_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username="attacker").exists())

    def test_registration_requires_active_institution(self):
        """Verify that registration requires a valid, active institution code."""
        register_url = reverse('register')
        payload = {
            "username": "newstudent",
            "email": "student@fake.edu",
            "password": "StrongPassword123!",
            "role": "STUDENT",
            "institution_code": "NON-EXISTENT"
        }
        res = self.client.post(register_url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("institution_code", res.data)

    def test_suspended_institution_blocks_access(self):
        """Verify that users belonging to a suspended institution are blocked."""
        student = User.objects.create_user(
            username="student_active",
            email="stu@apex.edu",
            password="Password123!",
            role=UserRole.STUDENT,
            institution=self.institution,
            approval_status=ApprovalStatus.APPROVED
        )
        self.assertTrue(student.is_approved())

        # Suspend institution
        self.institution.status = InstitutionStatus.SUSPENDED
        self.institution.save()

        # Refresh student
        student.refresh_from_db()
        self.assertFalse(student.is_approved())

        # Calling complaints API with suspended student must yield 403 Forbidden
        self.client.force_authenticate(user=student)
        comp_url = reverse('complaint_list_create')
        res = self.client.get(comp_url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
