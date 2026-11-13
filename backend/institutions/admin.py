from django.contrib import admin
from .models import Institution, CampusLocation

@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('name', 'code', 'status', 'contact_email', 'is_active', 'created_at')
    search_fields = ('name', 'code', 'contact_email')
    list_filter = ('status', 'is_active')

@admin.register(CampusLocation)
class CampusLocationAdmin(admin.ModelAdmin):
    list_display = ('institution', 'block_name', 'floor', 'room_number')
    search_fields = ('block_name', 'room_number', 'institution__name')
    list_filter = ('institution', 'block_name')

