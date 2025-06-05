"""
إعدادات الملفات الثابتة للمشروع
هذا الملف يحتوي على دوال مساعدة وإعدادات لإدارة الملفات الثابتة في المشروع
"""

import os
from pathlib import Path

def find_static_files(directory):
    """
    البحث عن الملفات الثابتة في المجلد المحدد وإرجاع قائمة بها
    """
    static_files = []
    for root, dirs, files in os.walk(directory):
        for file in files:
            # تجاهل ملفات cache وملفات __pycache__
            if '__pycache__' not in root and '.pyc' not in file:
                static_files.append(os.path.join(root, file))
    
    return static_files

def get_static_file_config():
    """
    إرجاع إعدادات الملفات الثابتة
    """
    base_dir = Path(__file__).resolve().parent.parent
    
    return {
        'static_root': base_dir / 'staticfiles',
        'static_dirs': [base_dir / 'static'],
        'static_url': 'static/',
    }

def get_mime_types():
    """
    إرجاع قاموس بأنواع MIME للملفات المختلفة
    """
    return {
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.csv': 'text/csv',
        '.json': 'application/json',
        '.pdf': 'application/pdf',
        '.jpg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ttf': 'font/ttf',
        '.woff': 'font/woff',
        '.woff2': 'font/woff2',
    }
