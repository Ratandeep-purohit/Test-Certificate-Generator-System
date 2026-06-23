document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quotation-form');
    const itemsContainer = document.getElementById('items-container');
    const btnAddItem = document.getElementById('btn-add-item');
    const btnReset = document.getElementById('btn-reset');
    const btnDownload = document.getElementById('btn-download');
    const zoomTarget = document.querySelector('.quotation-wrapper');

    if (typeof LOGO_B64 !== 'undefined') document.getElementById('preview-logo').src = LOGO_B64;
    if (typeof LOGO2_B64 !== 'undefined') document.getElementById('preview-logo2').src = LOGO2_B64;
    if (typeof SIG_B64 !== 'undefined') document.getElementById('p-sig-img').src = SIG_B64;

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('f-quote-date').value = today;
    document.getElementById('f-due-date').value = today;

    const defaultItems = [
        { description: '', width: 1, height: 1, area: 1, qty: 1, gst: 18, uom: 'SQF', rate: 0 }
    ];

    let items = defaultItems.map((item, index) => ({ id: Date.now() + index, ...item }));

    // Expose internals for admin viewer loader
    window._quotationItems = items;
    window._renderItemForms = () => renderItemForms();
    window._updatePreview = () => updatePreview();

    const terms = [
        'All orders, confirmations, sales contracts, services, price offers, and quotations are subject to these general terms unless accepted otherwise in writing by the seller.',
        'No modification, derogation, or addition by the buyer to these terms shall be contractually valid without prior written acceptance from the seller.',
        'The contract is formed by acceptance of the buyer order by the seller, or through performance of the requested order or service.',
        'Glass shall be manufactured as per applicable standards and dimensional tolerances. Material within such tolerances shall be deemed acceptable.',
        'Tempered glass may be susceptible to spontaneous breakage due to Nickel Sulphide inclusions. Such breakage is not considered a manufacturing defect.',
        'Heat-treated glass may show strain patterns or anisotropy under certain lighting conditions. This is characteristic of the process and not a defect.',
        'Glass optimization wastage, wooden packing, forwarding, freight, and special handling charges may be charged extra wherever applicable.',
        'For fabricated glass with holes, notches, cutouts, or special installation details, drawing confirmation may be required before production.',
        'Products are made to order. Changes or cancellation after confirmation may attract material, processing, and cancellation charges.',
        'Taxes and duties shall be charged as applicable at the time of invoicing, even if rates change after quotation.',
        'Payments shall be made as per the payment schedule mentioned in the proforma invoice or quotation.',
        'Delayed payments may attract interest or other charges as decided by the seller.',
        'Delivery timelines are indicative unless expressly agreed in writing. Delays caused by force majeure or operational conditions shall not create liability.',
        'The buyer shall arrange timely unloading at site. Any loading or unloading assistance is at buyer risk unless agreed otherwise.',
        'For self-pickup deliveries, transit insurance and transport-related breakage claims shall not be accepted.',
        'Products are presumed accepted if no written complaint is received within 24 hours of delivery and confirmed by the seller within five working days.',
        'Breakage or rejection claims must be reported immediately and noted on the delivery challan wherever applicable.',
        'The seller shall not be responsible for damage after successful delivery and acknowledgement by the buyer or site representative.',
        'If a contract is cancelled at any stage, the customer agrees to pay cancellation charges or actual costs incurred, whichever is higher.',
        'All disputes shall be subject to the jurisdiction of the courts at the seller registered office location.'
    ];

    function formatDate(dateString) {
        if (!dateString) return '---';
        const date = new Date(`${dateString}T00:00:00`);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }

    function money(value) {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(value || 0);
    }

    function numberValue(value) {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function setText(id, value) {
        document.getElementById(id).textContent = value || '---';
    }

    function setMultiline(id, value) {
        const element = document.getElementById(id);
        element.textContent = '';
        const lines = (value || '---').split('\n');
        lines.forEach((line, index) => {
            if (index) element.appendChild(document.createElement('br'));
            element.appendChild(document.createTextNode(line));
        });
    }

    function appendCell(row, value, className) {
        const cell = document.createElement('td');
        if (className) cell.className = className;
        setMultilineContent(cell, value);
        row.appendChild(cell);
    }

    function setMultilineContent(element, value) {
        element.textContent = '';
        String(value || '').split('\n').forEach((line, index) => {
            if (index) element.appendChild(document.createElement('br'));
            element.appendChild(document.createTextNode(line));
        });
    }

    function makeInput(type, field, item, step) {
        const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
        if (type !== 'textarea') input.type = type;
        input.dataset.itemId = item.id;
        input.dataset.field = field;
        input.value = item[field];
        if (step) input.step = step;
        if (type === 'number') input.min = '0';
        if (type === 'textarea') input.rows = 2;
        return input;
    }

    function addFormGroup(parent, labelText, control) {
        const group = document.createElement('div');
        group.className = 'form-group';
        const label = document.createElement('label');
        label.textContent = labelText;
        group.appendChild(label);
        group.appendChild(control);
        parent.appendChild(group);
    }

    function renderItemForms() {
        itemsContainer.textContent = '';
        items.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'item-row-form';

            const del = document.createElement('button');
            del.type = 'button';
            del.className = 'btn-delete-row';
            del.title = 'Delete item';
            del.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
            del.addEventListener('click', () => deleteItem(item.id));
            row.appendChild(del);

            addFormGroup(row, 'Description of Goods', makeInput('textarea', 'description', item));

            const compact = document.createElement('div');
            compact.className = 'compact-row';
            addFormGroup(compact, 'Width', makeInput('number', 'width', item, '0.01'));
            addFormGroup(compact, 'Height', makeInput('number', 'height', item, '0.01'));
            addFormGroup(compact, 'Chargeable Area', makeInput('number', 'area', item, '0.01'));
            addFormGroup(compact, 'Quantity', makeInput('number', 'qty', item, '0.01'));
            addFormGroup(compact, 'GST %', makeInput('number', 'gst', item, '0.01'));
            addFormGroup(compact, 'UOM', makeInput('text', 'uom', item));
            addFormGroup(compact, 'Rate', makeInput('number', 'rate', item, '0.01'));
            row.appendChild(compact);

            itemsContainer.appendChild(row);
        });
    }

    function deleteItem(id) {
        if (items.length <= 1) return;
        items = items.filter((item) => item.id !== id);
        renderItemForms();
        updatePreview();
    }

    function renderTerms() {
        const list = document.getElementById('terms-list');
        list.textContent = '';
        terms.forEach((term) => {
            const li = document.createElement('li');
            li.textContent = term;
            list.appendChild(li);
        });
    }

    function itemTotals(item) {
        const area = numberValue(item.area);
        const qty = numberValue(item.qty);
        const rate = numberValue(item.rate);
        const gst = numberValue(item.gst);
        const chargedUnit = area * qty;
        const amount = chargedUnit * rate;
        const tax = amount * gst / 100;
        return { chargedUnit, amount, tax, total: amount + tax };
    }

    function updateItemsFromInput(target) {
        if (!target.dataset.itemId) return;
        const item = items.find((entry) => entry.id === Number(target.dataset.itemId));
        if (!item) return;
        const field = target.dataset.field;
        item[field] = target.value;
    }

    function updatePreview() {
        setText('p-quote-no', document.getElementById('f-quote-no').value);
        setText('p-quote-date', formatDate(document.getElementById('f-quote-date').value));
        setText('p-due-date', formatDate(document.getElementById('f-due-date').value));
        setText('p-project', document.getElementById('f-project').value);
        setText('p-source', document.getElementById('f-source').value);
        setText('p-timeline', document.getElementById('f-timeline').value);
        setText('p-note', document.getElementById('f-note').value);
        setMultiline('p-from', document.getElementById('f-from').value);
        setMultiline('p-to', document.getElementById('f-to').value);
        setMultiline('p-bank', document.getElementById('f-bank').value);

        const body = document.getElementById('p-items-body');
        body.textContent = '';
        let subtotal = 0;
        let itemTax = 0;

        items.forEach((item, index) => {
            const totals = itemTotals(item);
            subtotal += totals.amount;
            itemTax += totals.tax;
            const row = document.createElement('tr');
            appendCell(row, index + 1);
            appendCell(row, item.description, 'desc-cell');
            appendCell(row, numberValue(item.width).toFixed(2));
            appendCell(row, numberValue(item.height).toFixed(2));
            appendCell(row, numberValue(item.area).toFixed(2));
            appendCell(row, numberValue(item.qty).toFixed(2));
            appendCell(row, `${numberValue(item.gst).toFixed(0)}%`);
            appendCell(row, totals.chargedUnit.toFixed(2));
            appendCell(row, item.uom || '---');
            appendCell(row, money(numberValue(item.rate)));
            appendCell(row, money(totals.amount));
            appendCell(row, money(totals.total));
            body.appendChild(row);
        });

        const freight = numberValue(document.getElementById('f-freight').value);
        const freightGstRate = numberValue(document.getElementById('f-freight-gst').value);
        const freightTax = freight * freightGstRate / 100;
        const totalTax = itemTax + freightTax;
        const grandTotal = subtotal + freight + totalTax;
        const cgst = totalTax / 2;
        const sgst = totalTax / 2;

        setText('p-freight', money(freight));
        setText('p-freight-tax', money(freightTax));
        setText('p-subtotal', money(subtotal + freight));
        setText('p-cgst', money(cgst));
        setText('p-sgst', money(sgst));
        setText('p-grand-total', money(grandTotal));
        setText('p-amount-words', `${toIndianCurrencyWords(grandTotal)} ONLY`);

        const upi = (document.getElementById('f-bank').value.match(/UPI:\s*(.+)/i) || [])[1] || '8238939979@okbizaxis';
        setText('p-upi', upi.trim());
    }

    function toIndianCurrencyWords(amount) {
        const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
        const rupees = Math.floor(rounded);
        const paise = Math.round((rounded - rupees) * 100);
        let words = `${numberToWordsIndian(rupees)} RUPEES`;
        if (paise > 0) words += ` AND ${numberToWordsIndian(paise)} PAISE`;
        return words;
    }

    function numberToWordsIndian(num) {
        if (num === 0) return 'ZERO';
        const ones = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN', 'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN'];
        const tens = ['', '', 'TWENTY', 'THIRTY', 'FORTY', 'FIFTY', 'SIXTY', 'SEVENTY', 'EIGHTY', 'NINETY'];
        const belowHundred = (n) => n < 20 ? ones[n] : `${tens[Math.floor(n / 10)]}${n % 10 ? ` ${ones[n % 10]}` : ''}`;
        const belowThousand = (n) => {
            const hundred = Math.floor(n / 100);
            const rest = n % 100;
            return `${hundred ? `${ones[hundred]} HUNDRED` : ''}${hundred && rest ? ' ' : ''}${rest ? belowHundred(rest) : ''}`.trim();
        };
        const crore = Math.floor(num / 10000000);
        num %= 10000000;
        const lakh = Math.floor(num / 100000);
        num %= 100000;
        const thousand = Math.floor(num / 1000);
        num %= 1000;
        const parts = [];
        if (crore) parts.push(`${belowThousand(crore)} CRORE`);
        if (lakh) parts.push(`${belowThousand(lakh)} LAKH`);
        if (thousand) parts.push(`${belowThousand(thousand)} THOUSAND`);
        if (num) parts.push(belowThousand(num));
        return parts.join(' ');
    }

    form.addEventListener('input', (event) => {
        updateItemsFromInput(event.target);
        updatePreview();
    });

    btnAddItem.addEventListener('click', () => {
        items.push({ id: Date.now(), description: '', width: 1, height: 1, area: 1, qty: 1, gst: 18, uom: 'SQF', rate: 0 });
        renderItemForms();
        updatePreview();
    });

    btnReset.addEventListener('click', () => {
        if (!confirm('Are you sure you want to reset the quotation?')) return;
        form.reset();
        document.getElementById('f-quote-date').value = today;
        document.getElementById('f-due-date').value = today;
        items = defaultItems.map((item, index) => ({ id: Date.now() + index, ...item }));
        renderItemForms();
        updatePreview();
    });

    let currentZoom = 100;
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

    btnDownload.addEventListener('click', async () => {
        const element = document.getElementById('pdf-content');
        const quoteNo = document.getElementById('f-quote-no').value || 'DRAFT';
        const safeQuoteNo = quoteNo.replace(/[^a-z0-9_-]/gi, '_');
        const originalText = btnDownload.innerHTML;
        btnDownload.disabled = true;
        btnDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

        try {
            await html2pdf().set({
                margin: [0, 0, 0, 0],
                filename: `QUOTATION_${safeQuoteNo}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: false, allowTaint: true, logging: false, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
                pagebreak: { mode: ['css', 'legacy'], before: '.terms-page' }
            }).from(element).save();
            if (typeof saveDocumentToDB === 'function') {
                saveDocumentToDB({
                    document_type: 'Quotation',
                    document_no: document.getElementById('f-quote-no').value,
                    customer_name: document.getElementById('f-to').value,
                    employee_name: document.getElementById('f-source').value || 'System',
                    document_date: document.getElementById('f-quote-date').value,
                    details: {
                        quote_no: document.getElementById('f-quote-no').value,
                        quote_date: document.getElementById('f-quote-date').value,
                        due_date: document.getElementById('f-due-date').value,
                        timeline: document.getElementById('f-timeline').value,
                        project: document.getElementById('f-project').value,
                        source: document.getElementById('f-source').value,
                        note: document.getElementById('f-note').value,
                        from: document.getElementById('f-from').value,
                        to: document.getElementById('f-to').value,
                        freight: document.getElementById('f-freight').value,
                        freight_gst: document.getElementById('f-freight-gst').value,
                        bank: document.getElementById('f-bank').value,
                        items: items,
                        grand_total: document.getElementById('p-grand-total').textContent
                    }
                });
            }
        } catch (err) {
            console.error('PDF error:', err);
            alert(`PDF generation failed: ${err.message}`);
        } finally {
            btnDownload.disabled = false;
            btnDownload.innerHTML = originalText;
        }
    });

    renderItemForms();
    renderTerms();
    updatePreview();
});

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const viewId = urlParams.get('view_id');
    if (!viewId || typeof supabaseClient === 'undefined') return;
    try {
        const { data, error } = await supabaseClient.from('certificates').select('*').eq('id', viewId).single();
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
        setAndFire('f-quote-no', d.quote_no);
        setAndFire('f-quote-date', d.quote_date);
        setAndFire('f-due-date', d.due_date);
        setAndFire('f-timeline', d.timeline);
        setAndFire('f-project', d.project);
        setAndFire('f-source', d.source);
        setAndFire('f-note', d.note);
        setAndFire('f-from', d.from);
        setAndFire('f-to', d.to);
        setAndFire('f-freight', d.freight);
        setAndFire('f-freight-gst', d.freight_gst);
        setAndFire('f-bank', d.bank);
        if (d.items && window._quotationItems && window._renderItemForms && window._updatePreview) {
            window._quotationItems.length = 0;
            d.items.forEach(i => window._quotationItems.push(i));
            window._renderItemForms();
            window._updatePreview();
        }
    } catch (err) {
        console.error('Error loading preview:', err);
    }
});
