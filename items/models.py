from django.db import models

class Item(models.Model):
    name = models.CharField(max_length=255, verbose_name="اسم الصنف")
    barcode = models.CharField(max_length=20, verbose_name="رقم الباركود")
    package = models.CharField(max_length=100, verbose_name="العبوة")
    company = models.CharField(max_length=255, verbose_name="الشركة")
    submitter = models.CharField(max_length=255, verbose_name="المدخل المرسل")
    unit = models.CharField(max_length=100, verbose_name="وحدة الصنف")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإضافة")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "صنف"
        verbose_name_plural = "أصناف"
        ordering = ['-created_at']
