const authContainer = document.getElementById('auth-container');
const appContent = document.getElementById('app-content');
const userEmailSpan = document.getElementById('user-email');
const selectedSheetName = document.getElementById('selected-sheet-name');
const worksheetSelect = document.getElementById('worksheet_name');
const resultDiv = document.getElementById('result');
const spinner = document.getElementById('spinner');
const receiptForm = document.getElementById('receipt-form');

export function initializeUI() {
    showAuthScreen();
}

export function showAuthScreen() {
    authContainer.style.display = 'block';
    appContent.style.display = 'none';
}

export function showAppScreen(user) {
    authContainer.style.display = 'none';
    appContent.style.display = 'block';
    userEmailSpan.textContent = user.email;
}

export function updateSelectedSheet(name) {
    selectedSheetName.textContent = name;
}

export function populateWorksheetsDropdown(worksheets) {
    worksheetSelect.innerHTML = '';
    if (worksheets.length === 0) {
        worksheetSelect.innerHTML = '<option value="">No worksheets found</option>';
        return;
    }
    worksheets.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        worksheetSelect.appendChild(option);
    });
    worksheetSelect.disabled = false;
}

export function setWorksheetDropdownLoading(isLoading) {
    worksheetSelect.disabled = isLoading;
    if (isLoading) {
        worksheetSelect.innerHTML = '<option>Loading worksheets...</option>';
    }
}

export function displayResult(data, isError = false) {
    resultDiv.textContent = '';
    if (isError) {
        resultDiv.textContent = `Error: ${data.message || 'An unknown error occurred.'}`;
    } else {
        resultDiv.textContent = `Status: ${data.status}\nMessage: ${data.message}`;
    }
}

export function showSpinner(isLoading) {
    spinner.style.display = isLoading ? 'block' : 'none';
}

export function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, duration);
}

export function validateForm(form) {
    const errors = [];
    if (!form.worksheet_name.value) {
        errors.push('Worksheet must be selected');
    }
    if (!form.image.files || form.image.files.length === 0) {
        errors.push('Receipt image must be selected');
    }
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

export function clearFormData() {
    receiptForm.reset();
    selectedSheetName.textContent = 'None';
    worksheetSelect.innerHTML = '<option value="">Select a spreadsheet first</option>';
    worksheetSelect.disabled = true;
    resultDiv.textContent = '';
}