from django.urls import path
from .views import (
    InstitutionLookupView,
    CurrentInstitutionView,
    CampusLocationListView,
    InstitutionListCreateView,
    InstitutionStatusUpdateView
)

urlpatterns = [
    path('', InstitutionListCreateView.as_view(), name='institution_list_create'),
    path('<int:pk>/status/', InstitutionStatusUpdateView.as_view(), name='institution_status_update'),
    path('lookup/', InstitutionLookupView.as_view(), name='institution_lookup'),
    path('current/', CurrentInstitutionView.as_view(), name='current_institution'),
    path('locations/', CampusLocationListView.as_view(), name='campus_locations'),
]

