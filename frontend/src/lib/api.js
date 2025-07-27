import { getSession } from './auth.js';
import { CONFIG } from './config.js';

class APIError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'APIError';
        this.status = status;
    }
}

async function apiRequest(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new APIError(
                errorData.message || errorData.detail || `HTTP Error: ${response.status}`,
                response.status
            );
        }
        if (response.status === 204) return null;
        return await response.json();
    } catch (error) {
        console.error(`API Request failed for ${endpoint}:`, error);
        throw error;
    }
}

export async function saveGoogleRefreshToken(refreshToken) {
    const session = await getSession();
    if (!session) throw new APIError('User not authenticated.', 401);
    return apiRequest('/users/me/google-token', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh_token: refreshToken })
    });
}

export async function registerSpreadsheet(spreadsheetId, name) {
    const session = await getSession();
    if (!session) throw new APIError('User not authenticated.', 401);
    return apiRequest('/spreadsheets', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ spreadsheet_id: spreadsheetId, name: name.trim() })
    });
}

export async function getCanvases() {
    const session = await getSession();
    if (!session) throw new APIError('User not authenticated.', 401);
    return apiRequest('/canvases', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
}

export async function refreshSchema(spreadsheetId) {
    const session = await getSession();
    if (!session) throw new APIError('User not authenticated.', 401);
    return apiRequest(`/canvases/${encodeURIComponent(spreadsheetId)}/refresh-schema`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
    });
}

export async function getWorksheets(spreadsheetId) {
    const session = await getSession();
    if (!session) throw new APIError('User not authenticated.', 401);
    return apiRequest(`/spreadsheets/${encodeURIComponent(spreadsheetId)}/worksheets`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
}

export async function processReceipt(formData) {
    const session = await getSession();
    if (!session) throw new APIError('User not authenticated.', 401);
    return apiRequest('/process-receipt', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session.access_token}` },
        body: formData,
    });
}