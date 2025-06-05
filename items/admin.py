from django.contrib import admin
from .models import Item

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'barcode', 'package', 'company', 'submitter', 'unit')
    list_filter = ('company', 'unit')
    search_fields = ('name', 'barcode', 'company')
    ordering = ('-created_at',)
