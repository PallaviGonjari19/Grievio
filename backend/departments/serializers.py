from rest_framework import serializers
from .models import Department, ComplaintCategory

class ComplaintCategorySerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = ComplaintCategory
        fields = ['id', 'department', 'department_name', 'name', 'description', 'default_priority', 'is_active']

class DepartmentSerializer(serializers.ModelSerializer):
    categories = ComplaintCategorySerializer(many=True, read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'institution', 'name', 'description', 'head_email', 'sla_hours', 'is_active', 'categories']
        read_only_fields = ['institution']
