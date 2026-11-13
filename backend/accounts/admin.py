from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, StudentProfile, StaffProfile

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'institution', 'is_verified', 'is_staff')
    list_filter = ('role', 'is_verified', 'is_staff', 'institution')
    fieldsets = UserAdmin.fieldsets + (
        ('Grievio Details', {'fields': ('role', 'institution', 'phone', 'is_verified', 'avatar')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Grievio Details', {'fields': ('role', 'institution', 'phone', 'is_verified')}),
    )

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('roll_number', 'user', 'department', 'batch_year')
    search_fields = ('roll_number', 'user__username', 'user__email')

@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = ('staff_id', 'user', 'department', 'designation')
    search_fields = ('staff_id', 'user__username', 'user__email')
