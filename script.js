// نظام إدارة الأصناف - الملف الرئيسي للجافا سكريبت
// وظيفة للتحقق من توفر مكتبة Excel وتحميلها عند الحاجة
function checkExcelLibrary() {
    try {
        if (typeof XLSX === 'undefined') {
            console.warn('مكتبة XLSX.js غير متوفرة. جاري محاولة تحميلها من النسخة الاحتياطية.');
            
            // محاولة تحميل المكتبة من CDN
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
                script.onload = function() {
                    console.log('تم تحميل مكتبة XLSX من CDN بنجاح');
                    resolve(true);
                };
                script.onerror = function(err) {
                    console.error('فشل تحميل مكتبة XLSX من CDN', err);
                    reject(err);
                };
                document.head.appendChild(script);
            });
        } else {
            console.log('مكتبة XLSX متوفرة بالفعل');
            return Promise.resolve(true);
        }
    } catch (e) {
        console.error('خطأ في التحقق من مكتبة XLSX', e);
        return Promise.reject(e);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // التحقق من وجود مكتبة XLSX والتعامل مع الخطأ بشكل أفضل
    checkExcelLibrary().catch(error => {
        console.error('لم يتم تحميل مكتبة XLSX.js:', error);
        
        // إنشاء عنصر لعرض رسالة الخطأ في واجهة المستخدم
        const errorAlert = document.createElement('div');
        errorAlert.className = 'excel-library-error alert alert-warning';
        errorAlert.innerHTML = `
            <strong>تنبيه:</strong> مكتبة Excel غير متوفرة. 
            <button class="btn btn-sm btn-warning ms-2" onclick="location.reload()">إعادة تحميل</button>
        `;
        document.querySelector('.table-container').prepend(errorAlert);
        
        // تعطيل زر التصدير إلى Excel
        const excelButton = document.querySelector('button[onclick="window.TableManager.exportExcel()"]');
        if (excelButton) {
            excelButton.disabled = true;
            excelButton.title = "مكتبة Excel غير متوفرة حالياً";
        }
    });

    // متغيرات الترتيب العامة
    let currentSortColumn = null;
    let currentSortDirection = 'asc';

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
        
        // عرض رسالة إذا لم توجد نتائج
        showNoResultsMessage(visibleCount, searchTerm);
        
        // عرض عدد النتائج
        updateSearchResultsCount(visibleCount, searchTerm);
    }

    // عرض رسالة عدم وجود نتائج
    function showNoResultsMessage(count, searchTerm) {
        let noResultsRow = document.getElementById('no-results-row');
        
        if (count === 0 && searchTerm) {
            if (!noResultsRow) {
                noResultsRow = document.createElement('tr');
                noResultsRow.id = 'no-results-row';
                noResultsRow.innerHTML = `
                    <td colspan="7" class="text-center py-5">
                        <div class="no-results-message">
                            <i style="font-size: 3rem; color: #6c757d;">🔍</i>
                            <h5 class="mt-3 text-muted">لا توجد نتائج</h5>
                            <p class="text-muted">لم يتم العثور على أي عناصر تطابق البحث: "<strong>${searchTerm}</strong>"</p>
                        </div>
                    </td>
                `;
                document.getElementById('itemsTableBody').appendChild(noResultsRow);
            } else {
                noResultsRow.querySelector('strong').textContent = searchTerm;
                noResultsRow.style.display = '';
            }
        } else if (noResultsRow) {
            noResultsRow.style.display = 'none';
        }
    }

    // تمييز نص البحث
    function highlightSearchTerm(row, searchTerm) {
        if (!searchTerm) return;
        
        const cells = row.querySelectorAll('td:not(.row-number)');
        cells.forEach(cell => {
            const originalText = cell.getAttribute('data-original-text') || cell.textContent;
            cell.setAttribute('data-original-text', originalText);
            
            const regex = new RegExp(`(${searchTerm})`, 'gi');
            const highlightedText = originalText.replace(regex, '<mark class="search-highlight">$1</mark>');
            cell.innerHTML = highlightedText;
            
            setTimeout(() => {
                cell.innerHTML = originalText;
            }, 3000);
        });
    }

    // عرض عدد نتائج البحث
    function updateSearchResultsCount(count, searchTerm) {
        let resultDiv = document.getElementById('search-results');
        if (!resultDiv) {
            resultDiv = document.createElement('div');
            resultDiv.id = 'search-results';
            resultDiv.className = 'search-results-info';
            document.querySelector('.table-container').insertBefore(resultDiv, document.querySelector('.table-responsive'));
        }
        
        if (searchTerm) {
            resultDiv.innerHTML = `<span class="badge bg-info">تم العثور على ${count} نتيجة للبحث: "${searchTerm}"</span>`;
        } else {
            resultDiv.innerHTML = '';
        }
    }

    // تصدير البيانات (CSV)
    function exportToCSV() {
        const table = document.querySelector('table');
        const rows = table.querySelectorAll('tr');
        let csvContent = '\uFEFF'; // BOM للدعم العربي
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('th, td');
            const rowData = Array.from(cells).map(cell => {
                return '"' + cell.textContent.replace(/"/g, '""') + '"';
            });
            csvContent += rowData.join(',') + '\n';
        });
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'جدول_الأصناف_' + new Date().toISOString().split('T')[0] + '.csv';
        link.click();
    }
    
    // تصدير البيانات إلى Excel
    window.exportToExcel = function() {
        try {
            // التحقق من وجود مكتبة XLSX
            if (typeof XLSX === 'undefined') {
                // محاولة إعادة تحميل المكتبة من CDN
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
                script.onload = function() {
                    console.log('تم تحميل مكتبة XLSX من CDN بنجاح');
                    
                    // إزالة رسالة الخطأ إن وجدت
                    const errorAlert = document.querySelector('.excel-library-error');
                    if (errorAlert) errorAlert.remove();
                    
                    // تفعيل زر التصدير مرة أخرى
                    const excelButton = document.querySelector('button[onclick="window.TableManager.exportExcel()"]');
                    if (excelButton) {
                        excelButton.disabled = false;
                        excelButton.title = "تصدير جدول البيانات إلى ملف Excel";
                    }
                    
                    // استدعاء وظيفة التصدير بعد تحميل المكتبة
                    window.exportToExcel();
                };
                script.onerror = function() {
                    alert('تعذر تحميل مكتبة XLSX. يرجى التحقق من اتصال الإنترنت أو تثبيت المكتبة محلياً.');
                };
                document.head.appendChild(script);
                return;
            }
            
            // إظهار رسالة تحميل
            const loadingEl = document.createElement('div');
            loadingEl.className = 'excel-export-loading';
            loadingEl.innerHTML = '<div class="spinner"></div><p>جاري تجهيز ملف إكسل...</p>';
            document.body.appendChild(loadingEl);
            
            // تحضير الجدول للتصدير
            const table = document.querySelector('table');
            
            // تجهيز بيانات الجدول
            let tableData = [];
            
            // استخراج عناوين الأعمدة وتنسيقها
            const headers = [];
            table.querySelectorAll('thead th').forEach(th => {
                // استخراج النص بدون رموز الترتيب
                let headerText = th.textContent.replace(/[↕️⬆️⬇️]/g, '').trim();
                headers.push(headerText);
            });
            tableData.push(headers);
            
            // استخراج بيانات الصفوف
            table.querySelectorAll('tbody tr').forEach(row => {
                if (row.style.display !== 'none' && !row.id?.includes('no-results')) { // تصدير الصفوف المرئية فقط
                    const rowData = [];
                    row.querySelectorAll('td').forEach(cell => {
                        rowData.push(cell.textContent.trim());
                    });
                    tableData.push(rowData);
                }
            });
            
            setTimeout(() => {
                // إنشاء ورقة عمل Excel
                const worksheet = XLSX.utils.aoa_to_sheet(tableData);
                
                // تعديل عرض الأعمدة
                const columnWidths = headers.map(h => ({ wch: Math.max(20, h.length * 1.5) }));
                worksheet['!cols'] = columnWidths;
                
                // تنسيق الخلايا
                const range = XLSX.utils.decode_range(worksheet['!ref']);
                for(let R = range.s.r; R <= range.e.r; ++R) {
                    for(let C = range.s.c; C <= range.e.c; ++C) {
                        const cell_address = {c:C, r:R};
                        const cell_ref = XLSX.utils.encode_cell(cell_address);
                        if(!worksheet[cell_ref]) continue;
                        
                        // تنسيق صف الترويسة
                        if(R === 0) {
                            worksheet[cell_ref].s = {
                                font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
                                fill: { fgColor: { rgb: "667EEA" } },
                                alignment: { horizontal: "center", vertical: "center", wrapText: true }
                            };
                        } else {
                            // تنسيق الصفوف المتناوبة
                            worksheet[cell_ref].s = {
                                font: { sz: 11 },
                                alignment: { horizontal: "right", vertical: "center" },
                                fill: { fgColor: { rgb: R % 2 ? "F9F9F9" : "FFFFFF" } },
                                border: { top: {style:"thin"}, bottom: {style:"thin"}, right: {style:"thin"}, left: {style:"thin"} }
                            };
                        }
                    }
                }
                
                // إضافة بيانات إضافية أعلى الجدول
                XLSX.utils.sheet_add_aoa(worksheet, [
                    ["نظام إدارة الأصناف"],
                    ["تاريخ التصدير: " + new Date().toLocaleDateString('ar')],
                    [""]
                ], { origin: "A1" });
                
                // تنسيق عنوان التقرير
                worksheet.A1.s = {
                    font: { bold: true, sz: 16, color: { rgb: "333333" } },
                    alignment: { horizontal: "center" }
                };
                worksheet.A2.s = {
                    font: { sz: 11, color: { rgb: "666666" } },
                    alignment: { horizontal: "center" }
                };
                
                // دمج الخلايا للعنوان
                if(!worksheet['!merges']) worksheet['!merges'] = [];
                worksheet['!merges'].push(
                    {s: {r:0, c:0}, e: {r:0, c:headers.length-1}},
                    {s: {r:1, c:0}, e: {r:1, c:headers.length-1}}
                );
                
                // إنشاء مصنف Excel
                const workbook = XLSX.utils.book_new();
                workbook.Props = {
                    Title: "جدول الأصناف",
                    Subject: "بيانات الأصناف",
                    Author: "نظام إدارة الأصناف",
                    CreatedDate: new Date()
                };
                
                XLSX.utils.book_append_sheet(workbook, worksheet, "الأصناف");
                
                // تطبيق الاتجاه من اليمين إلى اليسار للغة العربية
                worksheet["!dir"] = "rtl";
                
                // تحميل الملف
                const today = new Date().toISOString().split('T')[0];
                const filename = `جدول_الأصناف_${today}.xlsx`;
                XLSX.writeFile(workbook, filename);
                
                // إزالة شاشة التحميل
                document.body.removeChild(loadingEl);
                
                // إظهار رسالة نجاح
                const successMsg = document.createElement('div');
                successMsg.className = 'excel-export-success';
                successMsg.textContent = `تم تصدير البيانات بنجاح: ${filename}`;
                document.querySelector('.table-container').prepend(successMsg);
                
                setTimeout(() => {
                    successMsg.style.opacity = '0';
                    setTimeout(() => successMsg.remove(), 500);
                }, 3000);
                
            }, 100); // إضافة تأخير قصير لإظهار شاشة التحميل
            
        } catch(e) {
            console.error('خطأ في تصدير ملف إكسل:', e);
            alert('حدث خطأ أثناء تصدير البيانات إلى إكسل');
            
            // إزالة شاشة التحميل في حالة الخطأ
            const loadingEl = document.querySelector('.excel-export-loading');
            if (loadingEl) document.body.removeChild(loadingEl);
        }
    }

    // طباعة الجدول
    function printTable() {
        const printWindow = window.open('', '', 'height=600,width=800');
        const tableHTML = document.querySelector('.table-container').outerHTML;
        
        printWindow.document.write(`
            <html dir="rtl">
            <head>
                <title>طباعة جدول الأصناف</title>
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.rtl.min.css" rel="stylesheet">
                <link rel="stylesheet" href="style.css">
                <style>
                    body { font-family: 'Cairo', Arial; }
                    @media print {
                        .no-print { display: none !important; }
                        table { page-break-inside: auto; }
                        tr { page-break-inside: avoid; page-break-after: auto; }
                    }
                </style>
            </head>
            <body>
                <h2 style="text-align: center; margin-bottom: 20px;">نظام إدارة الأصناف</h2>
                ${tableHTML}
                <p style="text-align: center; margin-top: 20px; font-size: 12px;">
                    تاريخ الطباعة: ${new Date().toLocaleDateString('ar-SA')}
                </p>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    }

    // تهيئة النظام
    initializeSorting();
    
    // إعداد البحث السريع
    const searchInput = document.getElementById('quickSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            advancedSearch(searchTerm);
            updateTotalCount();
        });
        
        // مسح البحث عند الضغط على Escape
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                this.value = '';
                advancedSearch('');
                updateTotalCount();
            }
        });
    }
    
    // تحديث عداد العناصر
    function updateTotalCount() {
        const visibleRows = document.querySelectorAll('#itemsTableBody tr:not([style*="display: none"])');
        const totalRows = document.querySelectorAll('#itemsTableBody tr');
        const countBadge = document.getElementById('totalCount');
        
        if (countBadge) {
            if (visibleRows.length === totalRows.length) {
                countBadge.textContent = `المجموع: ${totalRows.length} عنصر`;
                countBadge.className = 'badge bg-info';
            } else {
                countBadge.textContent = `المجموع: ${visibleRows.length} من ${totalRows.length} عنصر`;
                countBadge.className = 'badge bg-warning';
            }
        }
    }
    
    // تحديث العداد عند التحميل
    updateTotalCount();
    // تأثير التحميل للجدول
    const tableContainer = document.querySelector('.table-container');
    tableContainer.classList.add('loading');
    
    setTimeout(() => {
        tableContainer.classList.remove('loading');
    }, 1000);

    // تأثير الظهور التدريجي للصفوف
    const rows = document.querySelectorAll('#itemsTableBody tr');
    rows.forEach((row, index) => {
        row.style.opacity = '0';
        row.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            row.style.transition = 'all 0.5s ease';
            row.style.opacity = '1';
            row.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });

    // تأثير التمرير السلس للجدول
    const table = document.querySelector('.table-responsive');
    let isScrolling = false;
    
    table.addEventListener('wheel', function(e) {
        if (!isScrolling) {
            isScrolling = true;
            this.style.scrollBehavior = 'smooth';
            
            setTimeout(() => {
                isScrolling = false;
                this.style.scrollBehavior = 'auto';
            }, 500);
        }
    });

    // تأثير النقر على الصفوف
    rows.forEach(row => {
        row.addEventListener('click', function() {
            // إزالة التحديد من جميع الصفوف
            rows.forEach(r => r.classList.remove('selected'));
            
            // تحديد الصف المنقور
            this.classList.add('selected');
            
            // تأثير بصري للتحديد
            this.style.background = 'linear-gradient(90deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2))';
            this.style.borderRight = '4px solid #667eea';
            
            setTimeout(() => {
                this.style.background = '';
                this.style.borderRight = '';
            }, 2000);
        });
    });

    // تأثير البحث السريع (للاستخدام المستقبلي)
    function quickSearch(searchTerm) {
        const rows = document.querySelectorAll('#itemsTableBody tr');
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            const isVisible = text.includes(searchTerm.toLowerCase());
            
            row.style.display = isVisible ? '' : 'none';
            
            if (isVisible && searchTerm) {
                row.style.background = 'rgba(255, 193, 7, 0.1)';
                setTimeout(() => {
                    row.style.background = '';
                }, 1000);
            }
        });
    }

    // إضافة أرقام الصفوف تلقائياً
    function addRowNumbers() {
        const rows = document.querySelectorAll('#itemsTableBody tr');
        rows.forEach((row, index) => {
            if (!row.querySelector('.row-number')) {
                const numberCell = document.createElement('td');
                numberCell.classList.add('row-number');
                numberCell.textContent = index + 1;
                numberCell.style.fontWeight = 'bold';
                numberCell.style.background = 'rgba(102, 126, 234, 0.1)';
                numberCell.style.color = '#667eea';
                row.insertBefore(numberCell, row.firstChild);
            }
        });
    }

    // إضافة عمود الأرقام للجدول (تم تعديله لدعم الترتيب)
    const headerRow = document.querySelector('thead tr');
    if (headerRow && !headerRow.querySelector('.number-header')) {
        // العمود موجود بالفعل في HTML
        updateRowNumbers();
    }

    // تحديث أرقام الصفوف
    function updateRowNumbers() {
        const rows = document.querySelectorAll('#itemsTableBody tr');
        rows.forEach((row, index) => {
            const numberCell = row.querySelector('.row-number');
            if (numberCell) {
                numberCell.textContent = index + 1;
            }
        });
    }

    // تأثير للتمرير لأعلى عند النقر على العنوان
    document.querySelector('.header h1').addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // تأثير لحفظ آخر موضع تمرير
    window.addEventListener('beforeunload', function() {
        localStorage.setItem('scrollPosition', window.scrollY);
    });

    // استعادة موضع التمرير
    const savedScrollPosition = localStorage.getItem('scrollPosition');
    if (savedScrollPosition) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedScrollPosition));
        }, 100);
    }

    // إعداد ترقيم الصفحات
    initializePagination();

    // وظائف ترقيم الصفحات
    function initializePagination() {
        const itemsPerPage = 5;
        let currentPage = 1;
        const rows = document.querySelectorAll('#itemsTableBody tr');
        const totalPages = Math.ceil(rows.length / itemsPerPage);
        
        // إنشاء عناصر ترقيم الصفحات
        updatePagination(totalPages, currentPage);
        
        // عرض الصفحة الأولى
        showPage(currentPage, rows, itemsPerPage);
        
        // إضافة مستمعي الأحداث لأزرار الترقيم
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('page-link')) {
                e.preventDefault();
                const pageNum = e.target.textContent;
                
                if (pageNum === 'السابق') {
                    if (currentPage > 1) {
                        currentPage--;
                        showPage(currentPage, rows, itemsPerPage);
                        updatePagination(totalPages, currentPage);
                    }
                } else if (pageNum === 'التالي') {
                    if (currentPage < totalPages) {
                        currentPage++;
                        showPage(currentPage, rows, itemsPerPage);
                        updatePagination(totalPages, currentPage);
                    }
                } else {
                    currentPage = parseInt(pageNum);
                    showPage(currentPage, rows, itemsPerPage);
                    updatePagination(totalPages, currentPage);
                }
                
                // تحريك للأعلى قليلاً لرؤية الجدول
                const tableTop = document.querySelector('.table-container').offsetTop;
                window.scrollTo({top: tableTop - 50, behavior: 'smooth'});
            }
        });
    }
    
    // عرض صفحة محددة من الجدول
    function showPage(page, rows, itemsPerPage) {
        // إخفاء كافة الصفوف أولاً
        rows.forEach(row => {
            row.style.display = 'none';
        });
        
        // حساب نطاق الصفوف للصفحة الحالية
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        
        // عرض الصفوف المناسبة للصفحة الحالية
        for (let i = startIndex; i < endIndex && i < rows.length; i++) {
            rows[i].style.display = '';
            
            // تأثير ظهور تدريجي للصفوف
            rows[i].style.opacity = '0';
            rows[i].style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                rows[i].style.transition = 'all 0.3s ease';
                rows[i].style.opacity = '1';
                rows[i].style.transform = 'translateY(0)';
            }, (i - startIndex) * 70);
        }
        
        // تحديث عداد الأصناف المعروضة
        updateTotalCount();
        
        // إعادة ترقيم الصفوف
        for (let i = 0; i < rows.length; i++) {
            const cell = rows[i].querySelector('.row-number');
            if (cell) {
                cell.textContent = i + 1;
            }
        }
    }
    
    // تحديث أزرار الترقيم
    function updatePagination(totalPages, currentPage) {
        const paginationUl = document.querySelector('.pagination');
        if (!paginationUl) return;
        
        // إنشاء أزرار ترقيم الصفحات
        let html = `
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#">السابق</a>
            </li>
        `;
        
        // إضافة ترقيم الصفحات
        for (let i = 1; i <= totalPages; i++) {
            html += `
                <li class="page-item ${currentPage === i ? 'active' : ''}">
                    <a class="page-link" href="#">${i}</a>
                </li>
            `;
        }
        
        // إضافة زر التالي
        html += `
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#">التالي</a>
            </li>
        `;
        
        paginationUl.innerHTML = html;
        
        // تأثير انتقالي للأزرار
        const pageLinks = document.querySelectorAll('.page-link');
        pageLinks.forEach((link, index) => {
            link.style.opacity = '0';
            link.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                link.style.transition = 'all 0.3s ease';
                link.style.opacity = '1';
                link.style.transform = 'scale(1)';
            }, index * 50);
        });
    }
});

// وظائف للباك إند (للاستخدام المستقبلي)
const DataManager = {
    // إضافة صنف جديد
    addItem: function(itemData) {
        // سيتم ربطه مع API لاحقاً
        console.log('إضافة صنف جديد:', itemData);
        // إعادة ترقيم الصفوف بعد الإضافة
        setTimeout(updateRowNumbers, 100);
    },
    
    // تحديث صنف
    updateItem: function(itemId, itemData) {
        // سيتم ربطه مع API لاحقاً
        console.log('تحديث الصنف:', itemId, itemData);
    },
    
    // حذف صنف
    deleteItem: function(itemId) {
        // سيتم ربطه مع API لاحقاً
        console.log('حذف الصنف:', itemId);
        // إعادة ترقيم الصفوف بعد الحذف
        setTimeout(updateRowNumbers, 100);
    },
    
    // جلب جميع الأصناف
    fetchItems: function() {
        // سيتم ربطه مع API لاحقاً
        console.log('جلب جميع الأصناف');
    },
    
    // ترتيب البيانات
    sortItems: function(column, direction) {
        console.log('ترتيب البيانات:', column, direction);
    },
    
    // البحث في البيانات
    searchItems: function(searchTerm, column = null) {
        console.log('البحث في البيانات:', searchTerm, column);
    },
    
    // تصدير البيانات
    exportData: function(format = 'csv') {
        if (format === 'csv') {
            window.TableManager.export();
        }
    },
    
    // طباعة البيانات
    printData: function() {
        window.TableManager.print();
    }
};

// إضافة وظائف عامة للنافذة (للاستخدام الخارجي)
window.TableManager = {
    search: function(searchTerm, columnIndex = null) {
        // سنعتمد على الوظيفة المعرفة داخل حدث DOMContentLoaded
        if (typeof advancedSearch !== 'undefined') {
            advancedSearch(searchTerm, columnIndex);
        }
    },
    sort: function(columnIndex, direction, sortType) {
        // سنعتمد على الوظيفة المعرفة داخل حدث DOMContentLoaded
        if (typeof sortTable !== 'undefined') {
            sortTable(columnIndex, direction, sortType);
        }
    },
    export: function() {
        // سنعتمد على الوظيفة المعرفة داخل حدث DOMContentLoaded
        if (typeof exportToCSV !== 'undefined') {
            exportToCSV();
        }
    },
    exportExcel: function() {
        // التحقق من وجود وظيفة التصدير ومكتبة XLSX
        if (typeof window.exportToExcel === 'function') {
            // استدعاء وظيفة التصدير مباشرة
            window.exportToExcel();
        } else if (typeof exportToExcel === 'function') {
            // بديل في حالة وجود الوظيفة في نطاق مختلف
            exportToExcel();
        } else {
            console.error('وظيفة التصدير إلى Excel غير متوفرة');
            alert('تعذر العثور على وظيفة التصدير إلى Excel. يرجى التأكد من تحميل الصفحة بشكل صحيح.');
        }
    },
    print: function() {
        // سنعتمد على الوظيفة المعرفة داخل حدث DOMContentLoaded
        if (typeof printTable !== 'undefined') {
            printTable();
        }
    },
    updateNumbers: function() {
        // سنعتمد على الوظيفة المعرفة داخل حدث DOMContentLoaded
        if (typeof updateRowNumbers !== 'undefined') {
            updateRowNumbers();
        }
    },
    goToPage: function(pageNum) {
        // هذه الوظيفة تحتاج إلى أن تكون متاحة من الخارج
        // سنعتمد على وظائف أخرى معرفة داخل حدث DOMContentLoaded
        const rows = document.querySelectorAll('#itemsTableBody tr');
        const itemsPerPage = 5;
        const totalPages = Math.ceil(rows.length / itemsPerPage);
        
        if (pageNum >= 1 && pageNum <= totalPages) {
            // استدعاء الدوال المناسبة
            if (typeof showPage !== 'undefined' && typeof updatePagination !== 'undefined') {
                showPage(pageNum, rows, itemsPerPage);
                updatePagination(totalPages, pageNum);
            }
        }
    }
};
