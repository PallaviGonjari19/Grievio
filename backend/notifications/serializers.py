from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    complaint_ticket = serializers.CharField(source='complaint.ticket_number', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'title', 'message', 'complaint', 'complaint_ticket', 'is_read', 'created_at']
        read_only_fields = ['recipient', 'created_at']

