document.addEventListener('DOMContentLoaded', () => {
    // Inject pre-embedded base64 images — no file loading, no CORS, works everywhere
    if (typeof LOGO_B64 !== 'undefined') {
        document.getElementById('preview-logo').src = LOGO_B64;
    }
    if (typeof LOGO2_B64 !== 'undefined') {
        document.getElementById('preview-logo2').src = LOGO2_B64;
    }
    if (typeof QR_B64 !== 'undefined') {
        document.getElementById('p-qr-img').src = QR_B64;
    }

    const form = document.getElementById('completion-form');
    const btnReset = document.getElementById('btn-reset');
    const btnDownload = document.getElementById('btn-download');

    // DOM Elements for Preview
    const pDate = document.getElementById('p-date');
    const pProjectName = document.getElementById('p-project-name');
    const pSiteAddress = document.getElementById('p-site-address');
    const pProjectDetails = document.getElementById('p-project-details');
    const pClientName = document.getElementById('p-client-name');
    const pMobileNo = document.getElementById('p-mobile-no');
    
    const pAuthPerson = document.getElementById('p-auth-person');
    const pDateAuth = document.getElementById('p-date-auth');
    
    const pSignatureImg = document.getElementById('p-signature-img');

    // Form Inputs
    const fDate = document.getElementById('f-date');
    const fProjectName = document.getElementById('f-project-name');
    const fSiteAddress = document.getElementById('f-site-address');
    const fProjectDetails = document.getElementById('f-project-details');
    const fClientName = document.getElementById('f-client-name');
    const fMobileNo = document.getElementById('f-mobile-no');
    
    const fAuthPerson = document.getElementById('f-auth-person');

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    fDate.value = today;

    // Helper to format date
    function formatDate(dateString) {
        if (!dateString) return '____ / ____ / ______';
        const dateObj = new Date(dateString);
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        return `${day} / ${month} / ${year}`;
    }

    // Live Preview Update function
    function updatePreview() {
        pDate.textContent = formatDate(fDate.value);
        pDateAuth.textContent = formatDate(fDate.value);
        
        pProjectName.textContent = fProjectName.value || '---';
        
        // Handle multiline text properly for preview
        pSiteAddress.innerHTML = (fSiteAddress.value || '---').replace(/\n/g, '<br>');
        pProjectDetails.innerHTML = (fProjectDetails.value || '---').replace(/\n/g, '<br>');
        
        pClientName.textContent = fClientName.value || '---';
        pMobileNo.textContent = fMobileNo.value || '---';
        
        pAuthPerson.textContent = fAuthPerson.value || '---';
    }

    // Attach event listeners for live updates
    form.addEventListener('input', updatePreview);

    // Initial render
    updatePreview();

    // To use signature image from challan setup, if needed we can add a signature upload here too, 
    // but the user's PDF seems to have a predefined signature or just left blank. 
    // We'll use the pre-embedded signature for Glassentials if available.
    if (typeof SIG_B64 !== 'undefined' && SIG_B64.trim() !== '') {
        pSignatureImg.src = SIG_B64;
        pSignatureImg.style.display = 'block';
    }

    // Reset functionality
    btnReset.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the form?')) {
            form.reset();
            fDate.value = today; // restore today's date
            updatePreview();
        }
    });

    // Zoom Controls
    let currentZoom = 100;
    const zoomTarget = document.querySelector('.completion-wrapper');
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

    // PDF Download
    btnDownload.addEventListener('click', async () => {
        // Validation check for required fields
        if (!fProjectName.checkValidity() || !fClientName.checkValidity() || !fDate.checkValidity() || !fAuthPerson.checkValidity()) {
            form.reportValidity();
            return;
        }

        const element = document.getElementById('completion-preview');
        const projName = (fProjectName.value || 'Project').replace(/[^a-z0-9]/gi, '_').toUpperCase();

        btnDownload.disabled = true;
        btnDownload.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

        try {
            const opt = {
                margin:      [0, 0, 0, 0], // Set to 0 to prevent A4 overflow. We use CSS padding instead.
                filename:    `WORK_COMPLETION_${projName}.pdf`,
                image:       { type: 'jpeg', quality: 0.98 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: false, 
                    allowTaint: true, 
                    logging: false,
                    scrollX: 0,
                    scrollY: 0,
                },
                jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };
            // Instead of just calling save(), we intercept the PDF object
            // and forcefully delete any phantom second pages before downloading!
            await html2pdf()
                .set(opt)
                .from(element)
                .toPdf()
                .get('pdf')
                .then(function(pdf) {
                    const totalPages = pdf.internal.getNumberOfPages();
                    // If a phantom empty page was generated, kill it.
                    for (let i = totalPages; i > 1; i--) {
                        pdf.deletePage(i);
                    }
                })
                .save();

        } catch (err) {
            console.error('PDF error:', err);
            alert('PDF generation failed: ' + err.message);
        } finally {
            btnDownload.disabled = false;
            btnDownload.innerHTML = '<i class="fa-solid fa-download"></i> PDF';
        }
    });
});
