from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from institutions.models import Institution
from departments.models import Department, ComplaintCategory
from accounts.models import User, UserRole
from complaints.models import Complaint, ComplaintStatus

class ComplaintIsolationTests(TestCase):
    def setUp(self):
        self.inst1 = Institution.objects.create(name="College Alpha", code="ALPHA", contact_email="a@alpha.edu")
        self.inst2 = Institution.objects.create(name="College Beta", code="BETA", contact_email="b@beta.edu")

        self.dept_alpha = Department.objects.create(institution=self.inst1, name="Maintenance")
        self.cat_alpha = ComplaintCategory.objects.create(department=self.dept_alpha, name="Plumbing")

        self.dept_beta = Department.objects.create(institution=self.inst2, name="Electrical")
        self.cat_beta = ComplaintCategory.objects.create(department=self.dept_beta, name="Lighting")

        self.student_alpha = User.objects.create_user(
            username="student_alpha", email="s@alpha.edu", password="Password123",
            role=UserRole.STUDENT, institution=self.inst1
        )
        self.student_alpha_2 = User.objects.create_user(
            username="student_alpha_2", email="s2@alpha.edu", password="Password123",
            role=UserRole.STUDENT, institution=self.inst1
        )
        self.student_beta = User.objects.create_user(
            username="student_beta", email="s@beta.edu", password="Password123",
            role=UserRole.STUDENT, institution=self.inst2
        )

        # Create complaints
        self.comp1 = Complaint.objects.create(
            institution=self.inst1, student=self.student_alpha,
            department=self.dept_alpha, category=self.cat_alpha,
            title="Broken faucet in Lab", description="Water is dripping"
        )
        self.comp2 = Complaint.objects.create(
            institution=self.inst1, student=self.student_alpha_2,
            department=self.dept_alpha, category=self.cat_alpha,
            title="Another student complaint", description="Desk broken"
        )
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
        # Should only see their OWN complaint in College Alpha
        results = res.data.get('results', res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.comp1.id)

    def test_cross_tenant_isolation(self):
        client = APIClient()
        client.force_authenticate(user=self.student_beta)

        url = reverse('complaint_list_create')
        res = client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get('results', res.data)
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['id'], self.comp_beta.id)
