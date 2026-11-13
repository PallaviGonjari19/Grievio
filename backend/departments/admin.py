from django.contrib import admin
from .models import Department, ComplaintCategory

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'institution', 'sla_hours', 'is_active', 'created_at')
    search_fields = ('name', 'institution__name')
    list_filter = ('institution', 'is_active')

@admin.register(ComplaintCategory)
class ComplaintCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'department', 'default_priority', 'is_active')
    search_fields = ('name', 'department__name')
    list_filter = ('department__institution', 'default_priority', 'is_active')
