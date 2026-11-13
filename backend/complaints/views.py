from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from accounts.models import UserRole
from .models import Complaint, ComplaintAttachment, ComplaintComment, ComplaintTimeline, ComplaintStatus
from .serializers import (
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintCommentSerializer,
    ComplaintAttachmentSerializer
)

class ComplaintListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintDetailSerializer
        return ComplaintListSerializer

    def get_queryset(self):
        user = self.request.user
        
        # 1. Super Admin: full visibility
        if user.is_platform_superadmin():
            return Complaint.objects.all().select_related('department', 'category', 'student', 'assigned_staff')
        
        # Guard: User must belong to an institution
        if not user.institution:
            return Complaint.objects.none()

        base_qs = Complaint.objects.filter(institution=user.institution).select_related(
            'department', 'category', 'student', 'assigned_staff'
        )

        # 2. Student: STRICTLY their own complaints
        if user.role == UserRole.STUDENT:
            return base_qs.filter(student=user)

        # 3. Department Staff: only complaints for their assigned department
        elif user.role == UserRole.STAFF:
            try:
                staff_dept = user.staff_profile.department
                return base_qs.filter(department=staff_dept)
            except Exception:
                return base_qs.filter(assigned_staff=user)

        # 4. College Admin: all complaints in their institution
        elif user.role == UserRole.ADMIN:
            return base_qs

        return Complaint.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        if not user.institution:
            raise PermissionDenied("User is not affiliated with any active educational institution.")
        
        complaint = serializer.save(
            student=user,
            institution=user.institution,
            status=ComplaintStatus.SUBMITTED
        )

        # Log timeline event
        ComplaintTimeline.objects.create(
            complaint=complaint,
            actor=user,
            action="Submitted",
            notes="Grievance filed by student."
        )

class ComplaintDetailView(generics.RetrieveAPIView):
    serializer_class = ComplaintDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_platform_superadmin():
            return Complaint.objects.all()
        if not user.institution:
            return Complaint.objects.none()
        
        base_qs = Complaint.objects.filter(institution=user.institution)
        if user.role == UserRole.STUDENT:
            return base_qs.filter(student=user)
        elif user.role == UserRole.STAFF:
            try:
                return base_qs.filter(department=user.staff_profile.department)
            except Exception:
                return base_qs.filter(assigned_staff=user)
        return base_qs

class ComplaintStatusUpdateView(APIView):
    """Transition complaint status with resolution notes and audit logging."""
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        user = request.user
        try:
            complaint = Complaint.objects.get(pk=pk, institution=user.institution)
        except Complaint.DoesNotExist:
            return Response({"error": "Complaint not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.role not in [UserRole.STAFF, UserRole.ADMIN, UserRole.SUPERADMIN]:
            return Response({"error": "Only authorized staff or administrators can update status."}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        resolution_notes = request.data.get('resolution_notes', '')

        if new_status not in ComplaintStatus.values:
            return Response({"error": "Invalid status value."}, status=status.HTTP_400_BAD_REQUEST)

        old_status = complaint.status
        complaint.status = new_status
        if resolution_notes:
            complaint.resolution_notes = resolution_notes
        if new_status == ComplaintStatus.RESOLVED:
            complaint.resolved_at = timezone.now()
        complaint.save()

        # Record timeline
        ComplaintTimeline.objects.create(
            complaint=complaint,
            actor=user,
            action=f"Status changed from {old_status} to {new_status}",
            notes=resolution_notes
        )

        return Response(ComplaintDetailSerializer(complaint).data, status=status.HTTP_200_OK)

class ComplaintCommentCreateView(generics.CreateAPIView):
    serializer_class = ComplaintCommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        complaint_id = self.kwargs.get('pk')
        user = self.request.user
        complaint = Complaint.objects.get(pk=complaint_id, institution=user.institution)
        
        # Student cannot comment on another's complaint
        if user.role == UserRole.STUDENT and complaint.student != user:
            raise PermissionDenied("You cannot comment on this grievance.")
            
        serializer.save(complaint=complaint, author=user)

class ComplaintAttachmentUploadView(generics.CreateAPIView):
    serializer_class = ComplaintAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        complaint_id = self.kwargs.get('pk')
        user = self.request.user
        complaint = Complaint.objects.get(pk=complaint_id, institution=user.institution)
        serializer.save(complaint=complaint, uploaded_by=user)
