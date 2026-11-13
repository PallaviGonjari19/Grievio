"""
URL configuration for Grievio Core project.
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.db import connection

def health_check(request):
    """System health check endpoint for Web, Mobile, and Load Balancers."""
    db_status = "ok"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return JsonResponse({
        "status": "online" if db_status == "ok" else "degraded",
        "service": "Grievio Core API",
        "version": "1.0.0",
        "database": db_status,
        "multi_tenant": True,
        "endpoints": {
            "auth": "/api/v1/accounts/",
            "institutions": "/api/v1/institutions/",
            "departments": "/api/v1/departments/",
            "complaints": "/api/v1/complaints/",
            "notifications": "/api/v1/notifications/",
            "reporting": "/api/v1/reporting/",
        }
    })

def api_root(request):
    """API Index and discovery endpoint."""
    return JsonResponse({
        "name": "Grievio REST API",
        "version": "v1",
        "description": "Multi-institution Campus Grievance and Maintenance Platform",
        "endpoints": {
            "health": "/api/health/",
            "accounts": "/api/v1/accounts/",
            "institutions": "/api/v1/institutions/",
            "departments": "/api/v1/departments/",
            "complaints": "/api/v1/complaints/",
            "notifications": "/api/v1/notifications/",
            "reporting": "/api/v1/reporting/",
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health_check'),
    path('api/v1/', api_root, name='api_root'),
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/institutions/', include('institutions.urls')),
    path('api/v1/departments/', include('departments.urls')),
    path('api/v1/complaints/', include('complaints.urls')),
    path('api/v1/notifications/', include('notifications.urls')),
    path('api/v1/reporting/', include('reporting.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

