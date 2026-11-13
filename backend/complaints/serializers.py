from rest_framework import serializers
from .models import Complaint, ComplaintAttachment, ComplaintComment, ComplaintTimeline

class ComplaintAttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)

    class Meta:
        model = ComplaintAttachment
        fields = ['id', 'complaint', 'file', 'uploaded_by', 'uploaded_by_name', 'is_resolution_proof', 'uploaded_at']
        read_only_fields = ['uploaded_by']

class ComplaintCommentSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_role = serializers.CharField(source='author.role', read_only=True)

    class Meta:
        model = ComplaintComment
        fields = ['id', 'complaint', 'author', 'author_name', 'author_role', 'message', 'is_internal', 'created_at']
        read_only_fields = ['author']

class ComplaintTimelineSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source='actor.get_full_name', read_only=True)

    class Meta:
        model = ComplaintTimeline
        fields = ['id', 'complaint', 'actor', 'actor_name', 'action', 'notes', 'created_at']

class ComplaintListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.get_full_name', read_only=True)

    class Meta:
        model = Complaint
        fields = [
            'id', 'ticket_number', 'title', 'priority', 'status',
            'department', 'department_name', 'category', 'category_name',
            'student', 'student_name', 'assigned_staff', 'assigned_staff_name',
            'created_at', 'updated_at'
        ]

class ComplaintDetailSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    assigned_staff_name = serializers.CharField(source='assigned_staff.get_full_name', read_only=True)
    attachments = ComplaintAttachmentSerializer(many=True, read_only=True)
    comments = ComplaintCommentSerializer(many=True, read_only=True)
    timeline = ComplaintTimelineSerializer(many=True, read_only=True)

    class Meta:
        model = Complaint
        fields = '__all__'
        read_only_fields = ['ticket_number', 'institution', 'student', 'created_at', 'updated_at', 'resolved_at', 'closed_at']
