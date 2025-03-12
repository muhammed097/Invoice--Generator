document.addEventListener('DOMContentLoaded', function () {
    // Logo upload functionality
    const logoUpload = document.getElementById('logo-upload');
    const logoPreview = document.getElementById('logo-preview');
    const removeLogo = document.getElementById('remove-logo');
    let logoData = null;

    logoUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            // Check file size (limit to 1MB)
            if (file.size > 1024 * 1024) {
                alert('File is too large. Maximum file size is 1MB.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function (event) {
                logoData = event.target.result;
                logoPreview.src = logoData;
                logoPreview.style.display = 'block';
                removeLogo.style.display = 'inline-block';
            };
            reader.readAsDataURL(file);
        }
    });

    removeLogo.addEventListener('click', function () {
        logoData = null;
        logoPreview.src = '';
        logoPreview.style.display = 'none';
        removeLogo.style.display = 'none';
        logoUpload.value = ''; // Reset the file input
    });

    // Currency settings
    const currencySelect = document.getElementById('currency-select');
    const currencySymbols = document.querySelectorAll('.currency-symbol');
    let selectedCurrency = currencySelect.value;
    let currencyName = 'Rupees';

    // Currency name mapping
    const currencyNames = {
        '₹': 'Rupees',
        '$': 'Dollars',
        '€': 'Euros',
        '£': 'Pounds',
        '¥': 'Yen'
    };

    // Update currency symbols when currency is changed
    currencySelect.addEventListener('change', function () {
        selectedCurrency = this.value;
        currencyName = currencyNames[selectedCurrency];

        // Update all currency symbols
        currencySymbols.forEach(symbol => {
            symbol.textContent = selectedCurrency;
        });

        // Update totals to reflect new currency
        updateTotals();
    });

    // Set today's date as default for invoice date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoice-date').value = today;

    // Calculate due date (30 days from today) as default
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    document.getElementById('due-date').value = dueDate.toISOString().split('T')[0];

    // Add event listeners for item rows
    document.getElementById('items-table').addEventListener('input', updateTotals);
    document.getElementById('items-table').addEventListener('click', function (e) {
        if (e.target.classList.contains('btn-remove')) {
            if (document.querySelectorAll('#item-rows tr').length > 1) {
                e.target.closest('tr').remove();
                updateRowNumbers();
                updateTotals();
            } else {
                alert('Cannot remove the last row. You need at least one item.');
            }
        }
    });

    // Add new item row
    document.getElementById('add-item').addEventListener('click', function () {
        const tableBody = document.getElementById('item-rows');
        const rowCount = tableBody.querySelectorAll('tr').length;

        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${rowCount + 1}</td>
            <td><input type="text" class="item-description" placeholder="Item description"></td>
            <td><input type="text" class="item-hsn" placeholder="HSN code"></td>
            <td><input type="number" class="item-quantity" value="1" min="1"></td>
            <td><input type="number" class="item-price" value="0" min="0" step="0.01"></td>
            <td><input type="number" class="item-gst-percent" value="0" min="0" max="100" step="0.01"></td>
            <td class="item-gst-amount">0.00</td>
            <td class="item-total">0.00</td>
            <td><button class="btn btn-remove">×</button></td>
        `;

        tableBody.appendChild(newRow);
    });

    // Generate invoice
    document.getElementById('generate-invoice').addEventListener('click', generateInvoice);

    // Print invoice
    document.getElementById('print-invoice').addEventListener('click', function () {
        if (document.getElementById('invoice-output').style.display === 'none') {
            alert('Please generate the invoice first.');
            return;
        }
        window.print();
    });


    // Update row numbers after removal
    function updateRowNumbers() {
        const rows = document.querySelectorAll('#item-rows tr');
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1;
        });
    }

    // Update totals when item details change
    function updateTotals() {
        const rows = document.querySelectorAll('#item-rows tr');
        let grandTotal = 0;
        let totalGstAmount = 0;

        rows.forEach(row => {
            const quantity = Math.max(parseFloat(row.querySelector('.item-quantity').value) || 0, 0);
            const price = Math.max(parseFloat(row.querySelector('.item-price').value) || 0, 0);
            const gstPercent = Math.max(parseFloat(row.querySelector('.item-gst-percent').value) || 0, 0);

            const subtotal = quantity * price;
            const gstAmount = (subtotal * gstPercent / 100);
            const total = subtotal + gstAmount;

            row.querySelector('.item-gst-amount').textContent = gstAmount.toFixed(2);
            row.querySelector('.item-total').textContent = total.toFixed(2);

            grandTotal += total;
            totalGstAmount += gstAmount;
        });

        document.getElementById('total-amount').innerHTML = `<span class="currency-symbol">${selectedCurrency}</span>${grandTotal.toFixed(2)}`;
        // Create or update GST total element if it doesn't exist yet
        if (!document.getElementById('total-gst-amount')) {
            const totalSection = document.querySelector('.total-section');
            const gstTotalElement = document.createElement('div');
            gstTotalElement.className = 'total-gst';
            gstTotalElement.innerHTML = `<span class="total-label">Total GST:</span>
                                         <span id="total-gst-amount" class="total-amount"><span class="currency-symbol">${selectedCurrency}</span>${totalGstAmount.toFixed(2)}</span>`;
            totalSection.insertBefore(gstTotalElement, totalSection.firstChild);
        } else {
            document.getElementById('total-gst-amount').innerHTML = `<span class="currency-symbol">${selectedCurrency}</span>${totalGstAmount.toFixed(2)}`;
        }

        document.getElementById('amount-in-words').textContent = numberToWords(grandTotal) + ' ' + currencyName + ' Only';
    }

    // Hide all error messages
    function hideAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.style.display = 'none';
        });

        // Reset border colors
        const inputElements = document.querySelectorAll('input, textarea');
        inputElements.forEach(el => {
            el.style.borderColor = '';
        });
    }

    // Show specific error
    function showError(id) {
        const element = document.getElementById(id);
        const errorElement = document.getElementById(id + '-error');
        if (element && errorElement) {
            element.style.borderColor = 'red';
            errorElement.style.display = 'block';
        }
    }

    // Generate the invoice
    function generateInvoice() {
        // Hide all previous errors
        hideAllErrors();

        // Validate form fields
        let isValid = true;

        // Required fields validation
        const requiredFields = [
            'invoice-number', 'invoice-date', 'due-date',
            'from-name', 'to-name'
        ];

        requiredFields.forEach(field => {
            const element = document.getElementById(field);
            if (!element.value.trim()) {
                showError(field);
                isValid = false;
            }
        });

        // Date validation
        const invoiceDate = new Date(document.getElementById('invoice-date').value);
        const dueDate = new Date(document.getElementById('due-date').value);

        if (dueDate < invoiceDate) {
            document.getElementById('due-date').style.borderColor = 'red';
            document.getElementById('due-date-error').textContent = 'Due date must be after invoice date';
            document.getElementById('due-date-error').style.display = 'block';
            isValid = false;
        }

        // Check if at least one item has description and price
        const items = document.querySelectorAll('#item-rows tr');
        let hasValidItem = false;

        items.forEach(item => {
            const description = item.querySelector('.item-description').value.trim();
            const price = parseFloat(item.querySelector('.item-price').value) || 0;

            if (description && price > 0) {
                hasValidItem = true;
            }
        });

        if (!hasValidItem) {
            document.getElementById('items-error').style.display = 'block';
            isValid = false;
        }

        if (!isValid) {
            alert('Please fix the highlighted errors before generating the invoice.');
            return;
        }

        // Get form values
        const invoiceNumber = document.getElementById('invoice-number').value;
        const invoiceDateValue = document.getElementById('invoice-date').value;
        const dueDateValue = document.getElementById('due-date').value;

        const fromName = document.getElementById('from-name').value;
        const fromAddress = document.getElementById('from-address').value;
        const fromPhone = document.getElementById('from-phone').value;
        const fromEmail = document.getElementById('from-email').value;

        const toName = document.getElementById('to-name').value;
        const toAddress = document.getElementById('to-address').value;
        const toPhone = document.getElementById('to-phone').value;
        const toEmail = document.getElementById('to-email').value;

        const fromGst = document.getElementById('from-gst').value;
        const toGst = document.getElementById('to-gst').value;

        const notes = document.getElementById('notes').value;

        // Format dates
        const formattedInvoiceDate = formatDate(invoiceDateValue);
        const formattedDueDate = formatDate(dueDateValue);

        // Generate item rows HTML
        let itemsHTML = '';
        let grandTotal = 0;
        let totalGstAmount = 0;

        items.forEach((item, index) => {
            const description = item.querySelector('.item-description').value;
            const hsnCode = item.querySelector('.item-hsn').value;
            const quantity = Math.max(parseFloat(item.querySelector('.item-quantity').value) || 0, 0);
            const price = Math.max(parseFloat(item.querySelector('.item-price').value) || 0, 0);
            const gstPercent = Math.max(parseFloat(item.querySelector('.item-gst-percent').value) || 0, 0);

            const subtotal = quantity * price;
            const gstAmount = (subtotal * gstPercent / 100);
            const total = subtotal + gstAmount;

            itemsHTML += `
        <tr>
            <td>${index + 1}</td>
            <td>${description}</td>
            <td>${hsnCode}</td>
            <td>${quantity}</td>
            <td>${selectedCurrency}${price.toFixed(2)}</td>
            <td>${gstPercent}%</td>
            <td>${selectedCurrency}${gstAmount.toFixed(2)}</td>
            <td>${selectedCurrency}${total.toFixed(2)}</td>
        </tr>
    `;

            grandTotal += total;
            totalGstAmount += gstAmount;
        });

        // Get banking details
        const bankName = document.getElementById('bank-name').value;
        const accountName = document.getElementById('account-name').value;
        const accountNumber = document.getElementById('account-number').value;
        const ifscCode = document.getElementById('ifsc-code').value;
        const branchDetails = document.getElementById('branch-details').value;
        const upiId = document.getElementById('upi-id').value;

        // Generate the invoice HTML
        const invoiceHTML = `
            ${logoData ? `
                <div style="text-align: left; margin-bottom: 20px;">
                    <img src="${logoData}" alt="Company Logo" style="max-height: 80px; max-width: 200px;">
                </div>
            ` : ''}
            <div class="invoice-header">
                <div>
                    <h1 class="invoice-title">INVOICE</h1>
                    <p class="invoice-number">#${invoiceNumber}</p>
                    <p>Issue Date: ${formattedInvoiceDate}</p>
                    <p>Due Date: ${formattedDueDate}</p>
                </div>
            </div>
            
           <div class="from-to-container">
    <div class="address-block">
        <h3 class="address-heading">From:</h3>
        <p><strong>${fromName}</strong></p>
        <p>${fromAddress.replace(/\n/g, '<br>')}</p>
        ${fromPhone ? `<p>Phone: ${fromPhone}</p>` : ''}
        ${fromEmail ? `<p>Email: ${fromEmail}</p>` : ''}
        ${fromGst ? `<p>GST: ${fromGst}</p>` : ''}
    </div>
    
    <div class="address-block">
        <h3 class="address-heading">To:</h3>
        <p><strong>${toName}</strong></p>
        <p>${toAddress.replace(/\n/g, '<br>')}</p>
        ${toPhone ? `<p>Phone: ${toPhone}</p>` : ''}
        ${toEmail ? `<p>Email: ${toEmail}</p>` : ''}
        ${toGst ? `<p>GST: ${toGst}</p>` : ''}
    </div>
</div>
            
    <table class="invoice-items">
    <thead>
        <tr>
            <th>SI No.</th>
            <th>Description</th>
            <th>HSN Code</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>GST %</th>
            <th>GST Amt</th>
            <th>Amount</th>
        </tr>
    </thead>
    <tbody>
        ${itemsHTML}
    </tbody>
</table>
            <div class="invoice-total">
    <p class="invoice-total-row">Total GST: ${selectedCurrency}${totalGstAmount.toFixed(2)}</p>
    <p class="invoice-total-row">Grand Total: ${selectedCurrency}${grandTotal.toFixed(2)}</p>
    <p><em>${numberToWords(grandTotal)} ${currencyName} Only</em></p>
</div>
            
            <div style="margin-top: 30px; border-top: 1px solid #dee2e6; padding-top: 20px;">
                <h3 style="color: #4361ee; margin-bottom: 10px;">Banking Details:</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 5px 10px 5px 0; font-weight: 600;">Bank Name:</td>
                        <td style="padding: 5px 0;">${bankName || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 10px 5px 0; font-weight: 600;">Account Holder:</td>
                        <td style="padding: 5px 0;">${accountName || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 10px 5px 0; font-weight: 600;">Account Number:</td>
                        <td style="padding: 5px 0;">${accountNumber || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 10px 5px 0; font-weight: 600;">IFSC Code:</td>
                        <td style="padding: 5px 0;">${ifscCode || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 10px 5px 0; font-weight: 600;">Branch:</td>
                        <td style="padding: 5px 0;">${branchDetails || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 5px 10px 5px 0; font-weight: 600;">UPI ID:</td>
                        <td style="padding: 5px 0;">${upiId || 'N/A'}</td>
                    </tr>
                </table>
            </div>
            
            ${notes ? `
            <div style="margin-top: 20px;">
                <h3 style="color: #4361ee; margin-bottom: 10px;">Notes:</h3>
                <p>${notes.replace(/\n/g, '<br>')}</p>
            </div>
            ` : ''}
        `;

        // Update the invoice output div and show it
        document.getElementById('invoice-output').innerHTML = invoiceHTML;
        document.getElementById('invoice-output').style.display = 'block';

        // Scroll to the invoice
        document.getElementById('invoice-output').scrollIntoView({ behavior: 'smooth' });
    }

    // Helper function to format dates
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();

        return `${day}/${month}/${year}`;
    }

    // Convert number to words (for various currencies)
    function numberToWords(number) {
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function convertLessThanOneThousand(num) {
            if (num === 0) {
                return '';
            }

            if (num < 20) {
                return units[num];
            }

            if (num < 100) {
                return tens[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + units[num % 10] : '');
            }

            return units[Math.floor(num / 100)] + ' Hundred' + (num % 100 !== 0 ? ' ' + convertLessThanOneThousand(num % 100) : '');
        }

        // Handle zero
        if (number === 0) {
            return 'Zero';
        }

        // Handle negative numbers
        const isNegative = number < 0;
        number = Math.abs(number);

        // Handle decimal
        const decimalPart = Math.round((number - Math.floor(number)) * 100);
        number = Math.floor(number);

        // Different naming systems based on currency
        const currencySystem = selectedCurrency === '₹' ? 'indian' : 'international';
        let result = '';

        if (currencySystem === 'indian') {
            // Indian numbering system (crore, lakh, thousand)
            if (number >= 10000000) { // Crore (10^7)
                result += convertLessThanOneThousand(Math.floor(number / 10000000)) + ' Crore ';
                number %= 10000000;
            }

            if (number >= 100000) { // Lakh (10^5)
                result += convertLessThanOneThousand(Math.floor(number / 100000)) + ' Lakh ';
                number %= 100000;
            }

            if (number >= 1000) { // Thousand
                result += convertLessThanOneThousand(Math.floor(number / 1000)) + ' Thousand ';
                number %= 1000;
            }
        } else {
            // International numbering system (million, thousand)
            if (number >= 1000000) { // Million
                result += convertLessThanOneThousand(Math.floor(number / 1000000)) + ' Million ';
                number %= 1000000;
            }

            if (number >= 1000) { // Thousand
                result += convertLessThanOneThousand(Math.floor(number / 1000)) + ' Thousand ';
                number %= 1000;
            }
        }

        if (number > 0) {
            result += convertLessThanOneThousand(number);
        }

        // Add decimal part if exists
        if (decimalPart > 0) {
            const subunitName = {
                '₹': 'Paise',
                '$': 'Cents',
                '€': 'Cents',
                '£': 'Pence',
                '¥': 'Sen'
            }[selectedCurrency] || 'Cents';

            result += ' and ' + convertLessThanOneThousand(decimalPart) + ' ' + subunitName;
        }

        return (isNegative ? 'Negative ' : '') + result.trim();
    }
});


