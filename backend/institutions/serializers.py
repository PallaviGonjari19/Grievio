from rest_framework import serializers
from .models import Institution, CampusLocation

class InstitutionPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ['id', 'name', 'code', 'slug', 'website', 'logo', 'is_active']

class InstitutionDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = '__all__'

class CampusLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampusLocation
        fields = ['id', 'institution', 'block_name', 'floor', 'room_number', 'description']

