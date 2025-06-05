// نظام إدارة الأصناف - الملف الرئيسي للجافا سكريبت
document.addEventListener('DOMContentLoaded', function() {
    // متغيرات الترتيب العامة
    let currentSortColumn = null;
    let currentSortDirection = 'asc';

    // إعداد نظام الترتيب التفاعلي
    initializeSorting();
    
    // تفعيل البحث السريع
    const quickSearchInput = document.getElementById('quickSearch');
    if (quickSearchInput) {
        quickSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            advancedSearch(searchTerm);
        });
    }
    
    // إعداد نظام الترتيب التفاعلي
    function initializeSorting() {
        const sortableHeaders = document.querySelectorAll('.sortable');
        
        sortableHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const sortType = this.getAttribute('data-sort');
                const columnIndex = Array.from(this.parentNode.children).indexOf(this);
                
                // تحديد اتجاه الترتيب
                if (currentSortColumn === columnIndex) {
                    currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    currentSortDirection = 'asc';
                }
                
                currentSortColumn = columnIndex;
                
                // تطبيق الترتيب
                sortTable(columnIndex, currentSortDirection, sortType);
                updateSortIcons(this, currentSortDirection);
            });
        });
    }

    // وظيفة ترتيب الجدول
    function sortTable(columnIndex, direction, sortType) {
        const tbody = document.getElementById('itemsTableBody');
        if (!tbody) return;
        
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            let aValue = a.children[columnIndex].getAttribute('data-sort-value') || a.children[columnIndex].textContent;
            let bValue = b.children[columnIndex].getAttribute('data-sort-value') || b.children[columnIndex].textContent;
            
            // معالجة أنواع البيانات المختلفة
            if (sortType === 'number') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            } else if (sortType === 'barcode') {
                aValue = parseInt(aValue) || 0;
                bValue = parseInt(bValue) || 0;
            } else {
                // ترتيب نصي باللغة العربية
                aValue = aValue.toString().toLowerCase();
                bValue = bValue.toString().toLowerCase();
            }
            
            let comparison = 0;
            if (aValue > bValue) {
                comparison = 1;
            } else if (aValue < bValue) {
                comparison = -1;
            }
            
            return direction === 'asc' ? comparison : -comparison;
        });
        
        // إعادة ترقيم الصفوف وإعادة ترتيبها
        rows.forEach((row, index) => {
            const numberCell = row.querySelector('.row-number');
            if (numberCell) {
                numberCell.textContent = index + 1;
            }
            tbody.appendChild(row);
        });
        
        // تأثير بصري للترتيب
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateX(20px)';
            
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateX(0)';
            }, index * 50);
        });
    }

    // تحديث أيقونات الترتيب
    function updateSortIcons(activeHeader, direction) {
        // إعادة تعيين جميع الأيقونات
        document.querySelectorAll('.sortable .sort-icon').forEach(icon => {
            icon.textContent = '↕️';
            icon.parentElement.classList.remove('sort-asc', 'sort-desc');
        });
        
        // تعيين الأيقونة النشطة
        const activeIcon = activeHeader.querySelector('.sort-icon');
        if (direction === 'asc') {
            activeIcon.textContent = '⬆️';
            activeHeader.classList.add('sort-asc');
        } else {
            activeIcon.textContent = '⬇️';
            activeHeader.classList.add('sort-desc');
        }
    }

    // وظيفة البحث المتقدم المحسنة
    function advancedSearch(searchTerm, columnIndex = null) {
        const rows = document.querySelectorAll('#itemsTableBody tr');
        let visibleCount = 0;
        
        rows.forEach((row, index) => {
            let searchText = '';
            
            if (columnIndex !== null) {
                // البحث في عمود محدد
                searchText = row.children[columnIndex].textContent.toLowerCase();
            } else {
                // البحث في جميع الأعمدة (باستثناء عمود الرقم)
                const cells = Array.from(row.children).slice(1); // تجاهل عمود الرقم
                searchText = cells.map(cell => cell.textContent).join(' ').toLowerCase();
            }
            
            const isVisible = searchText.includes(searchTerm.toLowerCase());
            
            // تأثير الإخفاء التدريجي
            if (isVisible) {
                row.style.display = '';
                row.style.opacity = '0';
                row.style.transform = 'translateY(10px)';
                
                setTimeout(() => {
                    row.style.transition = 'all 0.3s ease';
                    row.style.opacity = '1';
                    row.style.transform = 'translateY(0)';
                }, index * 50);
                
                visibleCount++;
                
                // تمييز النتائج
                if (searchTerm) {
                    highlightSearchTerm(row, searchTerm);
                }
            } else {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '0';
                row.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    row.style.display = 'none';
                }, 300);
            }
        });
        
        // تحديث عدد النتائج المرئية
        const totalCountElement = document.getElementById('totalCount');
        if (totalCountElement) {
            totalCountElement.textContent = `المجموع: ${visibleCount} عناصر`;
        }
    }
    
    // تمييز نتائج البحث
    function highlightSearchTerm(row, searchTerm) {
        if (!searchTerm) return;
        
        const cells = Array.from(row.children).slice(1); // تجاهل عمود الرقم
        cells.forEach(cell => {
            const originalText = cell.textContent;
            
            // إزالة التمييز السابق
            cell.innerHTML = originalText;
            
            if (originalText.toLowerCase().includes(searchTerm.toLowerCase())) {
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                cell.innerHTML = originalText.replace(regex, '<span class="highlight">$1</span>');
            }
        });
    }
});
