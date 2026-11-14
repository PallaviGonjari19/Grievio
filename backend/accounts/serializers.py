from rest_framework import serializers
from .models import User, StudentProfile, StaffProfile, UserRole, ApprovalStatus

class UserSerializer(serializers.ModelSerializer):
    institution_name = serializers.CharField(source='institution.name', read_only=True)
    institution_code = serializers.CharField(source='institution.code', read_only=True)
    department_id = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'institution', 'institution_name', 'institution_code',
            'department_id', 'department_name',
            'phone', 'approval_status', 'rejection_reason', 'is_verified', 'avatar'
        ]
        read_only_fields = ['id', 'approval_status', 'rejection_reason', 'is_verified']

    def get_department_id(self, obj):
        if hasattr(obj, 'staff_profile') and obj.staff_profile.department:
            return obj.staff_profile.department.id
        if hasattr(obj, 'student_profile') and obj.student_profile.department:
            return obj.student_profile.department.id
        return None

    def get_department_name(self, obj):
        if hasattr(obj, 'staff_profile') and obj.staff_profile.department:
            return obj.staff_profile.department.name
        if hasattr(obj, 'student_profile') and obj.student_profile.department:
            return obj.student_profile.department.name
        return None

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    institution_code = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(
        choices=[UserRole.STUDENT, UserRole.STAFF],
        default=UserRole.STUDENT,
        help_text="Self-registration is restricted to Student or Staff roles only."
    )

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 'role', 'institution_code']

    def validate_role(self, value):
        if value not in [UserRole.STUDENT, UserRole.STAFF]:
            raise serializers.ValidationError("Direct registration for administrative roles is prohibited.")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        institution_code = validated_data.pop('institution_code')
        
        # Enforce initial pending approval status for all self-registrations
        user = User(**validated_data)
        user.set_password(password)
        user.approval_status = ApprovalStatus.PENDING
        user.is_verified = False
        
        from institutions.models import Institution
        try:
            inst = Institution.objects.get(code__iexact=institution_code.strip(), is_active=True)
            user.institution = inst
        except Institution.DoesNotExist:
            raise serializers.ValidationError({"institution_code": "Invalid, inactive, or suspended institution code."})
        
        user.save()
        return user

