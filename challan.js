document.addEventListener('DOMContentLoaded', () => {
    // Inject pre-embedded base64 images — no file loading, no CORS, works everywhere
    document.querySelector('.header-logo-col img').src = LOGO_B64;
    document.querySelector('.header-logo2-col img').src = LOGO2_B64;
    document.getElementById('p-sig-img').src = SIG_B64;
    const mktLogo = document.getElementById('preview-logo-mkt');
    if (mktLogo) mktLogo.src = LOGO_B64;

    const form = document.getElementById('challan-form');
    const itemsContainer = document.getElementById('items-container');
    const btnAddItem = document.getElementById('btn-add-item');
    const btnDownload = document.getElementById('btn-download');
    const btnReset = document.getElementById('btn-reset');
    const pItemsBody = document.getElementById('p-items-body');
    const pTotalQty = document.getElementById('p-total-qty');

    // State management for items
    let items = [
        { id: Date.now(), description: 'Toughened Glass 12mm Clear', hsn: '7007', width: '1200', height: '2400', qty: 5, unit: 'PCS' }
    ];

    // Initial render
    renderItemForms();
    updatePreview();

    // Event Listeners
    btnAddItem.addEventListener('click', () => {
        items.push({ id: Date.now(), description: '', hsn: '', width: '', height: '', qty: 0, unit: 'PCS' });
        renderItemForms();
        updatePreview();
    });

    form.addEventListener('input', (e) => {
        if (e.target.dataset.itemId) {
            const id = parseInt(e.target.dataset.itemId);
            const field = e.target.dataset.field;
            const item = items.find(i => i.id === id);
            if (item) {
                item[field] = e.target.value;
                updatePreview();
            }
        } else {
            updatePreview();
        }
    });

    btnReset.addEventListener('click', () => {
        if(confirm('Are you sure you want to reset the form?')) {
            form.reset();
            items = [{ id: Date.now(), description: '', hsn: '', width: '', height: '', qty: 0, unit: 'PCS' }];
            renderItemForms();
            updatePreview();
        }
    });

    // Zoom Controls — applied to wrapper, NOT the PDF element
    let currentZoom = 100;
    const zoomTarget = document.querySelector('.challan-wrapper');
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        currentZoom = Math.min(currentZoom + 10, 200);
        zoomTarget.style.transformOrigin = 'top center';
        zoomTarget.style.transform = `scale(${currentZoom / 100})`;
        document.getElementById('zoom-level').textContent = `${currentZoom}%`;
    });
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        currentZoom = Math.max(currentZoom - 10, 50);
        zoomTarget.style.transformOrigin = 'top center';
        zoomTarget.style.transform = `scale(${currentZoom / 100})`;
        document.getElementById('zoom-level').textContent = `${currentZoom}%`;
    });

    function renderItemForms() {
        itemsContainer.innerHTML = '';
        items.forEach((item, index) => {
            const row = document.createElement('div');
            row.className = 'item-row-form';
            row.innerHTML = `
                <button type="button" class="btn-delete-row" onclick="deleteItem(${item.id})"><i class="fa-solid fa-trash-can"></i></button>
                <div class="form-group">
                    <label>Description of Goods</label>
                    <input type="text" data-item-id="${item.id}" data-field="description" value="${item.description}" placeholder="Item details">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>HSN/SAC</label>
                        <input type="text" data-item-id="${item.id}" data-field="hsn" value="${item.hsn}" placeholder="HSN">
                    </div>
                    <div class="form-group">
                        <label>Width</label>
                        <input type="text" data-item-id="${item.id}" data-field="width" value="${item.width}" placeholder="W">
                    </div>
                    <div class="form-group">
                        <label>Height</label>
                        <input type="text" data-item-id="${item.id}" data-field="height" value="${item.height}" placeholder="H">
                    </div>
                    <div class="form-group">
                        <label>Qty</label>
                        <input type="number" data-item-id="${item.id}" data-field="qty" value="${item.qty}" placeholder="Qty">
                    </div>
                </div>
            `;
            itemsContainer.appendChild(row);
        });
    }

    window.deleteItem = function(id) {
        if(items.length > 1) {
            items = items.filter(i => i.id !== id);
            renderItemForms();
            updatePreview();
        }
    };

    function updatePreview() {
        // Text inputs
        document.getElementById('p-challan-no').textContent = document.getElementById('f-challan-no').value || '---';
        document.getElementById('p-date').textContent = document.getElementById('f-date').value || '---';
        document.getElementById('p-project').textContent = document.getElementById('f-project').value || '---';
        document.getElementById('p-vehicle').textContent = document.getElementById('f-vehicle').value || '---';
        
        // Textareas
        document.getElementById('p-delivered-by').textContent = document.getElementById('f-delivered-by').value;
        document.getElementById('p-delivered-to').textContent = document.getElementById('f-delivered-to').value;
        document.getElementById('p-shipped-from').textContent = document.getElementById('f-shipped-from').value;
        document.getElementById('p-shipped-to').textContent = document.getElementById('f-shipped-to').value;

        // Items Table
        pItemsBody.innerHTML = '';
        let total = 0;
        items.forEach((item, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${item.description || '---'}</td>
                <td>${item.hsn || '---'}</td>
                <td>${item.width || '---'}</td>
                <td>${item.height || '---'}</td>
                <td>${item.qty || 0}</td>
                <td>${item.unit}</td>
            `;
            pItemsBody.appendChild(row);
            total += parseFloat(item.qty) || 0;
        });
        pTotalQty.textContent = total;
    }

    // PDF Download — images are already base64 data URLs, so html2canvas has zero CORS issues
    btnDownload.addEventListener('click', async () => {
        const element = document.getElementById('pdf-content');
        const challanNo = document.getElementById('f-challan-no').value || 'Draft';

        btnDownload.disabled = true;
        btnDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

        const challanPage = document.querySelector('.challan-page');
        const capSheet = document.querySelector('.cap-sheet');
        const pdfSpacer = document.getElementById('pdf-spacer');
        
        // Cache original styles
        const origMinHeight = challanPage ? challanPage.style.minHeight : '';
        const origBoxShadow = challanPage ? challanPage.style.boxShadow : '';
        const origPaddingBottom = challanPage ? challanPage.style.paddingBottom : '';
        const origSpacerDisplay = pdfSpacer ? pdfSpacer.style.display : '';
        
        // Strip physical constraints BEFORE html2pdf calculates pagination
        if (challanPage) {
            challanPage.style.minHeight = 'auto';
            challanPage.style.boxShadow = 'none';
            challanPage.style.paddingBottom = '0';
        }
        if (capSheet) {
            capSheet.style.marginTop = '0';
        }
        if (pdfSpacer) {
            pdfSpacer.style.display = 'none';
        }

        try {
            await html2pdf().set({
                margin:      [5, 5, 5, 5],
                filename:    `DELIVERY_CHALLAN_${challanNo}.pdf`,
                image:       { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: false, allowTaint: true, logging: false },
                jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak:   { mode: ['css', 'legacy'], before: '.cap-sheet' }
            }).from(element).save();

        } catch (err) {
            console.error('PDF error:', err);
            alert('PDF generation failed: ' + err.message);
        } finally {
            // Restore original styles
            if (challanPage) {
                challanPage.style.minHeight = origMinHeight;
                challanPage.style.boxShadow = origBoxShadow;
                challanPage.style.paddingBottom = origPaddingBottom;
            }
            if (capSheet) {
                capSheet.style.marginTop = '';
            }
            if (pdfSpacer) {
                pdfSpacer.style.display = origSpacerDisplay;
            }
            
            btnDownload.disabled = false;
            btnDownload.innerHTML = '<i class="fa-solid fa-download"></i> PDF';
        }
    });
});
