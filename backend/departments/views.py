from rest_framework import generics, permissions
from .models import Department, ComplaintCategory
from .serializers import DepartmentSerializer, ComplaintCategorySerializer

class DepartmentListView(generics.ListCreateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_platform_superadmin():
            return Department.objects.all()
        return Department.objects.filter(institution=user.institution, is_active=True)

    def perform_create(self, serializer):
        serializer.save(institution=self.request.user.institution)

class DepartmentDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_platform_superadmin():
            return Department.objects.all()
        return Department.objects.filter(institution=user.institution)

class DepartmentCategoriesListView(generics.ListCreateAPIView):
    serializer_class = ComplaintCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        dept_id = self.kwargs.get('department_id')
        user = self.request.user
        qs = ComplaintCategory.objects.filter(department_id=dept_id, is_active=True)
        if not user.is_platform_superadmin():
            qs = qs.filter(department__institution=user.institution)
        return qs

    def perform_create(self, serializer):
        dept_id = self.kwargs.get('department_id')
        serializer.save(department_id=dept_id)

