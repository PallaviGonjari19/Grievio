from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from accounts.permissions import IsCollegeAdminOrReadOnly, IsPlatformSuperAdmin
from .models import Institution, CampusLocation, InstitutionStatus
from .serializers import InstitutionPublicSerializer, InstitutionDetailSerializer, CampusLocationSerializer

class InstitutionListCreateView(generics.ListCreateAPIView):
    """Platform Super Admin view to list all colleges and provision new educational institutions."""
    serializer_class = InstitutionDetailSerializer
    permission_classes = [permissions.IsAuthenticated, IsPlatformSuperAdmin]
    queryset = Institution.objects.all().order_by('-created_at')

class InstitutionStatusUpdateView(APIView):
    """Platform Super Admin endpoint to activate, suspend, or deactivate a college."""
    permission_classes = [permissions.IsAuthenticated, IsPlatformSuperAdmin]

    def patch(self, request, pk):
        try:
            institution = Institution.objects.get(pk=pk)
        except Institution.DoesNotExist:
            return Response({"error": "Institution not found."}, status=status.HTTP_404_NOT_FOUND)

        new_status = request.data.get('status')
        if new_status not in InstitutionStatus.values:
            return Response({"error": f"Invalid status: '{new_status}'."}, status=status.HTTP_400_BAD_REQUEST)

        institution.status = new_status
        institution.save()
        return Response(InstitutionDetailSerializer(institution).data, status=status.HTTP_200_OK)

class InstitutionLookupView(APIView):
    """Public lookup to verify a college code and retrieve public metadata."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        code = request.query_params.get('code')
        if not code:
            return Response({"error": "Query parameter 'code' is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            institution = Institution.objects.get(code__iexact=code.strip(), is_active=True)
            serializer = InstitutionPublicSerializer(institution)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Institution.DoesNotExist:
            return Response({"error": "Institution not found or inactive."}, status=status.HTTP_404_NOT_FOUND)

class CurrentInstitutionView(generics.RetrieveAPIView):
    """Retrieve details of the authenticated user's institution."""
    serializer_class = InstitutionDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.institution

class CampusLocationListView(generics.ListCreateAPIView):
    """List campus locations (any member) and create new locations (admin only)."""
    serializer_class = CampusLocationSerializer
    permission_classes = [permissions.IsAuthenticated, IsCollegeAdminOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        if user.is_platform_superadmin():
            return CampusLocation.objects.all()
        return CampusLocation.objects.filter(institution=user.institution)

    def perform_create(self, serializer):
        serializer.save(institution=self.request.user.institution)

