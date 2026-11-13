from django.contrib import admin
from .models import Complaint, ComplaintAttachment, ComplaintComment, ComplaintTimeline

class ComplaintAttachmentInline(admin.TabularInline):
    model = ComplaintAttachment
    extra = 0

class ComplaintCommentInline(admin.TabularInline):
    model = ComplaintComment
    extra = 0

class ComplaintTimelineInline(admin.TabularInline):
    model = ComplaintTimeline
    extra = 0
    readonly_fields = ('created_at',)

@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = ('ticket_number', 'title', 'institution', 'department', 'priority', 'status', 'created_at')
    list_filter = ('institution', 'status', 'priority', 'department')
    search_fields = ('ticket_number', 'title', 'description', 'student__username')
    inlines = [ComplaintAttachmentInline, ComplaintCommentInline, ComplaintTimelineInline]

@admin.register(ComplaintAttachment)
class ComplaintAttachmentAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'file', 'uploaded_by', 'is_resolution_proof', 'uploaded_at')

@admin.register(ComplaintComment)
class ComplaintCommentAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'author', 'is_internal', 'created_at')
    list_filter = ('is_internal',)

@admin.register(ComplaintTimeline)
class ComplaintTimelineAdmin(admin.ModelAdmin):
    list_display = ('complaint', 'actor', 'action', 'created_at')
