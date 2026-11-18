from rest_framework import permissions
from .models import UserRole, ApprovalStatus

class IsApprovedUser(permissions.BasePermission):
    """
    Grants access only to users who have been approved by their college administrator,
    or platform super administrators. Pending and rejected users are denied access
    to protected application features.
    """
    message = "Your account registration is currently pending college administrator approval or has been rejected."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        return request.user.is_approved()

class IsStudent(permissions.BasePermission):
    """Grants access only to approved students."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_student() and 
            request.user.is_approved()
        )

class IsDepartmentStaff(permissions.BasePermission):
    """Grants access only to authorized department staff."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_staff_member() and 
            request.user.is_approved()
        )

class IsCollegeAdmin(permissions.BasePermission):
    """Grants access only to college administrators for their institution, or platform superadmins."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.is_institution_admin() or request.user.is_platform_superadmin())
        )

class IsPlatformSuperAdmin(permissions.BasePermission):
    """Grants access only to Grievio platform super administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.is_platform_superadmin()
        )

class IsCollegeAdminOrReadOnly(permissions.BasePermission):
    """
    Grants write permissions only to College Administrators and Platform Super Admins.
    Read permissions are granted to any authenticated and approved user in the institution.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if not request.user.is_approved():
            return False
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_institution_admin() or request.user.is_platform_superadmin()

