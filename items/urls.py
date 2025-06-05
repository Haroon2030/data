from django.urls import path
from . import views

urlpatterns = [
    path('', views.item_list, name='item_list'),
    path('items/<int:pk>/', views.item_detail, name='item_detail'),
    path('items/create/', views.item_create, name='item_create'),
    path('items/<int:pk>/delete/', views.item_delete, name='item_delete'),
    path('api/items/', views.api_items, name='api_items'),
]
