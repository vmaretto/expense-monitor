# Quick Start Guide - Expense Monitor

## Installation & Setup

### 1. Start Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser

### 2. First Run
The app initializes automatically with:
- Empty database ready for imports
- Default alert thresholds
- Sidebar navigation with 9 main sections

## Main Workflows

### Importing Transactions

**Step 1**: Navigate to **Upload** (upload icon in sidebar)

**Step 2**: Drag & drop or select your Excel/CSV file
- Supported formats: `.xlsx` or `.csv`
- File should have columns: `data`, `descrizione`, `dettaglio`, `importo`, `macroCategoria`, `persona`, `note`, `fonte`

**Step 3**: Select the bank source
- Intesa San Paolo
- BNL
- PayPal
- Carta Gigi / Hello Bank

**Step 4**: Review the preview (first 10 rows shown)

**Step 5**: Click **"Importa Transazioni"** to save to database

### Viewing & Analyzing Data

**Dashboard**: Overview of spending with interactive charts
- Summary cards (totals, balance)
- Alert banners for exceeded limits
- Monthly trends
- Spending by person pie chart
- Top 15 categories

**Transazioni**: Full editable transaction table
- Search transactions
- Sort by any column
- Click category/person/note to edit
- Changes auto-save
- 50 per page with pagination

**Upload**: Import history and file management
- See past imports
- Drag & drop new files

**Moglie e Da Dividere**: Shared expense analysis
- Track wife's personal expenses
- Track split household costs
- Calculate who owes what

**Spese Gigi**: Child expense tracking
- Total child spending
- Gaming/app subscriptions breakdown
- Targeted allowance management

**Casa Santa Severa**: Vacation property expenses
- Separate tracking for property costs

**Per Persona**: Cross-tabulation view
- Categories × Persons matrix
- See spending breakdown

**Per Categoria**: Time-based analysis
- Categories × Months
- Track spending trends

**Impostazioni**: Settings & configuration
- Add alert thresholds (e.g., alert when restaurant spending > €200/month)
- Toggle alerts on/off
- Export all data as JSON backup

## Smart Features

### Auto-Classification
Transactions are automatically classified based on notes:
- "da dividere" → Da Dividere person
- "luisa" or "moglie" → Moglie person
- "santa severa" → Casa Santa Severa category
- "compleanno gigi" + "dividere" → Viaggio Compleanno Gigi
- Bank source "Carta Gigi" → Figlio person

You can override these by editing directly.

### Inline Editing
In the Transactions table, click any field to edit:
- **Categoria (Category)**: Dropdown of 50+ options
- **Persona**: Dropdown of 6 personas
- **Note**: Text field for custom notes

Changes save immediately!

### Color Coding
- **Red text**: Expenses (negative amounts)
- **Green text**: Income (positive amounts)
- **Pink rows**: Moglie expenses
- **Purple rows**: Da Dividere expenses
- **Green rows**: Figlio (Spese Gigi)
- **Orange rows**: Casa Santa Severa

### Alert Thresholds
In **Settings**, add spending limits:
- Example: "Gaming/App Online" max €50/month
- If exceeded, red alert banner appears on Dashboard
- Shows exactly how much over the limit

## Tips & Tricks

### Filtering
- Use date range on Dashboard to filter by period
- Search bar in Transactions filters by description/notes
- Each view shows only relevant transactions (Moglie + Da Dividere, etc.)

### Data Export
In Settings, click "Esporta Dati (JSON)" to download all transactions as backup. Can re-import later.

### Bulk Operations
- Import multiple files in sequence
- Each import adds to database
- Can import same transactions multiple times (no auto-dedup) - just edit/delete duplicates

### Understanding the Matrix Views

**Per Persona**: Shows spending amount in each category by person
```
Category          | Virgilio | Moglie | Figlio | Famiglia | Da Dividere | Entrata
Spesa Alimentare  | €500     | €200   | €50    | -        | €100        | -
Bar e Caffè       | €80      | €20    | -      | -        | -           | -
...
TOTALE            | €1250    | €450   | €75    | €0       | €200        | €0
```

**Per Categoria**: Shows spending in each category by month
```
Category           | Nov 25 | Dic 25 | Gen 26 | Feb 26 | TOTALE | Media  | N. Op
Spesa Alimentare   | €450   | €480   | €420   | €490   | €1840  | €460   | 48
Bar e Caffè        | €80    | €95    | €75    | €85    | €335   | €83.75 | 32
...
TOTALE             | €5200  | €5800  | €5400  | €5900  | €22300 | €5575  | 890
```

## Keyboard Shortcuts

- **Enter**: Confirm edits in table
- **Escape**: Cancel edits
- **Tab**: Move to next cell (in edit mode)

## Common Tasks

### Check Monthly Spending
1. Go to Dashboard
2. Look at "Entrate vs Uscite per Mese" chart
3. See which months had highest spending

### Find a Specific Transaction
1. Go to Transactions
2. Use search box for description/notes
3. Click on Importo to sort by amount

### See What Wife Spent
1. Go to "Moglie e Da Dividere"
2. Look at "Moglie (Luisa)" card
3. Sort table by category to see breakdown

### Track Child's Gaming Spending
1. Go to "Spese Gigi"
2. Look at "Gaming/App Online" card
3. Click on transactions to review details

### Find Spending by Category
1. Go to "Per Categoria"
2. Scroll to find category
3. See spending per month with trends

### Check Which Bank Had Most Transactions
1. Go to Transactions
2. Add a filter for Fonte (not currently in UI, but can be added)
3. Or use Search for bank name

## Data Storage

- All data stored locally in browser (IndexedDB)
- No cloud sync
- No login required
- Private on this device
- Export to backup in Settings

## Browser DevTools

To inspect data in browser console:
```javascript
// View all transactions
const db = window.db; // If exported from module
db.transactions.toArray().then(console.log);

// Count transactions
db.transactions.count().then(console.log);

// Clear all data (use carefully!)
db.transactions.clear();
```

## Troubleshooting

**Q: Imported transactions aren't showing**
A: Refresh page. Check Settings to verify import was recorded.

**Q: Changes aren't saving**
A: Click outside the cell to trigger save. Check browser console for errors.

**Q: Chart isn't displaying**
A: Ensure you have transactions in the date range. Try changing filters.

**Q: File import fails**
A: Check file has required columns. Try CSV format instead of Excel. Check amount format (use commas for decimals in CSV).

**Q: Want to start fresh**
A: Export current data first (Settings), then open DevTools console and run:
```javascript
indexedDB.deleteDatabase('ExpenseMonitor');
// Reload page
```

## Support

See README.md for full documentation.
