from django.utils import timezone
from django.db.models import Q
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from accounts.models import User, UserRole, ApprovalStatus
from accounts.permissions import IsApprovedUser
from notifications.models import Notification
from .models import Complaint, ComplaintAttachment, ComplaintComment, ComplaintTimeline, ComplaintStatus
from .serializers import (
    ComplaintListSerializer,
    ComplaintDetailSerializer,
    ComplaintCommentSerializer,
    ComplaintAttachmentSerializer
)

class ComplaintListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated, IsApprovedUser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ComplaintDetailSerializer
        return ComplaintListSerializer

    def get_queryset(self):
        user = self.request.user
        
        # 1. Super Admin: full visibility
        if user.is_platform_superadmin():
            base_qs = Complaint.objects.all().select_related('department', 'category', 'location', 'student', 'assigned_staff')
        elif not user.institution:
            return Complaint.objects.none()
        else:
            base_qs = Complaint.objects.filter(institution=user.institution).select_related(
                'department', 'category', 'location', 'student', 'assigned_staff'
            )

            # 2. Student: STRICTLY their own complaints
            if user.role == UserRole.STUDENT:
                base_qs = base_qs.filter(student=user)

            # 3. Department Staff: complaints assigned to their department OR directly assigned to them
            elif user.role == UserRole.STAFF:
                try:
                    staff_dept = user.staff_profile.department
                    base_qs = base_qs.filter(Q(department=staff_dept) | Q(assigned_staff=user))
                except Exception:
                    base_qs = base_qs.filter(assigned_staff=user)

            # 4. College Admin: all complaints in their institution (base_qs)

        # Filtering parameters
        status_param = self.request.query_params.get('status')
        if status_param and status_param in ComplaintStatus.values:
            base_qs = base_qs.filter(status=status_param)

        department_param = self.request.query_params.get('department')
        if department_param:
            base_qs = base_qs.filter(department_id=department_param)

        priority_param = self.request.query_params.get('priority')
        if priority_param:
            base_qs = base_qs.filter(priority=priority_param)

        search_query = self.request.query_params.get('search')
        if search_query:
            base_qs = base_qs.filter(
                Q(ticket_number__icontains=search_query) |
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        return base_qs

    def perform_create(self, serializer):
        user = self.request.user
        if not user.institution:
            raise PermissionDenied("User is not affiliated with any active educational institution.")
        
        if user.role != UserRole.STUDENT:
            raise PermissionDenied("Only registered students can submit grievances.")
        
        uploaded_file = self.request.FILES.get('file')

        complaint = serializer.save(
            student=user,
            institution=user.institution,
            status=ComplaintStatus.SUBMITTED
        )

        if uploaded_file:
            ComplaintAttachment.objects.create(
                complaint=complaint,
                file=uploaded_file,
                uploaded_by=user,
                is_resolution_proof=False
            )

        # Log timeline event
        ComplaintTimeline.objects.create(
            complaint=complaint,
            actor=user,
            action="Submitted",
            notes="Grievance filed by student."
        )

        # Create in-app notification for college admins and department staff
        try:
            admins = User.objects.filter(
                institution=user.institution,
                role=UserRole.ADMIN,
                approval_status=ApprovalStatus.APPROVED
            )
            for admin_user in admins[:5]:
                Notification.objects.create(
                    recipient=admin_user,
                    complaint=complaint,
                    title=f"New Grievance: #{complaint.ticket_number}",
                    message=f"Student {user.get_full_name() or user.username} reported '{complaint.title}' in {complaint.department.name}."
                )
        except Exception:
            pass

class ComplaintDetailView(generics.RetrieveAPIView):
    serializer_class = ComplaintDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsApprovedUser]

    def get_queryset(self):
        user = self.request.user
        if user.is_platform_superadmin():
            return Complaint.objects.all().select_related('department', 'category', 'location', 'student', 'assigned_staff')
        if not user.institution:
            return Complaint.objects.none()
        
        base_qs = Complaint.objects.filter(institution=user.institution).select_related(
            'department', 'category', 'location', 'student', 'assigned_staff'
        )
        if user.role == UserRole.STUDENT:
            return base_qs.filter(student=user)
        elif user.role == UserRole.STAFF:
            try:
                staff_dept = user.staff_profile.department
                return base_qs.filter(Q(department=staff_dept) | Q(assigned_staff=user))
            except Exception:
                return base_qs.filter(assigned_staff=user)
        return base_qs

class ComplaintStatusUpdateView(APIView):
    """Transition complaint status with resolution notes, technician assignment, and audit logging."""
    permission_classes = [permissions.IsAuthenticated, IsApprovedUser]

    def patch(self, request, pk):
        user = request.user
        try:
            if user.is_platform_superadmin():
                complaint = Complaint.objects.get(pk=pk)
            else:
                complaint = Complaint.objects.get(pk=pk, institution=user.institution)
        except Complaint.DoesNotExist:
            return Response({"error": "Complaint not found in your institution."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        resolution_notes = request.data.get('resolution_notes', '')
        reopen_reason = request.data.get('reopen_reason', '')
        assigned_staff_id = request.data.get('assigned_staff_id')

        # 1. Student Permissions & Lifecycle (Resolution Confirmation / Dispute)
        if user.role == UserRole.STUDENT:
            if complaint.student != user:
                return Response({"error": "You cannot modify another student's grievance."}, status=status.HTTP_403_FORBIDDEN)
            
            if complaint.status != ComplaintStatus.RESOLVED:
                return Response({"error": "Students can only confirm resolution or dispute tickets currently in Resolved status."}, status=status.HTTP_400_BAD_REQUEST)

            if new_status == ComplaintStatus.CLOSED:
                complaint.status = ComplaintStatus.CLOSED
                complaint.closed_at = timezone.now()
                complaint.save()

                ComplaintTimeline.objects.create(
                    complaint=complaint,
                    actor=user,
                    action="Resolution Confirmed & Closed",
                    notes="Student accepted resolution satisfaction."
                )

                if complaint.assigned_staff:
                    Notification.objects.create(
                        recipient=complaint.assigned_staff,
                        complaint=complaint,
                        title=f"Complaint #{complaint.ticket_number} Closed",
                        message=f"Student {user.get_full_name() or user.username} confirmed resolution satisfaction."
                    )
                return Response(ComplaintDetailSerializer(complaint).data, status=status.HTTP_200_OK)

            elif new_status == ComplaintStatus.REOPENED:
                if not reopen_reason.strip():
                    return Response({"error": "Please provide a specific reason explaining why the issue is not resolved."}, status=status.HTTP_400_BAD_REQUEST)
                
                complaint.status = ComplaintStatus.REOPENED
                complaint.reopen_reason = reopen_reason.strip()
                complaint.save()

                ComplaintTimeline.objects.create(
                    complaint=complaint,
                    actor=user,
                    action="Reopened by Student",
                    notes=reopen_reason.strip()
                )

                if complaint.assigned_staff:
                    Notification.objects.create(
                        recipient=complaint.assigned_staff,
                        complaint=complaint,
                        title=f"Complaint #{complaint.ticket_number} Reopened",
                        message=f"Student disputed resolution: {reopen_reason.strip()}"
                    )
                return Response(ComplaintDetailSerializer(complaint).data, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Students can only transition resolved tickets to 'CLOSED' or 'REOPENED'."}, status=status.HTTP_400_BAD_REQUEST)

        # 2. Staff & Admin Permissions
        if user.role not in [UserRole.STAFF, UserRole.ADMIN, UserRole.SUPERADMIN]:
            return Response({"error": "Unauthorized role for status transition."}, status=status.HTTP_403_FORBIDDEN)

        # Department Staff Authorization Check
        if user.role == UserRole.STAFF:
            is_assigned_staff = (complaint.assigned_staff == user)
            is_dept_match = hasattr(user, 'staff_profile') and complaint.department == user.staff_profile.department
            if not (is_assigned_staff or is_dept_match):
                return Response({"error": "You are not authorized to update complaints outside your department."}, status=status.HTTP_403_FORBIDDEN)

        # Handle Technician Assignment (Admin or Staff self-claim)
        if assigned_staff_id is not None:
            if assigned_staff_id == "" or assigned_staff_id == 0:
                complaint.assigned_staff = None
                ComplaintTimeline.objects.create(
                    complaint=complaint,
                    actor=user,
                    action="Unassigned",
                    notes="Technician unassigned from complaint."
                )
            else:
                try:
                    target_staff = User.objects.get(
                        pk=assigned_staff_id,
                        institution=complaint.institution,
                        role=UserRole.STAFF,
                        approval_status=ApprovalStatus.APPROVED
                    )
                    complaint.assigned_staff = target_staff
                    if not new_status and complaint.status in [ComplaintStatus.SUBMITTED, ComplaintStatus.ACKNOWLEDGED]:
                        complaint.status = ComplaintStatus.ASSIGNED
                    
                    ComplaintTimeline.objects.create(
                        complaint=complaint,
                        actor=user,
                        action=f"Assigned to {target_staff.get_full_name() or target_staff.username}",
                        notes=request.data.get('assignment_notes', '')
                    )

                    Notification.objects.create(
                        recipient=target_staff,
                        complaint=complaint,
                        title=f"New Assignment: #{complaint.ticket_number}",
                        message=f"You have been assigned to '{complaint.title}'."
                    )
                except User.DoesNotExist:
                    return Response({"error": "Selected staff member not found in this institution."}, status=status.HTTP_400_BAD_REQUEST)

        # Handle Status Transition
        if new_status:
            if new_status not in ComplaintStatus.values:
                return Response({"error": f"Invalid status: '{new_status}'."}, status=status.HTTP_400_BAD_REQUEST)

            old_status = complaint.status
            complaint.status = new_status
            if resolution_notes:
                complaint.resolution_notes = resolution_notes
            if new_status == ComplaintStatus.RESOLVED:
                complaint.resolved_at = timezone.now()
            elif new_status == ComplaintStatus.CLOSED:
                complaint.closed_at = timezone.now()

            ComplaintTimeline.objects.create(
                complaint=complaint,
                actor=user,
                action=f"Status changed from {old_status} to {new_status}",
                notes=resolution_notes
            )

            # Notify student
            Notification.objects.create(
                recipient=complaint.student,
                complaint=complaint,
                title=f"Complaint #{complaint.ticket_number} Updated",
                message=f"Status changed to {complaint.get_status_display()}. {resolution_notes}"
            )

        complaint.save()
        return Response(ComplaintDetailSerializer(complaint).data, status=status.HTTP_200_OK)

def check_complaint_access(user, complaint):
    """Enforces strict object-level access rules for students and department staff."""
    if user.is_platform_superadmin() or user.role == UserRole.ADMIN:
        return True
    if user.role == UserRole.STUDENT:
        if complaint.student != user:
            raise PermissionDenied("You cannot access another student's grievance.")
        return True
    if user.role == UserRole.STAFF:
        is_assigned = (complaint.assigned_staff == user)
        is_dept = hasattr(user, 'staff_profile') and complaint.department == user.staff_profile.department
        if not (is_assigned or is_dept):
            raise PermissionDenied("Staff cannot access grievances outside their assigned department.")
        return True
    raise PermissionDenied("Unauthorized role.")

class ComplaintCommentCreateView(generics.CreateAPIView):
    serializer_class = ComplaintCommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsApprovedUser]

    def perform_create(self, serializer):
        complaint_id = self.kwargs.get('pk')
        user = self.request.user
        try:
            if user.is_platform_superadmin():
                complaint = Complaint.objects.get(pk=complaint_id)
            else:
                complaint = Complaint.objects.get(pk=complaint_id, institution=user.institution)
        except Complaint.DoesNotExist:
            raise PermissionDenied("Complaint not found in your institution.")

        check_complaint_access(user, complaint)
        comment = serializer.save(complaint=complaint, author=user)

        # Notify other party
        try:
            if user.role == UserRole.STUDENT:
                # Notify assigned staff or college admins
                if complaint.assigned_staff:
                    Notification.objects.create(
                        recipient=complaint.assigned_staff,
                        complaint=complaint,
                        title=f"New Comment on #{complaint.ticket_number}",
                        message=f"{user.get_full_name() or user.username}: {comment.message[:100]}"
                    )
            else:
                # Staff or Admin commented, notify student if not internal note
                if not comment.is_internal:
                    Notification.objects.create(
                        recipient=complaint.student,
                        complaint=complaint,
                        title=f"Response on #{complaint.ticket_number}",
                        message=f"{user.get_full_name() or user.username}: {comment.message[:100]}"
                    )
        except Exception:
            pass

class ComplaintAttachmentUploadView(generics.CreateAPIView):
    serializer_class = ComplaintAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsApprovedUser]

    def perform_create(self, serializer):
        complaint_id = self.kwargs.get('pk')
        user = self.request.user
        try:
            if user.is_platform_superadmin():
                complaint = Complaint.objects.get(pk=complaint_id)
            else:
                complaint = Complaint.objects.get(pk=complaint_id, institution=user.institution)
        except Complaint.DoesNotExist:
            raise PermissionDenied("Complaint not found in your institution.")

        check_complaint_access(user, complaint)
        is_proof = self.request.data.get('is_resolution_proof') in ['true', 'True', True, 1, '1']
        attachment = serializer.save(complaint=complaint, uploaded_by=user, is_resolution_proof=is_proof)

        # Log timeline
        action_name = "Resolution proof photo uploaded" if is_proof else "Photo attachment added"
        ComplaintTimeline.objects.create(
            complaint=complaint,
            actor=user,
            action=action_name,
            notes=f"Uploaded by {user.get_full_name() or user.username}"
        )

