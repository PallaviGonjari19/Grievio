from django.db import models

class Department(models.Model):
    institution = models.ForeignKey(
        'institutions.Institution',
        on_delete=models.CASCADE,
        related_name='departments'
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    head_email = models.EmailField(blank=True)
    sla_hours = models.PositiveIntegerField(
        default=24,
        help_text="Target hours to resolve grievances in this department."
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('institution', 'name')

    def __str__(self):
        return f"{self.name} ({self.institution.code})"

class ComplaintPriority(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    CRITICAL = 'CRITICAL', 'Critical'

class ComplaintCategory(models.Model):
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='categories'
    )
    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    default_priority = models.CharField(
        max_length=15,
        choices=ComplaintPriority.choices,
        default=ComplaintPriority.MEDIUM
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = 'Complaint categories'
        unique_together = ('department', 'name')

    def __str__(self):
        return f"{self.name} [{self.department.name}]"
