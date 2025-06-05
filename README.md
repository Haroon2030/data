# إعداد وتشغيل تطبيق إدارة الأصناف

## المتطلبات الأساسية
- Python 3.8 أو أعلى
- PostgreSQL (إذا كنت تستخدم قاعدة البيانات محلياً) أو الاتصال بقاعدة البيانات الخارجية

## خطوات التثبيت والتشغيل

### 1. إنشاء بيئة افتراضية وتفعيلها

```bash
# إنشاء البيئة الافتراضية
python -m venv venv

# تفعيل البيئة الافتراضية (Windows)
venv\Scripts\activate

# تفعيل البيئة الافتراضية (Linux/Mac)
# source venv/bin/activate
```

### 2. تثبيت المكتبات المطلوبة

```bash
pip install -r requirements.txt
```

### 3. تكوين إعدادات البيئة
- يمكن تعديل الإعدادات من خلال ملف `.env` الموجود في مجلد المشروع.
- بشكل افتراضي، المشروع يستخدم قاعدة بيانات PostgreSQL الخارجية.

### 4. تطبيق التعديلات على قاعدة البيانات

```bash
python manage.py migrate
```

### 5. إنشاء مستخدم مسؤول (إذا لزم الأمر)

```bash
python manage.py createsuperuser
```

### 6. جمع الملفات الثابتة

```bash
python manage.py collectstatic --noinput
```

### 7. تشغيل خادم التطوير

```bash
python manage.py runserver
```

## النشر على منصة Render

### 1. إنشاء حساب على منصة Render
- قم بإنشاء حساب على [منصة Render](https://render.com)

### 2. ربط مستودع Git
- قم بإنشاء مستودع جديد على GitHub أو GitLab
- قم برفع المشروع إلى المستودع:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <رابط_المستودع>
git push -u origin main
```

### 3. النشر التلقائي عبر Render
- اذهب إلى لوحة التحكم في منصة Render
- انقر على "New" واختر "Blueprint" من القائمة
- اختر مستودعك من القائمة
- سيكتشف Render ملف `render.yaml` وسيقوم بإعداد كل الموارد المطلوبة:
  - خدمة الويب (تطبيق Django)
  - قاعدة بيانات PostgreSQL باسم "mydata"

### 4. الترحيلات وإعداد قاعدة البيانات
- بعد إكمال النشر، يمكنك تشغيل الترحيلات باستخدام وحدة تحكم Shell:
```bash
python manage.py migrate
python manage.py createsuperuser
```

```bash
python manage.py runserver
```

الآن يمكنك الوصول إلى التطبيق على العنوان: [http://127.0.0.1:8000](http://127.0.0.1:8000)

ولوحة الإدارة على: [http://127.0.0.1:8000/admin](http://127.0.0.1:8000/admin)

## نشر التطبيق على Render.com

هذا المشروع مجهز للنشر المباشر على منصة Render.com من خلال ملف `render.yaml`.

### خطوات النشر:
1. قم بإنشاء حساب على [Render.com](https://render.com) إذا لم يكن لديك واحد.
2. قم بربط مستودع GitHub الخاص بك بحساب Render.
3. اختر "Blueprint" كنوع النشر واختر المستودع.
4. سيتم نشر التطبيق تلقائياً باستخدام الإعدادات المحددة في ملف `render.yaml`.

### إعداد المتغيرات البيئية على Render
يتم تعيين المتغيرات البيئية تلقائياً من ملف `render.yaml`، ولكن يمكنك تعديلها من لوحة تحكم Render إذا لزم الأمر.

## استخدام قاعدة البيانات الخارجية
المشروع مكوّن للاتصال بقاعدة بيانات PostgreSQL خارجية. تأكد من أن البيانات التالية متوفرة:
- اسم المضيف: dpg-d0qadt3e5dus739d9u1g-a.oregon-postgres.render.com
- اسم المستخدم: root
- كلمة المرور: wm8DJf5OonMfmaXlLGzICvBE84V0Y9ir
- اسم قاعدة البيانات: mydata_db
