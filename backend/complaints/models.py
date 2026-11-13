import uuid
from django.db import models
from django.utils import timezone
from accounts.models import User
from institutions.models import Institution, CampusLocation
from departments.models import Department, ComplaintCategory, ComplaintPriority

class ComplaintStatus(models.TextChoices):
    SUBMITTED = 'SUBMITTED', 'Submitted'
    ACKNOWLEDGED = 'ACKNOWLEDGED', 'Acknowledged'
    ASSIGNED = 'ASSIGNED', 'Assigned'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    RESOLVED = 'RESOLVED', 'Resolved'
    CLOSED = 'CLOSED', 'Closed'
    REOPENED = 'REOPENED', 'Reopened'
    REJECTED = 'REJECTED', 'Rejected'

class Complaint(models.Model):
    ticket_number = models.CharField(max_length=50, unique=True, editable=False)
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='complaints')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='filed_complaints')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='complaints')
    category = models.ForeignKey(ComplaintCategory, on_delete=models.CASCADE, related_name='complaints')
    location = models.ForeignKey(CampusLocation, on_delete=models.SET_NULL, null=True, blank=True, related_name='complaints')
    location_details = models.CharField(max_length=255, blank=True, help_text="Specific desk, bench, or landmark.")
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=15, choices=ComplaintPriority.choices, default=ComplaintPriority.MEDIUM)
    status = models.CharField(max_length=20, choices=ComplaintStatus.choices, default=ComplaintStatus.SUBMITTED)
    
    assigned_staff = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_complaints'
    )
    resolution_notes = models.TextField(blank=True)
    reopen_reason = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    closed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.ticket_number:
            year = timezone.now().strftime('%y')
            short_id = uuid.uuid4().hex[:6].upper()
            code = self.institution.code if self.institution else 'GRV'
            self.ticket_number = f"{code}-{year}-{short_id}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.ticket_number}] {self.title} ({self.get_status_display()})"

class ComplaintAttachment(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='complaints/%Y/%m/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    is_resolution_proof = models.BooleanField(
        default=False,
        help_text="True if this is photo/document proof submitted upon resolving the issue."
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for {self.complaint.ticket_number}"

class ComplaintComment(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    is_internal = models.BooleanField(
        default=False,
        help_text="Visible only to department staff and administrators."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comment by {self.author.username} on {self.complaint.ticket_number}"

class ComplaintTimeline(models.Model):
    complaint = models.ForeignKey(Complaint, on_delete=models.CASCADE, related_name='timeline')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.action} on {self.complaint.ticket_number} at {self.created_at}"
