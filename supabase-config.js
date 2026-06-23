// Supabase Configuration
// Replace these with your actual Supabase Project URL and Anon Key
const SUPABASE_URL = 'https://kdlwrcxlrfrrtetbesfl.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_3y90-Ixr2dzf8h1uh5pRuQ_TGadcRt8';

let supabaseClient = null;

if (typeof supabase !== 'undefined') {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
    console.warn("Supabase SDK not loaded. Database features will not work.");
}

/**
 * Saves a document record to Supabase
 * @param {Object} data - The document data to save
 * @param {string} data.document_type - e.g., 'Test Certificate', 'Delivery Challan'
 * @param {string} data.document_no - Document identifier
 * @param {string} data.customer_name - Customer or Client name
 * @param {string} data.employee_name - Employee/Authorized person name
 * @param {string} data.document_date - Date string of the document
 * @param {Object} data.details - Optional JSON payload for additional fields
 */
async function saveDocumentToDB(data) {
    if (!supabaseClient || SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
        console.warn("Skipping DB save: Supabase is not configured.");
        return;
    }

    try {
        const { error } = await supabaseClient
            .from('certificates')
            .insert([
                {
                    document_type: data.document_type,
                    document_no: data.document_no || 'N/A',
                    customer_name: data.customer_name || 'N/A',
                    employee_name: data.employee_name || 'N/A',
                    document_date: data.document_date || new Date().toISOString().split('T')[0],
                    details: data.details || {}
                }
            ]);

        if (error) throw error;
        console.log("Document saved to DB successfully!");
    } catch (err) {
        console.error("Error saving document to DB:", err.message);
    }
}
