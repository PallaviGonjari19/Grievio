from django.core.management.base import BaseCommand
from django.utils import timezone
from complaints.models import Complaint, ComplaintStatus, ComplaintTimeline
from notifications.models import Notification
from accounts.models import User, UserRole, ApprovalStatus

class Command(BaseCommand):
    help = "Inspects active campus complaints, flags SLA breaches, and triggers escalation alerts."

    def handle(self, *args, **options):
        self.stdout.write("Running Grievio SLA escalation monitor...")
        
        open_statuses = [
            ComplaintStatus.SUBMITTED,
            ComplaintStatus.ACKNOWLEDGED,
            ComplaintStatus.ASSIGNED,
            ComplaintStatus.IN_PROGRESS,
            ComplaintStatus.REOPENED,
        ]

        active_complaints = Complaint.objects.filter(
            status__in=open_statuses
        ).select_related('department', 'institution', 'student', 'assigned_staff')

        overdue_count = 0
        alerts_sent = 0

        for complaint in active_complaints:
            if complaint.is_overdue:
                overdue_count += 1
                
                # Check if we already alerted about this complaint in the last 24 hours
                recent_alert = Notification.objects.filter(
                    complaint=complaint,
                    title__icontains="SLA Breach Escalation",
                    created_at__gte=timezone.now() - timezone.timedelta(hours=24)
                ).exists()

                if not recent_alert:
                    # 1. Alert College Administrators
                    admins = User.objects.filter(
                        institution=complaint.institution,
                        role=UserRole.ADMIN,
                        approval_status=ApprovalStatus.APPROVED
                    )

                    alert_title = f"SLA Breach Escalation: Ticket #{complaint.ticket_number}"
                    alert_msg = (
                        f"Grievance '{complaint.title}' ({complaint.department.name}) "
                        f"has exceeded the target turnaround of {complaint.department.sla_hours} hours. "
                        f"Please reassign or intervene."
                    )

                    for admin in admins:
                        Notification.objects.create(
                            recipient=admin,
                            complaint=complaint,
                            title=alert_title,
                            message=alert_msg
                        )
                        alerts_sent += 1

                    # 2. Alert Assigned Staff (if any)
                    if complaint.assigned_staff:
                        Notification.objects.create(
                            recipient=complaint.assigned_staff,
                            complaint=complaint,
                            title=alert_title,
                            message=f"Your assigned ticket '{complaint.title}' is overdue. Immediate resolution required."
                        )
                        alerts_sent += 1

                    # 3. Record in Timeline
                    ComplaintTimeline.objects.create(
                        complaint=complaint,
                        action="SLA Escalation Flagged",
                        notes=f"Exceeded {complaint.department.sla_hours}h SLA deadline. Automatic alerts dispatched."
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f"SLA Check Complete: {active_complaints.count()} active checked, "
                f"{overdue_count} overdue, {alerts_sent} escalation alerts sent."
            )
        )
