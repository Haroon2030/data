from django.shortcuts import render, get_object_or_404, redirect
from django.http import JsonResponse
from .models import Item
from django.core.paginator import Paginator

def item_list(request):
    """عرض قائمة الأصناف في الصفحة الرئيسية"""
    items = Item.objects.all()
    
    # البحث
    search_query = request.GET.get('search', '')
    if search_query:
        items = items.filter(name__icontains=search_query) | \
                items.filter(barcode__icontains=search_query) | \
                items.filter(company__icontains=search_query)
    
    # الترتيب
    sort_by = request.GET.get('sort_by', '-created_at')
    items = items.order_by(sort_by)
    
    # ترقيم الصفحات
    paginator = Paginator(items, 10)  # 10 عناصر في كل صفحة
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    return render(request, 'items/item_list.html', {
        'page_obj': page_obj,
        'search_query': search_query,
    })

def item_detail(request, pk):
    """عرض تفاصيل صنف محدد"""
    item = get_object_or_404(Item, pk=pk)
    return render(request, 'items/item_detail.html', {'item': item})

def item_create(request):
    """إضافة صنف جديد - تم تعطيل هذه الوظيفة للمستخدمين العاديين"""
    # رسالة تفيد بأن الإضافة غير مسموحة
    message = "غير مسموح بإضافة أصناف من واجهة المستخدم. يرجى التواصل مع المسؤول."
    
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'success': False, 
            'message': message
        }, status=403)
    
    # عرض صفحة الخطأ
    return render(request, 'items/permission_denied.html', {
        'message': message,
        'title': 'غير مسموح'
    })

def item_delete(request, pk):
    """حذف صنف محدد - تم تعطيل هذه الوظيفة للمستخدمين العاديين"""
    # رسالة تفيد بأن الحذف غير مسموح
    message = "غير مسموح بحذف الأصناف من واجهة المستخدم. يرجى التواصل مع المسؤول."
    
    if request.headers.get('x-requested-with') == 'XMLHttpRequest':
        return JsonResponse({
            'success': False, 
            'message': message
        }, status=403)
    
    # عرض صفحة الخطأ
    return render(request, 'items/permission_denied.html', {
        'message': message,
        'title': 'غير مسموح'
    })

def api_items(request):
    """واجهة برمجية للحصول على قائمة الأصناف بتنسيق JSON"""
    items = Item.objects.all()
    items_data = [{
        'id': item.id,
        'name': item.name,
        'barcode': item.barcode,
        'package': item.package,
        'company': item.company,
        'submitter': item.submitter,
        'unit': item.unit,
    } for item in items]
    
    return JsonResponse({'items': items_data})
