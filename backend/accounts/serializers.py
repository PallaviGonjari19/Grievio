from rest_framework import serializers
from .models import User, StudentProfile, StaffProfile

class UserSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    institution_code = serializers.CharField(source='institution.code', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'institution', 'institution_name', 'institution_code',
            'phone', 'approval_status', 'rejection_reason', 'is_verified', 'avatar'
        ]
        read_only_fields = ['id', 'approval_status', 'rejection_reason', 'is_verified']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    institution_code = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'institution_code']

    def create(self, validated_data):
        password = validated_data.pop('password')
        institution_code = validated_data.pop('institution_code', None)
        
        user = User(**validated_data)
        user.set_password(password)
        
        if institution_code:
            from institutions.models import Institution
            try:
                inst = Institution.objects.get(code__iexact=institution_code, is_active=True)
                user.institution = inst
            except Institution.DoesNotExist:
                raise serializers.ValidationError({"institution_code": "Invalid or inactive institution code."})
        
        user.save()
        return user

