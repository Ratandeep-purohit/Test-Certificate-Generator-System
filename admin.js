document.addEventListener('DOMContentLoaded', () => {
    const recordsBody = document.getElementById('records-body');
    const searchInput = document.getElementById('search-input');
    const filterType = document.getElementById('filter-type');
    const btnRefresh = document.getElementById('btn-refresh');
    const sortDate = document.getElementById('sort-date');

    let records = [];
    let sortAscending = false; // Default to newest first

    async function fetchRecords() {
        if (!supabaseClient || SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
            recordsBody.innerHTML = '<tr><td colspan="7" class="empty-state">Supabase is not configured. Please add your URL and Key to supabase-config.js</td></tr>';
            return;
        }

        recordsBody.innerHTML = '<tr><td colspan="7" class="empty-state"><i class="fa-solid fa-spinner fa-spin"></i> Loading records...</td></tr>';
        
        try {
            const { data, error } = await supabaseClient
                .from('certificates')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            records = data || [];
            updateDashboardCards();
            renderTable();
        } catch (err) {
            console.error(err);
            recordsBody.innerHTML = `<tr><td colspan="7" class="empty-state" style="color:red">Error loading data: ${err.message}</td></tr>`;
        }
    }

    function updateDashboardCards() {
        document.getElementById('count-total').textContent = records.length;
        document.getElementById('count-cert').textContent = records.filter(r => r.document_type === 'Test Certificate').length;
        document.getElementById('count-challan').textContent = records.filter(r => r.document_type === 'Delivery Challan').length;
        document.getElementById('count-quote').textContent = records.filter(r => r.document_type === 'Quotation').length;
        document.getElementById('count-comp').textContent = records.filter(r => r.document_type === 'Work Completion').length;
    }

    function renderTable() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = filterType.value;

        let filtered = records.filter(r => {
            const matchesSearch = 
                (r.employee_name && r.employee_name.toLowerCase().includes(searchTerm)) || 
                (r.customer_name && r.customer_name.toLowerCase().includes(searchTerm)) ||
                (r.document_no && r.document_no.toLowerCase().includes(searchTerm));
            
            const matchesType = selectedType === 'All' || r.document_type === selectedType;
            
            return matchesSearch && matchesType;
        });

        filtered.sort((a, b) => {
            const dateA = new Date(a.created_at).getTime();
            const dateB = new Date(b.created_at).getTime();
            return sortAscending ? dateA - dateB : dateB - dateA;
        });

        recordsBody.innerHTML = '';

        if (filtered.length === 0) {
            recordsBody.innerHTML = '<tr><td colspan="7" class="empty-state">No records found.</td></tr>';
            return;
        }

        filtered.forEach(r => {
            const row = document.createElement('tr');
            
            const d = new Date(r.created_at);
            const dateStr = d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const badgeClass = `type-${r.document_type.replace(/\s+/g, '-')}`;

            row.innerHTML = `
                <td>${dateStr}</td>
                <td><span class="type-badge ${badgeClass}">${r.document_type}</span></td>
                <td><strong>${r.document_no || '-'}</strong></td>
                <td>${r.customer_name || '-'}</td>
                <td>${r.employee_name || '-'}</td>
                <td>${r.document_date || '-'}</td>
                <td class="action-btns">
                    <a href="${getLinkForDocument(r)}" class="btn-view" target="_blank" style="text-decoration:none; display:inline-block;"><i class="fa-solid fa-eye"></i> View & Download</a>
                </td>
            `;
            recordsBody.appendChild(row);
        });
    }

    function getLinkForDocument(r) {
        if (r.document_type === 'Test Certificate') return `certificate.html?view_id=${r.id}`;
        if (r.document_type === 'Delivery Challan') return `challan.html?view_id=${r.id}`;
        if (r.document_type === 'Quotation') return `quotation.html?view_id=${r.id}`;
        if (r.document_type === 'Work Completion') return `completion.html?view_id=${r.id}`;
        return '#';
    }

    // Event Listeners
    searchInput.addEventListener('input', renderTable);
    filterType.addEventListener('change', renderTable);
    btnRefresh.addEventListener('click', fetchRecords);
    
    sortDate.addEventListener('click', () => {
        sortAscending = !sortAscending;
        renderTable();
    });

    // Initial load
    fetchRecords();
});
