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

        // Update discount symbol if fixed amount is selected
        if (discountType.value === 'fixed') {
            discountSymbol.textContent = selectedCurrency;
        }

        // Update GST visibility based on currency
        updateGSTVisibility();
    });

    // Function to control GST visibility based on currency
    function updateGSTVisibility() {
        const isIndianCurrency = selectedCurrency === '₹';
        
        // Get all GST column headers and cells
        const gstPercentHeaders = document.querySelectorAll('th:nth-child(6)');
        const gstAmountHeaders = document.querySelectorAll('th:nth-child(7)');
        const gstPercentCells = document.querySelectorAll('.item-gst-percent');
        const gstAmountCells = document.querySelectorAll('.item-gst-amount');
        
        // Show/hide GST columns based on currency
        if (isIndianCurrency) {
            // Show GST columns
            gstPercentHeaders.forEach(header => header.style.display = 'table-cell');
            gstAmountHeaders.forEach(header => header.style.display = 'table-cell');
            gstPercentCells.forEach(cell => cell.closest('td').style.display = 'table-cell');
            gstAmountCells.forEach(cell => cell.closest('td').style.display = 'table-cell');
        } else {
            // Hide GST columns
            gstPercentHeaders.forEach(header => header.style.display = 'none');
            gstAmountHeaders.forEach(header => header.style.display = 'none');
            gstPercentCells.forEach(cell => cell.closest('td').style.display = 'none');
            gstAmountCells.forEach(cell => cell.closest('td').style.display = 'none');
        }
        
        // Update totals to recalculate with/without GST
        updateTotals();
    }

    // Discount functionality
    const discountType = document.getElementById('discount-type');
    const discountValue = document.getElementById('discount-value');
    const discountValueContainer = document.querySelector('.discount-value-container');
    const discountAmountDisplay = document.getElementById('discount-amount-display');
    const discountAmount = document.getElementById('discount-amount');
    const discountSymbol = document.querySelector('.discount-symbol');

    // Initialize discount variables
    let currentDiscountType = 'none';
    let currentDiscountValue = 0;
    let currentDiscountAmount = 0;

    // Show/hide discount value input based on discount type
    discountType.addEventListener('change', function() {
        currentDiscountType = this.value;
        
        if (this.value === 'none') {
            discountValueContainer.style.display = 'none';
            discountAmountDisplay.style.display = 'none';
            currentDiscountValue = 0;
        } else {
            discountValueContainer.style.display = 'flex';
            discountAmountDisplay.style.display = 'block';
            
            // Update the symbol for the discount type
            if (this.value === 'percentage') {
                discountSymbol.textContent = '%';
            } else if (this.value === 'fixed') {
                discountSymbol.textContent = selectedCurrency;
            }
        }
        
        // Reset discount value when type changes
        discountValue.value = '';
        updateTotals();
    });

    // Update totals when discount value changes
    discountValue.addEventListener('input', function() {
        currentDiscountValue = parseFloat(this.value) || 0;
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
        const isIndianCurrency = selectedCurrency === '₹';

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
        
        // Apply GST visibility to the new row
        if (!isIndianCurrency) {
            newRow.querySelector('.item-gst-percent').closest('td').style.display = 'none';
            newRow.querySelector('.item-gst-amount').closest('td').style.display = 'none';
        }
    });

    // Generate invoice
    document.getElementById('generate-invoice').addEventListener('click', function() {
        generateInvoice();
        saveUserProfile(); // Save user profile after generating invoice
    });

    // Print invoice with improved print handling
    document.getElementById('print-invoice').addEventListener('click', function () {
        if (document.getElementById('invoice-output').style.display === 'none') {
            alert('Please generate the invoice first.');
            return;
        }
        
        // Add print-specific styles
        const printStyle = document.createElement('style');
        printStyle.id = 'print-styles';
        printStyle.textContent = `
            @media print {
                body, html {
                    width: 100%;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    box-shadow: none;
                    max-width: 100%;
                    margin: 0;
                    padding: 0;
                }
                .form-container, header, .invoice-actions, .footer, .popup-overlay {
                    display: none !important;
                }
                .invoice-output {
                    margin: 0;
                    padding: 20px;
                    box-shadow: none;
                    border: none;
                    width: 100%;
                }
            }
        `;
        document.head.appendChild(printStyle);

        printStyle.textContent += `
        .invoice-items {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
            white-space: normal !important;
            overflow-x: visible !important;
            display: table !important;
        }
        .invoice-items:before {
            display: none !important;
        }
        .invoice-items th, .invoice-items td {
            white-space: normal !important;
            word-wrap: break-word !important;
            overflow: hidden !important;
            page-break-inside: avoid !important;
            padding: 8px 4px !important;
            vertical-align: top !important;
            font-size: 11pt !important;
        }

        /* Define explicit column widths for print */
        .invoice-items th:nth-child(1), .invoice-items td:nth-child(1) { width: 5% !important; text-align: center !important; }
        .invoice-items th:nth-child(2), .invoice-items td:nth-child(2) { width: 25% !important; text-align: left !important; }
        .invoice-items th:nth-child(3), .invoice-items td:nth-child(3) { width: 10% !important; text-align: center !important; }
        .invoice-items th:nth-child(4), .invoice-items td:nth-child(4) { width: 8% !important; text-align: right !important; }
        .invoice-items th:nth-child(5), .invoice-items td:nth-child(5) { width: 12% !important; text-align: right !important; }
        .invoice-items th:nth-child(6), .invoice-items td:nth-child(6) { width: 8% !important; text-align: right !important; }
        .invoice-items th:nth-child(7), .invoice-items td:nth-child(7) { width: 12% !important; text-align: right !important; }
        .invoice-items th:nth-child(8), .invoice-items td:nth-child(8) { width: 15% !important; text-align: right !important; }

        /* Ensure page breaks don't occur at bad places */
        .invoice-total, .from-to-container, .banking-details {
            page-break-inside: avoid !important;
        }
        `;

        // Execute print
        window.print();

        // Clean up after printing
        setTimeout(function() {
            document.head.removeChild(printStyle);
        }, 1000);
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
        let subtotal = 0;
        let totalGstAmount = 0;
        const isIndianCurrency = selectedCurrency === '₹';

        rows.forEach(row => {
            const quantity = Math.max(parseFloat(row.querySelector('.item-quantity').value) || 0, 0);
            const price = Math.max(parseFloat(row.querySelector('.item-price').value) || 0, 0);
            
            const rowSubtotal = quantity * price;
            let gstAmount = 0;
            
            // Only calculate GST for Indian currency
            if (isIndianCurrency) {
                const gstPercent = Math.max(parseFloat(row.querySelector('.item-gst-percent').value) || 0, 0);
                gstAmount = (rowSubtotal * gstPercent / 100);
                row.querySelector('.item-gst-amount').textContent = gstAmount.toFixed(2);
            }
            
            const total = rowSubtotal + gstAmount;
            row.querySelector('.item-total').textContent = total.toFixed(2);

            subtotal += rowSubtotal;
            totalGstAmount += gstAmount;
        });

        // Calculate discount
        currentDiscountAmount = 0;
        if (currentDiscountType === 'percentage' && currentDiscountValue > 0) {
            currentDiscountAmount = (subtotal * currentDiscountValue / 100);
        } else if (currentDiscountType === 'fixed' && currentDiscountValue > 0) {
            currentDiscountAmount = Math.min(currentDiscountValue, subtotal); // Can't discount more than subtotal
        }

        // Calculate grand total with discount and GST (if applicable)
        const grandTotal = subtotal + (isIndianCurrency ? totalGstAmount : 0) - currentDiscountAmount;

        // Display discount amount
        if (currentDiscountType !== 'none' && currentDiscountAmount > 0) {
            discountAmount.innerHTML = `<span class="currency-symbol">${selectedCurrency}</span>${currentDiscountAmount.toFixed(2)}`;
            discountAmountDisplay.style.display = 'block';
        } else {
            discountAmountDisplay.style.display = 'none';
        }

        // Update GST total display only for Indian currency
        const totalGstElement = document.getElementById('total-gst-amount');
        const totalSection = document.querySelector('.total-section');
        
        if (isIndianCurrency) {
            if (!totalGstElement) {
                const gstTotalElement = document.createElement('div');
                gstTotalElement.className = 'total-gst';
                gstTotalElement.innerHTML = `<span class="total-label">Total GST:</span>
                                            <span id="total-gst-amount" class="total-amount"><span class="currency-symbol">${selectedCurrency}</span>${totalGstAmount.toFixed(2)}</span>`;
                totalSection.insertBefore(gstTotalElement, totalSection.firstChild);
            } else {
                totalGstElement.innerHTML = `<span class="currency-symbol">${selectedCurrency}</span>${totalGstAmount.toFixed(2)}`;
                totalGstElement.parentElement.style.display = 'flex';
            }
        } else if (totalGstElement) {
            // Hide the GST total element for non-Indian currency
            totalGstElement.parentElement.style.display = 'none';
        }

        // Add subtotal display if discount is applied
        if (currentDiscountAmount > 0) {
            if (!document.getElementById('subtotal-amount')) {
                const subtotalElement = document.createElement('div');
                subtotalElement.className = 'total-subtotal';
                subtotalElement.innerHTML = `<span class="total-label">Subtotal:</span>
                                            <span id="subtotal-amount" class="total-amount"><span class="currency-symbol">${selectedCurrency}</span>${subtotal.toFixed(2)}</span>`;
                totalSection.insertBefore(subtotalElement, totalSection.firstChild);
            } else {
                document.getElementById('subtotal-amount').innerHTML = `<span class="currency-symbol">${selectedCurrency}</span>${subtotal.toFixed(2)}`;
            }
        } else if (document.getElementById('subtotal-amount')) {
            document.querySelector('.total-subtotal').remove();
        }

        // Update grand total
        document.getElementById('total-amount').innerHTML = `<span class="currency-symbol">${selectedCurrency}</span>${grandTotal.toFixed(2)}`;
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

        // Check if we're using Indian currency for GST
        const isIndianCurrency = selectedCurrency === '₹';
        
        // Generate item rows HTML with conditional GST columns
        let itemsHTML = '';
        let subtotal = 0;
        let totalGstAmount = 0;

        items.forEach((item, index) => {
            const description = item.querySelector('.item-description').value;
            const hsnCode = item.querySelector('.item-hsn').value;
            const quantity = Math.max(parseFloat(item.querySelector('.item-quantity').value) || 0, 0);
            const price = Math.max(parseFloat(item.querySelector('.item-price').value) || 0, 0);
            
            const rowSubtotal = quantity * price;
            let gstAmount = 0;
            let gstPercentValue = 0;
            
            // Only calculate GST for Indian currency
            if (isIndianCurrency) {
                gstPercentValue = Math.max(parseFloat(item.querySelector('.item-gst-percent').value) || 0, 0);
                gstAmount = (rowSubtotal * gstPercentValue / 100);
            }
            
            const total = rowSubtotal + gstAmount;

            subtotal += rowSubtotal;
            totalGstAmount += gstAmount;

            // Format numbers with commas for better readability
            const formattedPrice = price.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
            
            const formattedGstAmount = gstAmount.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
            
            const formattedTotal = total.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });

            // Conditionally include GST columns based on currency
            if (isIndianCurrency) {
                itemsHTML += `
                    <tr>
                        <td style="text-align: center;">${index + 1}</td>
                        <td>${description}</td>
                        <td style="text-align: center;">${hsnCode}</td>
                        <td style="text-align: right;">${quantity}</td>
                        <td style="text-align: right;">${selectedCurrency}${formattedPrice}</td>
                        <td style="text-align: right;">${gstPercentValue}%</td>
                        <td style="text-align: right;">${selectedCurrency}${formattedGstAmount}</td>
                        <td style="text-align: right;">${selectedCurrency}${formattedTotal}</td>
                    </tr>
                `;
            } else {
                itemsHTML += `
                    <tr>
                        <td style="text-align: center;">${index + 1}</td>
                        <td>${description}</td>
                        <td style="text-align: center;">${hsnCode}</td>
                        <td style="text-align: right;">${quantity}</td>
                        <td style="text-align: right;">${selectedCurrency}${formattedPrice}</td>
                        <td style="text-align: right;">${selectedCurrency}${formattedTotal}</td>
                    </tr>
                `;
            }
        });

        // Apply discount if applicable
        let discountInfo = '';
        let grandTotal = subtotal + (isIndianCurrency ? totalGstAmount : 0);
        
        if (currentDiscountType !== 'none' && currentDiscountAmount > 0) {
            const discountTypeLabel = currentDiscountType === 'percentage' 
                ? `${currentDiscountValue}%` 
                : `${selectedCurrency}${currentDiscountValue.toFixed(2)}`;
            
            const formattedSubtotal = subtotal.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
            
            const formattedDiscountAmount = currentDiscountAmount.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
            });
            
            discountInfo = `
                <p class="invoice-total-row">Subtotal: ${selectedCurrency}${formattedSubtotal}</p>
                <p class="invoice-total-row" style="color: #e63946;">Discount (${discountTypeLabel}): - ${selectedCurrency}${formattedDiscountAmount}</p>
            `;
            
            // Adjust grand total with discount
            grandTotal = subtotal + (isIndianCurrency ? totalGstAmount : 0) - currentDiscountAmount;
        }

        // Format the grand total and total GST with commas
        const formattedGrandTotal = grandTotal.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });
        
        const formattedTotalGstAmount = totalGstAmount.toLocaleString('en-IN', {
            maximumFractionDigits: 2,
            minimumFractionDigits: 2
        });

        // Get banking details
        const bankName = document.getElementById('bank-name').value;
        const accountName = document.getElementById('account-name').value;
        const accountNumber = document.getElementById('account-number').value;
        const ifscCode = document.getElementById('ifsc-code').value;
        const branchDetails = document.getElementById('branch-details').value;
        const upiId = document.getElementById('upi-id').value;

        // Generate table headers based on currency
        let tableHeaders;
        if (isIndianCurrency) {
            tableHeaders = `
                <thead>
                    <tr>
                        <th style="width:5%; text-align:center;">SI No.</th>
                        <th style="width:25%; text-align:left;">Description</th>
                        <th style="width:10%; text-align:center;">HSN Code</th>
                        <th style="width:8%; text-align:right;">Quantity</th>
                        <th style="width:12%; text-align:right;">Price</th>
                        <th style="width:8%; text-align:right;">GST %</th>
                        <th style="width:12%; text-align:right;">GST Amt</th>
                        <th style="width:15%; text-align:right;">Amount</th>
                    </tr>
                </thead>
            `;
        } else {
            tableHeaders = `
                <thead>
                    <tr>
                        <th style="width:5%; text-align:center;">SI No.</th>
                        <th style="width:30%; text-align:left;">Description</th>
                        <th style="width:10%; text-align:center;">HSN Code</th>
                        <th style="width:10%; text-align:right;">Quantity</th>
                        <th style="width:15%; text-align:right;">Price</th>
                        <th style="width:20%; text-align:right;">Amount</th>
                    </tr>
                </thead>
            `;
        }

        // Generate the invoice total section with conditional GST display
        let invoiceTotalHTML = `
            <div class="invoice-total">
                ${discountInfo}
        `;
        
        // Only show GST total for Indian currency
        if (isIndianCurrency) {
            invoiceTotalHTML += `
                <p class="invoice-total-row">Total GST: ${selectedCurrency}${formattedTotalGstAmount}</p>
            `;
        }
        
        invoiceTotalHTML += `
                <p class="invoice-total-row" style="font-size: 20px; color: var(--primary-color);">Grand Total: ${selectedCurrency}${formattedGrandTotal}</p>
                <p><em>${numberToWords(grandTotal)} ${currencyName} Only</em></p>
            </div>
        `;

        // Generate the invoice HTML with improved print layout
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
                    ${fromGst && isIndianCurrency ? `<p>GST: ${fromGst}</p>` : ''}
                </div>
                
                <div class="address-block">
                    <h3 class="address-heading">To:</h3>
                    <p><strong>${toName}</strong></p>
                    <p>${toAddress.replace(/\n/g, '<br>')}</p>
                    ${toPhone ? `<p>Phone: ${toPhone}</p>` : ''}
                    ${toEmail ? `<p>Email: ${toEmail}</p>` : ''}
                    ${toGst && isIndianCurrency ? `<p>GST: ${toGst}</p>` : ''}
                </div>
            </div>
            
            <table class="invoice-items" style="width:100%; table-layout:fixed; border-collapse:collapse;">
                ${tableHeaders}
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            ${invoiceTotalHTML}
            
            <div class="banking-details" style="margin-top: 30px; border-top: 1px solid #dee2e6; padding-top: 20px;">
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
            ` : ''}`;

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

    // NEW FUNCTIONALITY: Save and Load User Profile
    
    // Function to save user profile data
    function saveUserProfile() {
        const userProfile = {
            // Logo
            logoData: logoData,
            
            // Sender information
            fromName: document.getElementById('from-name').value,
            fromAddress: document.getElementById('from-address').value,
            fromPhone: document.getElementById('from-phone').value,
            fromEmail: document.getElementById('from-email').value,
            fromGst: document.getElementById('from-gst').value,
            
            // Banking details
            bankName: document.getElementById('bank-name').value,
            accountName: document.getElementById('account-name').value,
            accountNumber: document.getElementById('account-number').value,
            ifscCode: document.getElementById('ifsc-code').value,
            branchDetails: document.getElementById('branch-details').value,
            upiId: document.getElementById('upi-id').value,
            
            // Currency
            currency: selectedCurrency,
            
            // Notes - might be reusable
            notes: document.getElementById('notes').value
        };
        
        try {
            localStorage.setItem('invoiceUserProfile', JSON.stringify(userProfile));
            
            // Create a downloadable JSON file as backup
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userProfile));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "invoice_profile.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            showMessage('Profile saved successfully! A backup file has also been downloaded.');
        } catch (e) {
            console.error('Error saving profile:', e);
            alert('Could not save profile. Your browser might have restrictions on local storage.');
        }
    }

    // Function to load user profile data
    function loadUserProfile(profileData) {
        try {
            const profile = typeof profileData === 'string' ? JSON.parse(profileData) : profileData;
            
            // Load logo if exists
            if (profile.logoData) {
                logoData = profile.logoData;
                logoPreview.src = logoData;
                logoPreview.style.display = 'block';
                removeLogo.style.display = 'inline-block';
            }
            
            // Load sender information
            document.getElementById('from-name').value = profile.fromName || '';
            document.getElementById('from-address').value = profile.fromAddress || '';
            document.getElementById('from-phone').value = profile.fromPhone || '';
            document.getElementById('from-email').value = profile.fromEmail || '';
            document.getElementById('from-gst').value = profile.fromGst || '';
            
            // Load banking details
            document.getElementById('bank-name').value = profile.bankName || '';
            document.getElementById('account-name').value = profile.accountName || '';
            document.getElementById('account-number').value = profile.accountNumber || '';
            document.getElementById('ifsc-code').value = profile.ifscCode || '';
            document.getElementById('branch-details').value = profile.branchDetails || '';
            document.getElementById('upi-id').value = profile.upiId || '';
            
            // Load currency
            if (profile.currency) {
                document.getElementById('currency-select').value = profile.currency;
                // Trigger change event to update currency throughout the form
                const event = new Event('change');
                document.getElementById('currency-select').dispatchEvent(event);
            }
            
            // Load notes
            document.getElementById('notes').value = profile.notes || '';
            
            showMessage('Profile loaded successfully!');
        } catch (e) {
            console.error('Error loading profile:', e);
            alert('Could not load profile. The file might be corrupted.');
        }
    }
    
    // Function to load profile from localStorage on page load
    function loadSavedProfile() {
        const savedProfile = localStorage.getItem('invoiceUserProfile');
        if (savedProfile) {
            try {
                loadUserProfile(JSON.parse(savedProfile));
            } catch (e) {
                console.error('Error parsing saved profile:', e);
            }
        }
    }
    
    // Function to handle file upload for profile
    function handleProfileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const profileData = JSON.parse(event.target.result);
                    loadUserProfile(profileData);
                } catch (e) {
                    console.error('Error parsing profile file:', e);
                    alert('Could not load profile. The file might be corrupted.');
                }
            };
            reader.readAsText(file);
        }
    }

    // Show a temporary message to the user
    function showMessage(message) {
        // Create message element if it doesn't exist
        if (!document.getElementById('message-container')) {
            const messageContainer = document.createElement('div');
            messageContainer.id = 'message-container';
            messageContainer.style.cssText = `
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #4361ee;
                color: white;
                padding: 12px 24px;
                border-radius: 5px;
                box-shadow: 0 3px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                display: none;
                font-weight: 600;
                font-size: 16px;
            `;
            document.body.appendChild(messageContainer);
        }
        
        const messageContainer = document.getElementById('message-container');
        messageContainer.textContent = message;
        messageContainer.style.display = 'block';
        
        // Hide message after a few seconds
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 3000);
    }
    
    // Create event listeners for new buttons
    document.getElementById('save-profile').addEventListener('click', saveUserProfile);
    document.getElementById('profile-upload').addEventListener('change', handleProfileUpload);
    
    // Load saved profile on page load
    loadSavedProfile();
    
    // Set initial GST visibility based on default currency
    updateGSTVisibility();
});


// Popup functionality
const popup = document.getElementById('welcome-popup');
const closePopup = document.querySelector('.close-popup');
const redirectButton = document.getElementById('redirect-button');
const redirectUrl = "https://wa.me/+916380986703"; 

// Redirect when button is clicked - opens in a new tab
redirectButton.addEventListener('click', () => {
    window.open(redirectUrl, '_blank');
});

// Show popup when page loads (with a slight delay for better UX)
setTimeout(() => {
    popup.style.display = 'flex';
}, 1000);

// Close popup when close button is clicked
closePopup.addEventListener('click', () => {
    popup.style.display = 'none';
});

// Close popup when clicking outside of it
window.addEventListener('click', (e) => {
    if (e.target === popup) {
        popup.style.display = 'none';
    }
});

// Store popup state in localStorage to control how often it's shown
const popupLastShown = localStorage.getItem('popupLastShown');
const currentTime = new Date().getTime();

// Check if popup was shown in the last 24 hours
if (popupLastShown && currentTime - popupLastShown < 24 * 60 * 60 * 1000) {
    // Don't show popup if it was shown in the last 24 hours
    popup.style.display = 'none';
} else {
    // Update the last shown time
    localStorage.setItem('popupLastShown', currentTime);
}