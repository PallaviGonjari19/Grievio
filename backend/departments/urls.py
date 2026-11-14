from django.urls import path
from .views import DepartmentListView, DepartmentDetailView, DepartmentCategoriesListView, CategoryListView

urlpatterns = [
    path('', DepartmentListView.as_view(), name='department_list'),
    path('categories/', CategoryListView.as_view(), name='category_list'),
    path('<int:pk>/', DepartmentDetailView.as_view(), name='department_detail'),
    path('<int:department_id>/categories/', DepartmentCategoriesListView.as_view(), name='department_categories'),
]

