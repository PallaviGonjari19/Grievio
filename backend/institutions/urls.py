from django.urls import path
from .views import InstitutionLookupView, CurrentInstitutionView, CampusLocationListView

urlpatterns = [
    path('lookup/', InstitutionLookupView.as_view(), name='institution_lookup'),
    path('current/', CurrentInstitutionView.as_view(), name='current_institution'),
    path('locations/', CampusLocationListView.as_view(), name='campus_locations'),
]

