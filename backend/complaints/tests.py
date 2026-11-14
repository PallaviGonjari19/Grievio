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

    def test_complaint_filtering_by_status_and_priority(self):
        """Verify query parameter filters for status and priority."""
        client = APIClient()
        client.force_authenticate(user=self.staff_plumber)

        url = reverse('complaint_list_create') + "?priority=MEDIUM"
        res = client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', res.data)
        self.assertEqual(len(results), 1)

        url_no_match = reverse('complaint_list_create') + "?priority=CRITICAL"
        res_no_match = client.get(url_no_match)
        self.assertEqual(len(res_no_match.data.get('results', res_no_match.data)), 0)

    def test_student_resolution_confirmation_and_reopen(self):
        """Students can close or reopen resolved tickets, but not submitted ones."""
        client = APIClient()
        client.force_authenticate(user=self.student_alpha)
        status_url = reverse('complaint_status_update', kwargs={'pk': self.comp_plumbing.id})

        # Cannot close when SUBMITTED
        res = client.patch(status_url, {"status": "CLOSED"}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # Mark ticket as RESOLVED by staff
        self.comp_plumbing.status = ComplaintStatus.RESOLVED
        self.comp_plumbing.save()

        # Reopen ticket with reason
        res_reopen = client.patch(status_url, {
            "status": "REOPENED",
            "reopen_reason": "Faucet is still leaking when turned on high."
        }, format='json')
        self.assertEqual(res_reopen.status_code, status.HTTP_200_OK)
        self.comp_plumbing.refresh_from_db()
        self.assertEqual(self.comp_plumbing.status, ComplaintStatus.REOPENED)
        self.assertEqual(self.comp_plumbing.reopen_reason, "Faucet is still leaking when turned on high.")

        # Re-resolve and confirm resolution (CLOSE)
        self.comp_plumbing.status = ComplaintStatus.RESOLVED
        self.comp_plumbing.save()

        res_close = client.patch(status_url, {"status": "CLOSED"}, format='json')
        self.assertEqual(res_close.status_code, status.HTTP_200_OK)
        self.comp_plumbing.refresh_from_db()
        self.assertEqual(self.comp_plumbing.status, ComplaintStatus.CLOSED)
        self.assertIsNotNone(self.comp_plumbing.closed_at)

    def test_staff_assign_and_resolve(self):
        """Staff can claim/assign technician and mark ticket resolved with notes."""
        client = APIClient()
        client.force_authenticate(user=self.staff_plumber)
        status_url = reverse('complaint_status_update', kwargs={'pk': self.comp_plumbing.id})

        res_assign = client.patch(status_url, {
            "assigned_staff_id": self.staff_plumber.id,
            "status": "IN_PROGRESS"
        }, format='json')
        self.assertEqual(res_assign.status_code, status.HTTP_200_OK)
        self.comp_plumbing.refresh_from_db()
        self.assertEqual(self.comp_plumbing.assigned_staff, self.staff_plumber)
        self.assertEqual(self.comp_plumbing.status, ComplaintStatus.IN_PROGRESS)

        # Mark RESOLVED
        res_resolve = client.patch(status_url, {
            "status": "RESOLVED",
            "resolution_notes": "Replaced valve and washer. Tested under pressure."
        }, format='json')
        self.assertEqual(res_resolve.status_code, status.HTTP_200_OK)
        self.comp_plumbing.refresh_from_db()
        self.assertEqual(self.comp_plumbing.status, ComplaintStatus.RESOLVED)
        self.assertEqual(self.comp_plumbing.resolution_notes, "Replaced valve and washer. Tested under pressure.")
        self.assertIsNotNone(self.comp_plumbing.resolved_at)
