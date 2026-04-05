// admin.js

const SCRIPT_URL = window.GOOGLE_SCRIPT_URL || '';

// Mock data (fallback if no API connected)
let mockData = [
    { row: 2, timestamp: new Date().toISOString(), name: "John Doe", email: "john@example.com", phone: "+91 9876543210", message: "Interested in AI automation.", status: "New" },
    { row: 3, timestamp: new Date(Date.now() - 86400000).toISOString(), name: "Jane Smith", email: "jane@example.com", phone: "+91 9988776655", message: "Need web development.", status: "Contacted" },
    { row: 4, timestamp: new Date(Date.now() - 172800000).toISOString(), name: "Raj Kumar", email: "raj@company.in", phone: "+91 9123456789", message: "Graphic design query.", status: "Closed" }
];

let leadsData = [];
let refreshTimer = null;
let countdownInterval = null;
let countdownValue = 10;

// Elements
const loginContainer = document.getElementById('login-container');
const dashboardContainer = document.getElementById('dashboard-container');
const tbody = document.getElementById('leads-tbody');
const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const countdownEl = document.getElementById('countdown');

// Login Logic
document.getElementById('login-btn').addEventListener('click', () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const err = document.getElementById('login-error');

    if (user === 'GrowNex' && pass === 'Pranav@1022') {
        sessionStorage.setItem('isAdmin', 'true');
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'flex';
        initDashboard();
    } else {
        err.style.display = 'block';
    }
});

// Logout Logic
document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('isAdmin');
    dashboardContainer.style.display = 'none';
    loginContainer.style.display = 'flex';
    clearInterval(refreshTimer);
    clearInterval(countdownInterval);
});

// Check auth on load
document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isAdmin') === 'true') {
        loginContainer.style.display = 'none';
        dashboardContainer.style.display = 'flex';
        initDashboard();
    }
});

// Dashboard Init
function initDashboard() {
    fetchData();
    startAutoRefresh();

    document.getElementById('refresh-btn').addEventListener('click', () => {
        fetchData();
        resetCountdown();
    });

    searchInput.addEventListener('input', renderTable);
    statusFilter.addEventListener('change', renderTable);

    document.getElementById('download-csv-btn').addEventListener('click', downloadCSV);
}

// Fetch Data
async function fetchData() {
    const localLeads = JSON.parse(localStorage.getItem('grownex_leads')) || [];
    
    if (localLeads.length > 0) {
        leadsData = localLeads; // Show real form submissions
    } else {
        leadsData = [...mockData]; // Fallback if no real data exists yet
    }
    
    renderTable();
}

function startAutoRefresh() {
    resetCountdown();
    refreshTimer = setInterval(() => {
        fetchData();
        resetCountdown();
    }, 10000); // 10 seconds

    countdownInterval = setInterval(() => {
        countdownValue--;
        if (countdownValue < 0) countdownValue = 10;
        countdownEl.innerText = countdownValue;
    }, 1000);
}

function resetCountdown() {
    countdownValue = 10;
    countdownEl.innerText = countdownValue;
}

// Render Table
function renderTable() {
    tbody.innerHTML = '';
    const query = searchInput.value.toLowerCase();
    const filter = statusFilter.value;

    const filtered = leadsData.reverse().filter(lead => {
        const matchesSearch = (lead.name || "").toLowerCase().includes(query) ||
            (lead.email || "").toLowerCase().includes(query) ||
            (lead.phone || "").toLowerCase().includes(query);
        const matchesStatus = filter === 'All' || lead.status === filter;
        return matchesSearch && matchesStatus;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 32px; color: var(--text-secondary);">No leads found.</td></tr>';
        return;
    }

    filtered.forEach(lead => {
        const date = lead.timestamp ? new Date(lead.timestamp).toLocaleDateString() : 'N/A';
        const statusClass = `status-${lead.status ? lead.status.toLowerCase() : 'new'}`;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${date}</td>
            <td style="font-weight: 600;">${lead.name || '-'}</td>
            <td>${lead.email || '-'}</td>
            <td>${lead.phone || '-'}</td>
            <td style="max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${lead.message}">${lead.message || '-'}</td>
            <td><span class="status-badge ${statusClass}">${lead.status || 'New'}</span></td>
            <td>
                <select class="action-select" onchange="updateRowStatus(${lead.row}, this.value, '${lead.status}')">
                    <option value="" disabled selected>Update</option>
                    <option value="New" ${lead.status === 'New' ? 'disabled' : ''}>Mark New</option>
                    <option value="Contacted" ${lead.status === 'Contacted' ? 'disabled' : ''}>Mark Contacted</option>
                    <option value="Closed" ${lead.status === 'Closed' ? 'disabled' : ''}>Mark Closed</option>
                </select>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Update Status
async function updateRowStatus(rowId, newStatus, oldStatus) {
    const localLeads = JSON.parse(localStorage.getItem('grownex_leads')) || [];
    const leadIndex = localLeads.findIndex(l => l.row === rowId);
    
    if (leadIndex !== -1) {
        localLeads[leadIndex].status = newStatus;
        localStorage.setItem('grownex_leads', JSON.stringify(localLeads));
    } else {
        // Fallback for mock data update
        const mockLead = mockData.find(l => l.row === rowId);
        if (mockLead) mockLead.status = newStatus;
    }
    
    fetchData();
}

// Download CSV
function downloadCSV() {
    if (leadsData.length === 0) return;

    const headers = ['Date', 'Name', 'Email', 'Phone', 'Message', 'Status'];
    const csvRows = [];
    csvRows.push(headers.join(','));

    leadsData.forEach(lead => {
        const date = lead.timestamp ? new Date(lead.timestamp).toLocaleDateString() : 'N/A';
        const values = [
            date,
            lead.name || '',
            lead.email || '',
            lead.phone || '',
            // Escape commas and quotes in message
            `"${(lead.message || '').replace(/"/g, '""')}"`,
            lead.status || ''
        ];
        csvRows.push(values.join(','));
    });

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `GrowNex_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
