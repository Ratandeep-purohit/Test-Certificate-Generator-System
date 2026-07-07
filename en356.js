// en356.js — P6B (EN 356) Certificate of Conformity logic
// Supports dynamic multi-product rows

document.addEventListener('DOMContentLoaded', () => {

    // ---- UI Elements ----
    const form           = document.getElementById('cert-form');
    const zoomInBtn      = document.getElementById('btn-zoom-in');
    const zoomOutBtn     = document.getElementById('btn-zoom-out');
    const zoomLevelSpan  = document.getElementById('zoom-level');
    const certificate    = document.getElementById('certificate');
    const btnReset       = document.getElementById('btn-reset');
    const btnDownload    = document.getElementById('btn-download');
    const btnPrint       = document.getElementById('btn-print');
    const btnAddProduct  = document.getElementById('btn-add-product');
    const prodContainer  = document.getElementById('product-rows-container');
    const prodTbody      = document.getElementById('prod-tbody');

    // ---- Non-product field mappings ----
    const mappings = [
        { input: 'f-cert-no',        display: 'c-cert-no' },
        { input: 'f-issue-date',      display: 'c-issue-date' },
        { input: 'f-test-report-no',  display: 'c-test-report-no' },
        { input: 'f-batch-lot',       display: 'c-batch-lot' },
        { input: 'f-mfr-name',       display: 'c-mfr-name' },
        { input: 'f-mfr-address',     display: 'c-mfr-address' },
        { input: 'f-customer',        display: 'c-customer' },
        { input: 'f-customer-address',display: 'c-customer-address' },
        { input: 'f-class',           display: 'c-class' },
        { input: 'f-drop-height',     display: 'c-drop-height' },
        { input: 'f-drop-count',      display: 'c-drop-count' },
        { input: 'f-result-obs',      display: 'c-result-obs' },
        { input: 'f-result',          display: 'c-result' },
        { input: 'f-compliance',      display: 'c-compliance' },
        { input: 'f-authorized-by',   display: 'c-authorized-by' },
        { input: 'f-designation',     display: 'c-designation' },
    ];

    // ---- Image Upload Elements ----
    const sigInput         = document.getElementById('f-sig-img');
    const stampInput       = document.getElementById('f-stamp-img');
    const btnRemoveSig     = document.getElementById('btn-remove-sig');
    const btnRemoveStamp   = document.getElementById('btn-remove-stamp');
    const sigImg           = document.getElementById('c-sig-img');
    const stampImg         = document.getElementById('c-stamp-img');
    const sigPlaceholder   = document.getElementById('c-sig-placeholder');
    const stampPlaceholder = document.getElementById('c-stamp-placeholder');

    // ---- Auto-fill today's date ----
    const today   = new Date();
    const dd      = today.getDate().toString().padStart(2, '0');
    const mm      = (today.getMonth() + 1).toString().padStart(2, '0');
    const yyyy    = today.getFullYear();
    const dateStr = `${dd}-${mm}-${yyyy}`;
    const issueDateEl = document.getElementById('f-issue-date');
    if (issueDateEl && !issueDateEl.value) {
        issueDateEl.value = dateStr;
        document.getElementById('c-issue-date').textContent = dateStr;
    }

    // ================================================================
    //  MULTI-PRODUCT SYSTEM
    // ================================================================
    let products = []; // array of { description, construction, thickness, dimensions, quantity }

    function createProductFormRow(index, data = {}) {
        const wrap = document.createElement('div');
        wrap.className = 'product-form-row';
        wrap.dataset.index = index;
        wrap.style.cssText = `
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px 14px 10px;
            margin-bottom: 10px;
            position: relative;
        `;

        wrap.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                <span style="font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.08em; color:#64748b;">
                    Product ${index + 1}
                </span>
                ${index > 0 ? `<button type="button" class="btn-remove-product" data-index="${index}"
                    style="background:none;border:none;color:#ef4444;cursor:pointer;font-size:0.8rem;display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:4px;"
                    title="Remove Product">
                    <i class="fa-solid fa-trash-can"></i> Remove
                </button>` : ''}
            </div>
            <div class="form-group" style="margin-bottom:10px;">
                <label style="font-size:0.8rem; font-weight:600; color:#334155; margin-bottom:4px; display:block;">Product Description</label>
                <input type="text" class="prod-field" data-field="description" data-index="${index}"
                    placeholder="e.g. Laminated Security Glass" value="${data.description || ''}"
                    style="width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;background:#fff;color:#0f172a;">
            </div>
            <div class="form-group" style="margin-bottom:10px;">
                <label style="font-size:0.8rem; font-weight:600; color:#334155; margin-bottom:4px; display:block;">Glass Construction</label>
                <input type="text" class="prod-field" data-field="construction" data-index="${index}"
                    placeholder="e.g. 6+1.52PVB+6 mm" value="${data.construction || ''}"
                    style="width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;background:#fff;color:#0f172a;">
            </div>
            <div style="display:flex; gap:10px; margin-bottom:10px;">
                <div style="flex:1;">
                    <label style="font-size:0.8rem; font-weight:600; color:#334155; margin-bottom:4px; display:block;">Thickness (mm)</label>
                    <input type="text" class="prod-field" data-field="thickness" data-index="${index}"
                        placeholder="e.g. 13.52" value="${data.thickness || ''}"
                        style="width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;background:#fff;color:#0f172a;">
                </div>
                <div style="flex:1;">
                    <label style="font-size:0.8rem; font-weight:600; color:#334155; margin-bottom:4px; display:block;">Quantity</label>
                    <input type="text" class="prod-field" data-field="quantity" data-index="${index}"
                        placeholder="e.g. 10 Nos." value="${data.quantity || ''}"
                        style="width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;background:#fff;color:#0f172a;">
                </div>
            </div>
            <div class="form-group">
                <label style="font-size:0.8rem; font-weight:600; color:#334155; margin-bottom:4px; display:block;">Dimensions (mm)</label>
                <input type="text" class="prod-field" data-field="dimensions" data-index="${index}"
                    placeholder="e.g. 1100 x 900" value="${data.dimensions || ''}"
                    style="width:100%;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;font-size:0.875rem;background:#fff;color:#0f172a;">
            </div>
        `;

        // Remove button listener
        const removeBtn = wrap.querySelector('.btn-remove-product');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                products.splice(index, 1);
                renderProductForm();
                renderProductTable();
                saveDraft();
            });
        }

        // Live field listeners
        wrap.querySelectorAll('.prod-field').forEach(input => {
            input.addEventListener('input', (e) => {
                const idx   = parseInt(e.target.dataset.index);
                const field = e.target.dataset.field;
                if (products[idx]) {
                    products[idx][field] = e.target.value;
                    renderProductTable();
                    saveDraft();
                }
            });
        });

        return wrap;
    }

    function renderProductForm() {
        prodContainer.innerHTML = '';
        products.forEach((p, i) => {
            prodContainer.appendChild(createProductFormRow(i, p));
        });
    }

    function renderProductTable() {
        prodTbody.innerHTML = '';
        if (products.length === 0) {
            prodTbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:10px;font-size:8pt;">No products added</td></tr>';
            return;
        }
        products.forEach((p, i) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="text-align:center;font-weight:700;color:#64748b;font-size:8pt;">${i + 1}</td>
                <td style="text-align:left;padding-left:8px;">${p.description || '—'}</td>
                <td>${p.construction || '—'}</td>
                <td>${p.thickness || '—'}</td>
                <td>${p.dimensions || '—'}</td>
                <td>${p.quantity || '—'}</td>
            `;
            prodTbody.appendChild(tr);
        });
    }

    function addProduct(data = {}) {
        products.push({
            description:  data.description  || '',
            construction: data.construction || '',
            thickness:    data.thickness    || '',
            quantity:     data.quantity     || '',
            dimensions:   data.dimensions   || '',
        });
        renderProductForm();
        renderProductTable();
        // Scroll sidebar to the new row
        prodContainer.lastChild && prodContainer.lastChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    btnAddProduct.addEventListener('click', () => addProduct());

    // Seed with one empty row on fresh load
    addProduct({ description: 'Laminated Security Glass', construction: '6+1.52PVB+6 mm', thickness: '13.52' });

    // ================================================================

    // ---- QR Code Generation ----
    function generateQR() {
        const container = document.getElementById('qr-canvas');
        if (!container) return;
        container.innerHTML = '';
        const certNo  = document.getElementById('f-cert-no').value || 'EN356-COC';
        const issDate = document.getElementById('f-issue-date').value || dateStr;
        const qrText  = `Certificate: ${certNo} | Standard: EN 356:1999 | Class: P6B | Date: ${issDate} | Issued by: Glassentials`;
        if (typeof QRCode !== 'undefined') {
            new QRCode(container, {
                text: qrText,
                width: 72,
                height: 72,
                colorDark: '#0f172a',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.M
            });
        }
    }

    // ---- PASS / FAIL result coloring ----
    function updateResultColor() {
        const resultEl = document.getElementById('c-result');
        if (!resultEl) return;
        const val = resultEl.textContent.trim().toUpperCase();
        resultEl.style.color = val === 'PASS' ? '#15803d' : (val === 'FAIL' ? '#dc2626' : '#0f172a');
    }

    // ---- Live Preview for non-product fields ----
    mappings.forEach(map => {
        const inputEl   = document.getElementById(map.input);
        const displayEl = document.getElementById(map.display);
        if (inputEl && displayEl) {
            inputEl.addEventListener('input', (e) => {
                displayEl.innerHTML = e.target.value.replace(/\n/g, '<br>');
                saveDraft();
                if (map.input === 'f-cert-no' || map.input === 'f-issue-date') generateQR();
                if (map.input === 'f-result') updateResultColor();
            });
        }
    });

    // ---- Image Handlers ----
    function clearImage(imgEl, placeholderEl, inputEl, removeBtn, storageKey) {
        imgEl.src = '';
        imgEl.style.display = 'none';
        placeholderEl.style.display = 'block';
        if (inputEl) inputEl.value = '';
        if (removeBtn) removeBtn.style.display = 'none';
        localStorage.removeItem(storageKey);
    }

    function handleImageUpload(event, imgEl, placeholderEl, storageKey, removeBtn) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgEl.src = e.target.result;
                imgEl.style.display = 'block';
                placeholderEl.style.display = 'none';
                if (removeBtn) removeBtn.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            clearImage(imgEl, placeholderEl, event.target, removeBtn, storageKey);
        }
    }

    sigInput.addEventListener('change',   (e) => handleImageUpload(e, sigImg,   sigPlaceholder,   'en356_draft_sig',   btnRemoveSig));
    stampInput.addEventListener('change', (e) => handleImageUpload(e, stampImg, stampPlaceholder, 'en356_draft_stamp', btnRemoveStamp));

    if (btnRemoveSig)   btnRemoveSig.addEventListener('click',   () => clearImage(sigImg,   sigPlaceholder,   sigInput,   btnRemoveSig,   'en356_draft_sig'));
    if (btnRemoveStamp) btnRemoveStamp.addEventListener('click', () => clearImage(stampImg, stampPlaceholder, stampInput, btnRemoveStamp, 'en356_draft_stamp'));

    // ---- Zoom ----
    let currentZoom = 1;
    const zoomStep  = 0.1;
    const maxZoom   = 1.5;
    const minZoom   = 0.5;

    function updateZoom() {
        certificate.style.transform = `scale(${currentZoom})`;
        zoomLevelSpan.textContent   = `${Math.round(currentZoom * 100)}%`;
    }

    zoomInBtn.addEventListener('click',  () => { if (currentZoom < maxZoom) { currentZoom += zoomStep; updateZoom(); } });
    zoomOutBtn.addEventListener('click', () => { if (currentZoom > minZoom) { currentZoom -= zoomStep; updateZoom(); } });

    function fitToScreen() {
        const wrapper   = document.querySelector('.certificate-wrapper');
        const available = wrapper.clientHeight - 80;
        const a4Height  = 1122;
        if (available > 0 && available < a4Height) {
            currentZoom = available / a4Height;
            if (currentZoom < minZoom) currentZoom = minZoom;
            updateZoom();
        }
    }
    setTimeout(fitToScreen, 100);
    window.addEventListener('resize', fitToScreen);

    // ---- Reset ----
    btnReset.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all fields?')) {
            form.reset();
            mappings.forEach(map => {
                const inputEl = document.getElementById(map.input);
                if (inputEl) inputEl.dispatchEvent(new Event('input'));
            });
            clearImage(sigImg,   sigPlaceholder,   sigInput,   btnRemoveSig,   'en356_draft_sig');
            clearImage(stampImg, stampPlaceholder, stampInput, btnRemoveStamp, 'en356_draft_stamp');
            issueDateEl.value = dateStr;
            document.getElementById('c-issue-date').textContent = dateStr;
            // Reset products
            products = [];
            addProduct({ description: 'Laminated Security Glass', construction: '6+1.52PVB+6 mm', thickness: '13.52' });
            localStorage.removeItem('en356_draft');
            generateQR();
        }
    });

    // ---- Print ----
    btnPrint.addEventListener('click', () => {
        const oldZoom = currentZoom;
        currentZoom = 1;
        updateZoom();
        const imgContainers = document.querySelectorAll('.en356-sig-img-area, .en356-circular-stamp');
        const oldBorders = [];
        imgContainers.forEach(c => { oldBorders.push(c.style.border); c.style.border = 'none'; });
        window.print();
        currentZoom = oldZoom;
        updateZoom();
        imgContainers.forEach((c, i) => c.style.border = oldBorders[i]);
    });

    // ---- Download PDF ----
    btnDownload.addEventListener('click', () => {
        const element = document.getElementById('certificate');
        let customerName = document.getElementById('f-customer').value.trim().split(' ')[0];
        if (!customerName) customerName = 'DRAFT';
        const filename = `EN356_P6B_CERTIFICATE_${customerName}.pdf`;

        const oldTransform = element.style.transform;
        const oldShadow    = element.style.boxShadow;
        const oldHeight    = element.style.height;
        const oldMaxHeight = element.style.maxHeight;
        element.style.transform  = 'none';
        element.style.boxShadow  = 'none';
        element.style.height     = '296.5mm';
        element.style.maxHeight  = '296.5mm';

        const imgContainers   = document.querySelectorAll('.en356-sig-img-area, .en356-circular-stamp');
        const originalBorders = [];
        imgContainers.forEach(c => { originalBorders.push(c.style.border); c.style.border = 'none'; });

        const originalText    = btnDownload.innerHTML;
        btnDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
        btnDownload.disabled  = true;

        const opt = {
            margin: 0,
            filename: filename,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            element.style.transform = oldTransform;
            element.style.boxShadow = oldShadow;
            element.style.height    = oldHeight;
            element.style.maxHeight = oldMaxHeight;
            imgContainers.forEach((c, i) => c.style.border = originalBorders[i]);
            btnDownload.innerHTML = originalText;
            btnDownload.disabled  = false;

            if (typeof saveDocumentToDB === 'function') {
                saveDocumentToDB({
                    document_type: 'EN 356 P6B Certificate',
                    document_no:   document.getElementById('f-cert-no').value,
                    customer_name: document.getElementById('f-customer').value,
                    employee_name: document.getElementById('f-authorized-by').value,
                    document_date: document.getElementById('f-issue-date').value,
                    details: {
                        cert_no:          document.getElementById('f-cert-no').value,
                        issue_date:       document.getElementById('f-issue-date').value,
                        test_report_no:   document.getElementById('f-test-report-no').value,
                        batch_lot:        document.getElementById('f-batch-lot').value,
                        mfr_name:         document.getElementById('f-mfr-name').value,
                        mfr_address:      document.getElementById('f-mfr-address').value,
                        customer:         document.getElementById('f-customer').value,
                        customer_address: document.getElementById('f-customer-address').value,
                        products:         products,
                        classification:   document.getElementById('f-class').value,
                        drop_height:      document.getElementById('f-drop-height').value,
                        drop_count:       document.getElementById('f-drop-count').value,
                        result_obs:       document.getElementById('f-result-obs').value,
                        result:           document.getElementById('f-result').value,
                        compliance:       document.getElementById('f-compliance').value,
                        authorized_by:    document.getElementById('f-authorized-by').value,
                        designation:      document.getElementById('f-designation').value,
                    }
                });
            }
        });
    });

    // ---- Draft Save / Load ----
    const DRAFT_KEY = 'en356_draft';

    function saveDraft() {
        const draft = { products: JSON.parse(JSON.stringify(products)) };
        mappings.forEach(map => {
            const el = document.getElementById(map.input);
            if (el) draft[map.input] = el.value;
        });
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }

    function loadDraft() {
        const draftJSON = localStorage.getItem(DRAFT_KEY);
        if (draftJSON) {
            try {
                const draft = JSON.parse(draftJSON);
                mappings.forEach(map => {
                    if (draft[map.input] !== undefined) {
                        const inputEl   = document.getElementById(map.input);
                        const displayEl = document.getElementById(map.display);
                        if (inputEl && displayEl) {
                            inputEl.value = draft[map.input];
                            displayEl.innerHTML = draft[map.input].replace(/\n/g, '<br>');
                        }
                    }
                });
                if (draft.products && Array.isArray(draft.products) && draft.products.length > 0) {
                    products = draft.products;
                    renderProductForm();
                    renderProductTable();
                }
            } catch(e) { console.error('Error loading EN356 draft', e); }
        }
        localStorage.removeItem('en356_draft_sig');
        localStorage.removeItem('en356_draft_stamp');
    }

    // ---- Init ----
    loadDraft();
    generateQR();
    updateResultColor();

    // ---- Admin panel product restore ----
    document.addEventListener('en356:loadProducts', (e) => {
        products = e.detail;
        renderProductForm();
        renderProductTable();
    });
});


// ---- View from Admin Panel (view_id in URL) ----
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewId    = urlParams.get('view_id');
    if (!viewId || typeof supabaseClient === 'undefined') return;

    try {
        const { data, error } = await supabaseClient
            .from('certificates')
            .select('*')
            .eq('id', viewId)
            .single();
        if (error) throw error;
        if (!data || !data.details) return;

        const d = data.details;
        const setAndFire = (id, value) => {
            const el = document.getElementById(id);
            if (el && value !== undefined && value !== null) {
                el.value = value;
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        };

        setAndFire('f-cert-no',           d.cert_no);
        setAndFire('f-issue-date',         d.issue_date);
        setAndFire('f-test-report-no',     d.test_report_no);
        setAndFire('f-batch-lot',          d.batch_lot);
        setAndFire('f-mfr-name',          d.mfr_name);
        setAndFire('f-mfr-address',        d.mfr_address);
        setAndFire('f-customer',           d.customer);
        setAndFire('f-customer-address',   d.customer_address);
        setAndFire('f-class',              d.classification);
        setAndFire('f-drop-height',        d.drop_height);
        setAndFire('f-drop-count',         d.drop_count);
        setAndFire('f-result-obs',         d.result_obs);
        setAndFire('f-result',             d.result);
        setAndFire('f-compliance',         d.compliance);
        setAndFire('f-authorized-by',      d.authorized_by);
        setAndFire('f-designation',        d.designation);

        // Restore products
        if (d.products && Array.isArray(d.products) && d.products.length > 0) {
            // Clear the default seeded row first by resetting the products array
            // The products variable is scoped inside DOMContentLoaded above,
            // so we dispatch a custom event to handle it
            const evt = new CustomEvent('en356:loadProducts', { detail: d.products });
            document.dispatchEvent(evt);
        }
    } catch(err) {
        console.error('Error loading EN356 preview:', err);
    }
});
