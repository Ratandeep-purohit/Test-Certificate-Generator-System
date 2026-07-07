document.addEventListener('DOMContentLoaded', () => {
    const recordsBody  = document.getElementById('records-body');
    const searchInput  = document.getElementById('search-input');
    const btnRefresh   = document.getElementById('btn-refresh');
    const sortDateTh   = document.getElementById('sort-date');
    const tableTitle   = document.getElementById('table-title');
    const tableCount   = document.getElementById('table-count');
    const activeTag    = document.getElementById('active-filter-tag');
    const filterTagTxt = document.getElementById('filter-tag-text');

    let records = [];
    let activeFilter = 'All';
    let sortAscending = false;

    // ---- FETCH ----
    async function fetchRecords() {
        if (!supabaseClient || SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
            recordsBody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-plug-circle-exclamation"></i><p>Supabase not configured. Add your URL and Key to supabase-config.js</p></td></tr>';
            return;
        }
        recordsBody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-circle-notch fa-spin"></i><p>Loading records...</p></td></tr>';
        try {
            const { data, error } = await supabaseClient
                .from('certificates')
                .select('*')
                .order('created_at', { ascending: false });
            if (error) throw error;
            records = data || [];
            updateCards();
            renderTable();
        } catch (err) {
            console.error(err);
            recordsBody.innerHTML = `<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p style="color:#ef4444">Error: ${err.message}</p></td></tr>`;
        }
    }

    // ---- CARDS ----
    function updateCards() {
        document.getElementById('count-total').textContent   = records.length;
        document.getElementById('count-cert').textContent    = records.filter(r => r.document_type === 'Test Certificate').length;
        document.getElementById('count-challan').textContent = records.filter(r => r.document_type === 'Delivery Challan').length;
        document.getElementById('count-quote').textContent   = records.filter(r => r.document_type === 'Quotation').length;
        document.getElementById('count-comp').textContent    = records.filter(r => r.document_type === 'Work Completion').length;
        document.getElementById('count-en356').textContent   = records.filter(r => r.document_type === 'EN 356 P6B Certificate').length;
    }

    // ---- RENDER TABLE ----
    function renderTable() {
        const searchTerm = searchInput.value.toLowerCase().trim();

        let filtered = records.filter(r => {
            const matchType   = activeFilter === 'All' || r.document_type === activeFilter;
            const matchSearch = !searchTerm ||
                (r.document_no     && r.document_no.toLowerCase().includes(searchTerm)) ||
                (r.customer_name   && r.customer_name.toLowerCase().includes(searchTerm)) ||
                (r.employee_name   && r.employee_name.toLowerCase().includes(searchTerm));
            return matchType && matchSearch;
        });

        filtered.sort((a, b) => {
            const diff = new Date(a.created_at) - new Date(b.created_at);
            return sortAscending ? diff : -diff;
        });

        // Update header
        tableTitle.textContent = activeFilter === 'All' ? 'All Records' : activeFilter;
        tableCount.textContent = `${filtered.length} record${filtered.length !== 1 ? 's' : ''}`;

        // Update active tag
        if (activeFilter !== 'All') {
            activeTag.style.display = 'inline-flex';
            filterTagTxt.textContent = activeFilter;
        } else {
            activeTag.style.display = 'none';
        }

        recordsBody.innerHTML = '';
        if (filtered.length === 0) {
            recordsBody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-inbox"></i><p>No records found.</p></td></tr>';
            return;
        }

        filtered.forEach(r => {
            const d = new Date(r.created_at);
            const dateStr = d.toLocaleDateString('en-IN') + ' ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            const badgeClass = 'badge-' + r.document_type.replace(/\s+/g, '-');
            const viewLink = getLinkForDocument(r);

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="color:var(--text-muted); font-size:0.8rem;">${dateStr}</td>
                <td><span class="badge ${badgeClass}">${r.document_type}</span></td>
                <td><strong>${r.document_no || '—'}</strong></td>
                <td>${r.customer_name || '—'}</td>
                <td>${r.employee_name || '—'}</td>
                <td style="color:var(--text-muted)">${r.document_date || '—'}</td>
                <td><a href="${viewLink}" class="btn-view" target="_blank"><i class="fa-solid fa-arrow-up-right-from-square"></i> View & Download</a></td>
            `;
            recordsBody.appendChild(tr);
        });
    }

    function getLinkForDocument(r) {
        const map = {
            'Test Certificate':       'certificate.html',
            'Delivery Challan':       'challan.html',
            'Quotation':              'quotation.html',
            'Work Completion':        'completion.html',
            'EN 356 P6B Certificate': 'en356.html'
        };
        return `${map[r.document_type] || 'index.html'}?view_id=${r.id}`;
    }

    // ---- FILTER HELPERS ----
    function setFilter(value) {
        activeFilter = value;

        // Update sidebar active state
        document.querySelectorAll('.sidebar-link[data-filter]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === value);
        });

        renderTable();
    }

    // ---- EVENT LISTENERS ----

    // Sidebar filter buttons
    document.querySelectorAll('.sidebar-link[data-filter]').forEach(btn => {
        btn.addEventListener('click', () => setFilter(btn.dataset.filter));
    });

    // Dashboard cards as filters
    document.querySelectorAll('.card[data-filter]').forEach(card => {
        card.addEventListener('click', () => setFilter(card.dataset.filter));
    });

    // Clear filter tag
    activeTag.addEventListener('click', () => setFilter('All'));

    // Search
    searchInput.addEventListener('input', renderTable);

    // Refresh
    btnRefresh.addEventListener('click', fetchRecords);

    // Sort by date toggle
    sortDateTh.addEventListener('click', () => {
        sortAscending = !sortAscending;
        sortDateTh.innerHTML = `Created At <i class="fa-solid fa-arrow-${sortAscending ? 'up' : 'down'}-short-wide"></i>`;
        renderTable();
    });

    // Initial load
    fetchRecords();
});
