from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from institutions.models import Institution
from accounts.models import User, UserRole

class HealthAndAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.institution = Institution.objects.create(
            name="Apex Institute of Technology",
            code="APEX-TECH",
            contact_email="admin@apex.edu"
        )

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

    def test_student_registration_and_token(self):
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
        self.assertEqual(res.data['username'], 'student1')

        # Test JWT token acquisition
        token_url = reverse('token_obtain_pair')
        token_res = self.client.post(token_url, {
            "username": "student1",
            "password": "StrongPassword123!"
        }, format='json')
        self.assertEqual(token_res.status_code, status.HTTP_200_OK)
        self.assertIn('access', token_res.data)
        self.assertIn('refresh', token_res.data)
