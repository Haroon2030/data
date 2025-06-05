from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
import os

class Command(BaseCommand):
    help = 'إنشاء مستخدم مشرف إذا لم يكن موجودًا بالفعل'

    def handle(self, *args, **options):
        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123456')

        # التحقق من وجود المستخدم
        if not User.objects.filter(username=username).exists():
            self.stdout.write(f'إنشاء مستخدم مشرف: {username}')
            User.objects.create_superuser(username, email, password)
            self.stdout.write(self.style.SUCCESS(f'تم إنشاء المستخدم المشرف بنجاح!'))
        else:
            self.stdout.write(self.style.WARNING(f'المستخدم المشرف {username} موجود بالفعل.'))
