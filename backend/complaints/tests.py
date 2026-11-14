from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from institutions.models import Institution
from departments.models import Department, ComplaintCategory
from accounts.models import User, UserRole, ApprovalStatus, StaffProfile
from complaints.models import Complaint, ComplaintStatus

class ComplaintIsolationTests(TestCase):
    def setUp(self):
        self.inst1 = Institution.objects.create(name="College Alpha", code="ALPHA", contact_email="a@alpha.edu")
        self.inst2 = Institution.objects.create(name="College Beta", code="BETA", contact_email="b@beta.edu")

        self.dept_alpha_plumb = Department.objects.create(institution=self.inst1, name="Plumbing")
        self.cat_alpha_plumb = ComplaintCategory.objects.create(department=self.dept_alpha_plumb, name="Leakage")

        self.dept_alpha_elec = Department.objects.create(institution=self.inst1, name="Electrical")
        self.cat_alpha_elec = ComplaintCategory.objects.create(department=self.dept_alpha_elec, name="Power Outage")

        self.dept_beta = Department.objects.create(institution=self.inst2, name="Beta Maintenance")
        self.cat_beta = ComplaintCategory.objects.create(department=self.dept_beta, name="Beta Issue")

        # Students
        self.student_alpha = User.objects.create_user(
            username="student_alpha", email="s@alpha.edu", password="Password123",
            role=UserRole.STUDENT, institution=self.inst1, approval_status=ApprovalStatus.APPROVED
        )
        self.student_alpha_2 = User.objects.create_user(
            username="student_alpha_2", email="s2@alpha.edu", password="Password123",
            role=UserRole.STUDENT, institution=self.inst1, approval_status=ApprovalStatus.APPROVED
        )
        self.student_beta = User.objects.create_user(
            username="student_beta", email="s@beta.edu", password="Password123",
            role=UserRole.STUDENT, institution=self.inst2, approval_status=ApprovalStatus.APPROVED
        )
        self.pending_student = User.objects.create_user(
            username="pending_student", email="p@alpha.edu", password="Password123",
            role=UserRole.STUDENT, institution=self.inst1, approval_status=ApprovalStatus.PENDING
        )

        # Department Staff Alpha (Plumbing)
        self.staff_plumber = User.objects.create_user(
            username="plumber_bob", email="bob@alpha.edu", password="Password123",
            role=UserRole.STAFF, institution=self.inst1, approval_status=ApprovalStatus.APPROVED
        )
        self.profile_plumber = StaffProfile.objects.create(
            user=self.staff_plumber, staff_id="PLUMB-01", department=self.dept_alpha_plumb
        )

        # Complaints in Alpha
        self.comp_plumbing = Complaint.objects.create(
            institution=self.inst1, student=self.student_alpha,
            department=self.dept_alpha_plumb, category=self.cat_alpha_plumb,
            title="Broken faucet in Lab", description="Water is dripping"
        )
        self.comp_electrical = Complaint.objects.create(
            institution=self.inst1, student=self.student_alpha_2,
            department=self.dept_alpha_elec, category=self.cat_alpha_elec,
            title="Flickering light in Hall", description="Electrical issue"
        )
        # Complaint in Beta
        self.comp_beta = Complaint.objects.create(
            institution=self.inst2, student=self.student_beta,
            department=self.dept_beta, category=self.cat_beta,
            title="Beta college issue", description="Lights flickering"
        )

    def test_student_isolation(self):
        client = APIClient()
        client.force_authenticate(user=self.student_alpha)

        url = reverse('complaint_list_create')
        res = client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.comp_plumbing.id)

    def test_cross_tenant_isolation(self):
        client = APIClient()
        client.force_authenticate(user=self.student_beta)

        url = reverse('complaint_list_create')
        res = client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.comp_beta.id)

    def test_pending_student_access_denied(self):
        client = APIClient()
        client.force_authenticate(user=self.pending_student)

        url = reverse('complaint_list_create')
        res = client.get(url)
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_cross_tenant_foreign_key_injection_prevented(self):
        """Student in College Alpha cannot create a complaint linked to a department in College Beta."""
        client = APIClient()
        client.force_authenticate(user=self.student_alpha)

        url = reverse('complaint_list_create')
        payload = {
            "title": "Malicious foreign key injection",
            "description": "Attempting to assign to external college department",
            "department": self.dept_beta.id,
            "category": self.cat_beta.id,
            "priority": "HIGH"
        }
        res = client.post(url, payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("department", res.data)

    def test_student_cannot_create_department(self):
        """Student cannot POST to departments list."""
        client = APIClient()
        client.force_authenticate(user=self.student_alpha)

        url = reverse('department_list')
        res = client.post(url, {"name": "Unauthorized Dept", "sla_hours": 12}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_department_access(self):
        """Staff can view complaints assigned to their department."""
        client = APIClient()
        client.force_authenticate(user=self.staff_plumber)

        url = reverse('complaint_list_create')
        res = client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', res.data)
        # Should only see Plumbing ticket, NOT Electrical ticket
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.comp_plumbing.id)

    def test_staff_cannot_comment_on_unrelated_department(self):
        """Staff in Plumbing cannot comment on Electrical complaints."""
        client = APIClient()
        client.force_authenticate(user=self.staff_plumber)

        comment_url = reverse('complaint_comment_create', kwargs={'pk': self.comp_electrical.id})
        res = client.post(comment_url, {"message": "Unauthorized comment"}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_staff_individually_assigned_complaint_access(self):
        """Staff explicitly assigned to a complaint can access it even if cross-department."""
        self.comp_electrical.assigned_staff = self.staff_plumber
        self.comp_electrical.save()

        client = APIClient()
        client.force_authenticate(user=self.staff_plumber)

        url = reverse('complaint_list_create')
        res = client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', res.data)
        # Now sees both: Plumbing (by dept) and Electrical (by personal assignment)
        self.assertEqual(len(results), 2)
