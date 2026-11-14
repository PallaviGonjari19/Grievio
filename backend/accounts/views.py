from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, ApprovalStatus, UserRole
from .serializers import UserSerializer, RegisterSerializer
from .permissions import IsCollegeAdmin, IsApprovedUser

class CurrentUserView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class PendingUsersListView(generics.ListAPIView):
    """Allows college administrators to list all pending student/staff registrations for their college."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsCollegeAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_platform_superadmin():
            return User.objects.filter(approval_status=ApprovalStatus.PENDING).order_by('-date_joined')
        return User.objects.filter(institution=user.institution, approval_status=ApprovalStatus.PENDING).order_by('-date_joined')

class ApproveUserView(APIView):
    """Allows college administrators to approve or reject registrations."""
    permission_classes = [permissions.IsAuthenticated, IsCollegeAdmin]

    def post(self, request, pk):
        admin_user = request.user
        try:
            if admin_user.is_platform_superadmin():
                target_user = User.objects.get(pk=pk)
            else:
                target_user = User.objects.get(pk=pk, institution=admin_user.institution)
        except User.DoesNotExist:
            return Response({"error": "User not found in your institution."}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action') # 'approve' or 'reject'
        if action == 'approve':
            target_user.approval_status = ApprovalStatus.APPROVED
            target_user.rejection_reason = ""
            target_user.save()
            return Response({"message": f"User {target_user.username} approved successfully.", "user": UserSerializer(target_user).data})
        elif action == 'reject':
            reason = request.data.get('reason', 'Registration rejected by administrator.')
            target_user.approval_status = ApprovalStatus.REJECTED
            target_user.rejection_reason = reason
            target_user.save()
            return Response({"message": f"User {target_user.username} rejected.", "user": UserSerializer(target_user).data})
        else:
            return Response({"error": "Invalid action. Use 'approve' or 'reject'."}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            return Response({"message": "Successfully logged out."}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class InstitutionStaffListView(generics.ListAPIView):
    """Allows authenticated institution members to list approved staff members (optionally filtered by department)."""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsApprovedUser]

    def get_queryset(self):
        user = self.request.user
        if user.is_platform_superadmin():
            qs = User.objects.filter(role=UserRole.STAFF, approval_status=ApprovalStatus.APPROVED)
        else:
            if not user.institution:
                return User.objects.none()
            qs = User.objects.filter(
                institution=user.institution,
                role=UserRole.STAFF,
                approval_status=ApprovalStatus.APPROVED
            )

        dept_id = self.request.query_params.get('department')
        if dept_id:
            qs = qs.filter(staff_profile__department_id=dept_id)
        return qs.order_by('first_name', 'last_name', 'username')

