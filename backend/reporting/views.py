from django.db.models import Count, Avg, F
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from accounts.models import UserRole
from complaints.models import Complaint, ComplaintStatus

class DashboardMetricsView(APIView):
    """Aggregated operational metrics for College Admin and Super Admin."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        
        if user.role not in [UserRole.ADMIN, UserRole.SUPERADMIN]:
            return Response(
                {"error": "Only college administrators can access institutional analytics."},
                status=status.HTTP_403_FORBIDDEN
            )

        if user.is_platform_superadmin():
            qs = Complaint.objects.all().select_related('department')
        else:
            if not user.institution:
                return Response({"error": "No institution associated."}, status=status.HTTP_400_BAD_REQUEST)
            qs = Complaint.objects.filter(institution=user.institution).select_related('department')

        total_count = qs.count()
        status_breakdown = dict(qs.values_list('status').annotate(total=Count('id')))
        priority_breakdown = dict(qs.values_list('priority').annotate(total=Count('id')))
        department_breakdown = list(
            qs.values('department__name')
              .annotate(count=Count('id'))
              .order_by('-count')[:5]
        )

        open_statuses = [
            ComplaintStatus.SUBMITTED,
            ComplaintStatus.ACKNOWLEDGED,
            ComplaintStatus.ASSIGNED,
            ComplaintStatus.IN_PROGRESS,
            ComplaintStatus.REOPENED,
        ]
        open_qs = qs.filter(status__in=open_statuses)
        open_count = open_qs.count()
        resolved_count = qs.filter(status__in=[ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED]).count()

        # Calculate overdue count
        overdue_count = sum(1 for c in open_qs if c.is_overdue)

        # Calculate SLA compliance & turnaround
        resolved_qs = qs.filter(status__in=[ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED], resolved_at__isnull=False)
        durations = []
        within_sla_count = 0
        for c in resolved_qs:
            delta_hours = (c.resolved_at - c.created_at).total_seconds() / 3600
            durations.append(delta_hours)
            sla_hours = c.department.sla_hours if c.department else 24
            if delta_hours <= sla_hours:
                within_sla_count += 1
        
        avg_turnaround_hours = round(sum(durations) / len(durations), 1) if durations else 0
        sla_compliance_percent = round((within_sla_count / len(durations) * 100), 1) if durations else 100.0

        return Response({
            "summary": {
                "total_complaints": total_count,
                "open_complaints": open_count,
                "resolved_complaints": resolved_count,
                "overdue_complaints": overdue_count,
                "avg_turnaround_hours": avg_turnaround_hours,
                "sla_compliance_percent": sla_compliance_percent,
                "resolution_rate_percent": round((resolved_count / total_count * 100), 1) if total_count > 0 else 0,
            },
            "by_status": status_breakdown,
            "by_priority": priority_breakdown,
            "top_departments": department_breakdown,
        }, status=status.HTTP_200_OK)

