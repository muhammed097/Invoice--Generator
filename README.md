# Invoice--Generator

A simple, user-friendly web application for creating professional invoices quickly and easily.

## Features

- **Professional Invoice Creation**: Generate clean, well-formatted invoices in seconds
- **Multiple Currency Support**: Choose between Rupee (₹), Dollar ($), Euro (€), Pound (£), and Yen (¥)
- **Custom GST Calculation** (₹ Only): When Indian Rupee (₹) is selected, users can enter their desired GST percentage, and the tax will be calculated automatically
- **Complete Invoice Details**: Include all essential information from sender and recipient details to itemized billing
- **Banking Information**: Add bank account details and UPI ID for easy payments
- **Number to Words Conversion**: Automatically converts amounts to words in the selected currency
- **Print Functionality**: Print your invoice directly from the browser
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **No Server Required**: Runs entirely in your browser - no data is sent to any server

## How to Use

1. **Download the Files**: Download the HTML, CSS, and JavaScript files to your computer
2. **Open in Browser**: Double-click the HTML file to open it in your default browser
3. **Fill in the Details**: 
   - Select your preferred currency
   - Enter invoice number, dates, and contact information
   - Add items with descriptions, quantities, and prices
   - Include your banking details
   - Add any additional notes or terms
4. **Generate the Invoice**: Click the "Generate Invoice" button to create your invoice
5. **Print**: Use the "Print Invoice" button to print or save as PDF through your browser's print dialog

## Required Fields

The following fields are mandatory for generating an invoice:
- Invoice Number
- Invoice Date
- Due Date
- Sender Name/Company
- Recipient Name/Company
- At least one item with description and price

## Currency Support

The invoice generator supports the following currencies:
- Indian Rupee (₹)
- US Dollar ($)
- Euro (€)
- British Pound (£)
- Japanese Yen (¥)

When you select a currency, the application automatically:
- Updates all currency symbols throughout the invoice
- Changes the currency name in the "amount in words" section
- Uses appropriate number system (Indian or International) for the number-to-words conversion
- Uses correct subunit terminology (cents, pence, paise, etc.)

## Banking Details

For payment purposes, you can include your:
- Bank Name
- Account Holder Name
- Account Number
- IFSC Code
- Branch Details
- UPI ID

## Technical Details

- Built with HTML, CSS, and JavaScript
- No additional libraries or frameworks required
- All calculations and formatting done client-side
- Print functionality uses the browser's native print capabilities

## Customization

You can customize the invoice generator by:

1. **Changing Colors**: Edit the CSS variables at the top of the style section
```css
:root {
    --primary-color: #4361ee;
    --secondary-color: #3f37c9;
    --accent-color: #f72585;
    --light-color: #f8f9fa;
    --dark-color: #212529;
    --border-color: #dee2e6;
}
```
2. **Additional Currencies**: Add more currencies by updating the currency selector and related JavaScript objects
3. **Field Labels**: Adjust field names to match your business terminology

## Privacy & Security

- All data stays on your local computer
- No data is transmitted to any server
- Your financial information remains private

## License

Free for personal and commercial use.

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Built with ❤️ for small businesses and freelancers.

*This project was created with the assistance of AI tools, demonstrating how artificial intelligence can help streamline the development of practical business applications.
