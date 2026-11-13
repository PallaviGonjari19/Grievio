from django.urls import path
from .views import (
    ComplaintListCreateView,
    ComplaintDetailView,
    ComplaintStatusUpdateView,
    ComplaintCommentCreateView,
    ComplaintAttachmentUploadView
)

urlpatterns = [
    path('', ComplaintListCreateView.as_view(), name='complaint_list_create'),
    path('<int:pk>/', ComplaintDetailView.as_view(), name='complaint_detail'),
    path('<int:pk>/status/', ComplaintStatusUpdateView.as_view(), name='complaint_status_update'),
    path('<int:pk>/comments/', ComplaintCommentCreateView.as_view(), name='complaint_comment_create'),
    path('<int:pk>/attachments/', ComplaintAttachmentUploadView.as_view(), name='complaint_attachment_upload'),
]
