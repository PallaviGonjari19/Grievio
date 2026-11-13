from django.db import models
from django.contrib.auth.models import AbstractUser

class UserRole(models.TextChoices):
    STUDENT = 'STUDENT', 'Student'
    STAFF = 'STAFF', 'Department Staff'
    ADMIN = 'ADMIN', 'College Administrator'
    SUPERADMIN = 'SUPERADMIN', 'Platform Super Admin'

class ApprovalStatus(models.TextChoices):
    PENDING = 'PENDING', 'Pending Approval'
    APPROVED = 'APPROVED', 'Approved'
    REJECTED = 'REJECTED', 'Rejected'

class User(AbstractUser):
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.STUDENT,
        help_text="Role determining platform permissions."
    )
    institution = models.ForeignKey(
        'institutions.Institution',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='users',
        help_text="Institution this user belongs to. Null for platform superadmins."
    )
    phone = models.CharField(max_length=20, blank=True)
    approval_status = models.CharField(
        max_length=20,
        choices=ApprovalStatus.choices,
        default=ApprovalStatus.PENDING,
        help_text="Registration approval status managed by college administrator."
    )
    rejection_reason = models.TextField(
        blank=True,
        help_text="Reason provided by administrator if registration was rejected."
    )
    is_verified = models.BooleanField(
        default=False,
        help_text="Designates whether this user has been approved by college administration."
    )
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)

    def is_student(self):
        return self.role == UserRole.STUDENT

    def is_staff_member(self):
        return self.role == UserRole.STAFF

    def is_institution_admin(self):
        return self.role == UserRole.ADMIN

    def is_platform_superadmin(self):
        return self.role == UserRole.SUPERADMIN or self.is_superuser

    def is_approved(self):
        return self.is_platform_superadmin() or self.approval_status == ApprovalStatus.APPROVED

    def save(self, *args, **kwargs):
        # Synchronize is_verified flag with approval_status
        if self.is_platform_superadmin() or self.role == UserRole.ADMIN:
            # Platform superadmins and designated initial admins are approved
            if not self.pk and self.approval_status == ApprovalStatus.PENDING:
                self.approval_status = ApprovalStatus.APPROVED
        self.is_verified = (self.approval_status == ApprovalStatus.APPROVED)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"

class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    roll_number = models.CharField(max_length=50)
    batch_year = models.PositiveIntegerField(null=True, blank=True)
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='students'
    )
    room_or_hostel = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Student {self.roll_number} - {self.user.get_full_name() or self.user.username}"

class StaffProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    staff_id = models.CharField(max_length=50)
    department = models.ForeignKey(
        'departments.Department',
        on_delete=models.CASCADE,
        related_name='staff_members'
    )
    designation = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return f"Staff {self.staff_id} - {self.user.get_full_name() or self.user.username}"

