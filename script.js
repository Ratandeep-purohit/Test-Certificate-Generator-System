// script.js
document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const form = document.getElementById('cert-form');
    const zoomInBtn = document.getElementById('btn-zoom-in');
    const zoomOutBtn = document.getElementById('btn-zoom-out');
    const zoomLevelSpan = document.getElementById('zoom-level');
    const certificate = document.getElementById('certificate');
    const btnReset = document.getElementById('btn-reset');
    const btnDownload = document.getElementById('btn-download');
    const btnPrint = document.getElementById('btn-print');

    // Mappings between Form Inputs and Certificate Display
    const mappings = [
        { input: 'f-cert-no', display: 'c-cert-no' },
        { input: 'f-customer', display: 'c-customer' },
        { input: 'f-invoice', display: 'c-invoice' },
        { input: 'f-product', display: 'c-product' },
        { input: 'f-size-s1', display: 'c-size-s1' },
        { input: 'f-size-s2', display: 'c-size-s2' },
        { input: 'f-size-s3', display: 'c-size-s3' },
        { input: 'f-thick-s1', display: 'c-thick-s1' },
        { input: 'f-thick-s2', display: 'c-thick-s2' },
        { input: 'f-thick-s3', display: 'c-thick-s3' },
        { input: 'f-conclusion', display: 'c-conclusion' },
        { input: 'f-inspected-by', display: 'c-inspected-by' },
        { input: 'f-date-place', display: 'c-date-place' }
    ];

    // Image Upload Elements
    const sigInput = document.getElementById('f-sig-img');
    const stampInput = document.getElementById('f-stamp-img');
    const btnRemoveSig = document.getElementById('btn-remove-sig');
    const btnRemoveStamp = document.getElementById('btn-remove-stamp');
    const sigImg = document.getElementById('c-sig-img');
    const stampImg = document.getElementById('c-stamp-img');
    const sigPlaceholder = document.getElementById('c-sig-placeholder');
    const stampPlaceholder = document.getElementById('c-stamp-placeholder');

    // Auto-fill today's date
    const today = new Date();
    const dateStr = today.getDate().toString().padStart(2, '0') + '-' + 
                    (today.getMonth() + 1).toString().padStart(2, '0') + '-' + 
                    today.getFullYear() + ' Noida';
    document.getElementById('f-date-place').value = dateStr;
    document.getElementById('c-date-place').textContent = dateStr;

    // Load Draft from LocalStorage
    loadDraft();

    // Event Listeners for Live Preview & Auto-Save
    mappings.forEach(map => {
        const inputEl = document.getElementById(map.input);
        const displayEl = document.getElementById(map.display);
        
        if (inputEl && displayEl) {
            inputEl.addEventListener('input', (e) => {
                displayEl.innerHTML = e.target.value.replace(/\n/g, '<br>');
                saveDraft();
            });
        }
    });

    // Image Upload Handlers
    function clearImage(imgElement, placeholderElement, inputElement, removeBtn, storageKey) {
        imgElement.src = '';
        imgElement.style.display = 'none';
        placeholderElement.style.display = 'block';
        if (inputElement) inputElement.value = '';
        if (removeBtn) removeBtn.style.display = 'none';
        localStorage.removeItem(storageKey);
    }

    function handleImageUpload(event, imgElement, placeholderElement, storageKey, removeBtn) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgElement.src = e.target.result;
                imgElement.style.display = 'block';
                placeholderElement.style.display = 'none';
                if (removeBtn) removeBtn.style.display = 'block';
                // Intentionally not saving to localStorage so it resets on next load
            };
            reader.readAsDataURL(file);
        } else {
            clearImage(imgElement, placeholderElement, event.target, removeBtn, storageKey);
        }
    }

    sigInput.addEventListener('change', (e) => handleImageUpload(e, sigImg, sigPlaceholder, 'draft_sig', btnRemoveSig));
    stampInput.addEventListener('change', (e) => handleImageUpload(e, stampImg, stampPlaceholder, 'draft_stamp', btnRemoveStamp));

    if (btnRemoveSig) {
        btnRemoveSig.addEventListener('click', () => {
            clearImage(sigImg, sigPlaceholder, sigInput, btnRemoveSig, 'draft_sig');
        });
    }

    if (btnRemoveStamp) {
        btnRemoveStamp.addEventListener('click', () => {
            clearImage(stampImg, stampPlaceholder, stampInput, btnRemoveStamp, 'draft_stamp');
        });
    }

    // Zoom Functionality
    let currentZoom = 1;
    const zoomStep = 0.1;
    const maxZoom = 1.5;
    const minZoom = 0.5;

    function updateZoom() {
        certificate.style.transform = `scale(${currentZoom})`;
        zoomLevelSpan.textContent = `${Math.round(currentZoom * 100)}%`;
    }

    zoomInBtn.addEventListener('click', () => {
        if (currentZoom < maxZoom) {
            currentZoom += zoomStep;
            updateZoom();
        }
    });

    zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > minZoom) {
            currentZoom -= zoomStep;
            updateZoom();
        }
    });

    // Fit to screen initially
    function fitToScreen() {
        const wrapper = document.querySelector('.certificate-wrapper');
        const availableHeight = wrapper.clientHeight - 80; // 40px padding top/bottom
        const a4Height = 1122; // approx height in pixels at 96dpi
        
        if (availableHeight > 0 && availableHeight < a4Height) {
            currentZoom = availableHeight / a4Height;
            if (currentZoom < minZoom) currentZoom = minZoom;
            updateZoom();
        }
    }
    
    // Call after a slight delay to ensure layout is complete
    setTimeout(fitToScreen, 100);
    window.addEventListener('resize', fitToScreen);

    // Reset Form
    btnReset.addEventListener('click', () => {
        if(confirm('Are you sure you want to reset all fields?')) {
            form.reset();
            // Trigger input events to update preview
            mappings.forEach(map => {
                const inputEl = document.getElementById(map.input);
                if (inputEl) {
                    inputEl.dispatchEvent(new Event('input'));
                }
            });
            // Reset images
            clearImage(sigImg, sigPlaceholder, sigInput, btnRemoveSig, 'draft_sig');
            clearImage(stampImg, stampPlaceholder, stampInput, btnRemoveStamp, 'draft_stamp');
            
            // Re-set date
            document.getElementById('f-date-place').value = dateStr;
            document.getElementById('c-date-place').textContent = dateStr;
            
            // Clear draft
            localStorage.clear();
        }
    });

    // Print
    btnPrint.addEventListener('click', () => {
        // Reset zoom for printing
        const oldZoom = currentZoom;
        currentZoom = 1;
        updateZoom();
        
        // Hide borders on image containers for printing if they have images
        const sigContainer = document.querySelector('.cert-footer .signature-box:nth-child(1) .sig-image-container');
        const stampContainer = document.querySelector('.cert-footer .signature-box:nth-child(2) .sig-image-container');
        
        const oldSigBorder = sigContainer.style.border;
        const oldStampBorder = stampContainer.style.border;
        
        sigContainer.style.border = 'none';
        stampContainer.style.border = 'none';

        window.print();
        
        // Restore
        currentZoom = oldZoom;
        updateZoom();
        sigContainer.style.border = oldSigBorder;
        stampContainer.style.border = oldStampBorder;
    });

    // Download PDF
    btnDownload.addEventListener('click', () => {
        const element = document.getElementById('certificate');
        let customerName = document.getElementById('f-customer').value.trim().split(' ')[0];
        if (!customerName) customerName = 'DRAFT';
        const filename = `TEST_CERTIFICATE_${customerName}.pdf`;

        // Temporarily prepare for PDF (Performance Optimizations)
        const oldTransform = element.style.transform;
        const oldShadow = element.style.boxShadow;
        const oldHeight = element.style.height;
        const oldMaxHeight = element.style.maxHeight;
        element.style.transform = 'none';
        element.style.boxShadow = 'none'; // Huge performance boost for html2canvas
        // Prevent sub-pixel rounding error from triggering an empty second page
        element.style.height = '296.5mm';
        element.style.maxHeight = '296.5mm';
        
        // Remove dashed borders
        const imgContainers = document.querySelectorAll('.sig-image-container, .circular-stamp');
        const originalBorders = [];
        imgContainers.forEach(c => {
            originalBorders.push(c.style.border);
            c.style.border = 'none';
        });

        // Show loading state
        const originalText = btnDownload.innerHTML;
        btnDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';
        btnDownload.disabled = true;

        const opt = {
            margin: 0, 
            filename: filename,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { 
                scale: 2, 
                useCORS: true, 
                logging: false,
                backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save().then(() => {
            // Restore
            element.style.transform = oldTransform;
            element.style.boxShadow = oldShadow;
            element.style.height = oldHeight;
            element.style.maxHeight = oldMaxHeight;
            imgContainers.forEach((c, i) => c.style.border = originalBorders[i]);
            btnDownload.innerHTML = originalText;
            btnDownload.disabled = false;
        });
    });

    // Auto-Save Draft Functions
    function saveDraft() {
        const draft = {};
        mappings.forEach(map => {
            const inputEl = document.getElementById(map.input);
            if (inputEl) {
                draft[map.input] = inputEl.value;
            }
        });
        localStorage.setItem('cert_draft', JSON.stringify(draft));
    }

    function loadDraft() {
        const draftJSON = localStorage.getItem('cert_draft');
        if (draftJSON) {
            try {
                const draft = JSON.parse(draftJSON);
                mappings.forEach(map => {
                    if (draft[map.input] !== undefined) {
                        const inputEl = document.getElementById(map.input);
                        const displayEl = document.getElementById(map.display);
                        if (inputEl && displayEl) {
                            inputEl.value = draft[map.input];
                            displayEl.innerHTML = draft[map.input].replace(/\n/g, '<br>');
                        }
                    }
                });
            } catch (e) {
                console.error("Error loading draft", e);
            }
        }
        
        // Clear any old draft images to ensure a fresh start
        localStorage.removeItem('draft_sig');
        localStorage.removeItem('draft_stamp');
    }
});
