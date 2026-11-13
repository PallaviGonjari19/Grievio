from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Institution, CampusLocation
from .serializers import InstitutionPublicSerializer, InstitutionDetailSerializer, CampusLocationSerializer

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
    """List and create campus locations within the authenticated institution."""
    serializer_class = CampusLocationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_platform_superadmin():
            return CampusLocation.objects.all()
        return CampusLocation.objects.filter(institution=user.institution)

    def perform_create(self, serializer):
        serializer.save(institution=self.request.user.institution)

