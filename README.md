# Expense Monitor - Personal Finance Tracker

A modern Next.js web application for tracking personal expenses across multiple Italian bank accounts.

## Overview

**Expense Monitor** is a professional-grade personal finance dashboard built for Virgilio Maretto to track 695+ transactions across 4 Italian bank accounts:
- Intesa San Paolo
- BNL
- PayPal
- Carta Gigi / Hello Bank

The app provides comprehensive expense analysis, categorization, and reporting capabilities with a beautiful, responsive UI.

## Features

### Core Features
- **Transaction Management**: Full CRUD operations with inline editing
- **Multi-Account Support**: Track expenses from 4 different bank sources
- **Smart Categorization**: 50+ predefined expense categories with auto-classification
- **Person Tracking**: Allocate expenses across 6 personas (Virgilio, Moglie, Figlio, Famiglia, Da Dividere, Entrata)
- **Real-time Analytics**: Interactive dashboards with charts and tables
- **Alert Thresholds**: Configurable spending limits per category
- **Data Import**: Support for Excel (.xlsx) and CSV file imports
- **Data Export**: Export all transactions to JSON format

### Views & Reports

1. **Dashboard** - Overview with:
   - Summary cards (Total Income, Total Expenses, Balance, Operation Count)
   - Alert banners for exceeded thresholds
   - Monthly trend analysis (Bar chart)
   - Spending by person (Pie chart)
   - Top 15 spending categories (Horizontal bar chart)

2. **Transazioni (Transactions)** - Full editable table with:
   - Advanced search and filtering
   - Inline editing for categories, persons, and notes
   - Sorting by any column
   - 50 transactions per page pagination
   - Color-coded spending visualization

3. **Upload** - File import with:
   - Drag & drop file upload
   - Excel and CSV support
   - Bank source selection
   - Preview before importing
   - Import history tracking

4. **Moglie e Da Dividere** - Shared expense analysis:
   - Moglie (Wife) spending total
   - Da Dividere (To Split) spending total
   - Half-each calculation for shared expenses
   - Total to charge to Luisa
   - Color-coded rows (pink for Moglie, purple for Da Dividere)

5. **Spese Gigi** - Child expense tracking:
   - Figlio (Child) total spending
   - Gaming/App online breakdown
   - Targeted spending analysis

6. **Casa Santa Severa** - Property expense tracking:
   - All expenses related to the vacation property
   - Dedicated reporting view

7. **Per Persona** - Cross-tabulation analysis:
   - Categories × Persons matrix
   - Spending breakdown by person and category
   - Totals and subtotals

8. **Per Categoria** - Time-based category analysis:
   - Categories × Months matrix
   - Spending trends per month
   - Average spending and operation counts

9. **Impostazioni (Settings)** - Configuration and management:
   - Add/edit/remove alert thresholds
   - Toggle alerts active/inactive
   - Data export functionality
   - Database information

## Architecture

### Tech Stack
- **Framework**: Next.js 16.1.6 with TypeScript
- **Database**: Dexie.js (IndexedDB) for client-side data persistence
- **UI Components**: Recharts for charts, Lucide React for icons
- **Styling**: Tailwind CSS 4.2
- **File Processing**: XLSX and PapaParse for import support
- **Tables**: TanStack React Table (imported but simplified implementation)

### Project Structure

```
/sessions/great-dreamy-planck/expense-monitor/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with sidebar navigation
│   │   ├── page.tsx                # Dashboard page
│   │   ├── globals.css             # Global styles
│   │   ├── transactions/page.tsx   # Full transaction table
│   │   ├── upload/page.tsx         # File import page
│   │   ├── settings/page.tsx       # Configuration page
│   │   └── views/
│   │       ├── moglie-dividere/page.tsx      # Shared expenses
│   │       ├── spese-gigi/page.tsx           # Child expenses
│   │       ├── casa-santa-severa/page.tsx    # Property expenses
│   │       ├── per-persona/page.tsx          # Person analysis
│   │       └── per-categoria/page.tsx        # Category analysis
│   └── lib/
│       ├── db.ts                  # Dexie database schema
│       ├── constants.ts           # Categories, personas, colors
│       ├── classification.ts      # Smart categorization rules
│       ├── hooks.ts               # React hooks for data access
│       └── seed.ts                # Database initialization
├── tsconfig.json                  # TypeScript configuration
├── next.config.ts                 # Next.js configuration
├── postcss.config.mjs             # PostCSS configuration
└── package.json                   # Dependencies
```

## Data Model

### Transaction
```typescript
interface Transaction {
  id?: number;
  data: string;              // ISO date (YYYY-MM-DD)
  dataStr: string;           // Display date (DD/MM/YYYY)
  descrizione: string;       // Transaction description
  dettaglio: string;         // Additional details
  importo: number;           // Amount (negative = expense, positive = income)
  macroCategoria: string;    // Expense category
  persona: string;           // Who the expense belongs to
  note: string;              // User notes
  fonte: string;             // Bank source
  mese: string;              // Month (YYYY-MM)
}
```

### Alert Threshold
```typescript
interface AlertThreshold {
  id?: number;
  categoria: string;         // Expense category
  monthlyLimit: number;      // Monthly spending limit
  isActive: boolean;         // Enable/disable alert
}
```

## Smart Classification Rules

The app automatically classifies transactions with these priority-ordered rules:

1. Note contains "da dividere" → `persona = "Da Dividere"`
2. Note contains "addebitare a luisa" → `persona = "Moglie"`
3. Note contains "- virgilio" → `persona = "Virgilio"`
4. Note contains "luisa" (alone) → `persona = "Moglie"`
5. Note contains "moglie" → `persona = "Moglie"`
6. Note contains "posti" → `categoria = "Spese Lavoro"`, `persona = "Virgilio"`
7. Note contains "santa severa" → `categoria = "Casa Santa Severa"`
8. Note contains "settimana bianca" → `categoria = "Settimana Bianca"`, `persona = "Da Dividere"`
9. Note contains "compleanno gigi" + "dividere" → `categoria = "Viaggio Compleanno Gigi"`, `persona = "Da Dividere"`
10. Description contains "garage" → `categoria = "Box Auto/Parcheggio"`
11. Description contains "commissioni" → `categoria = "Commissioni Bancarie"`, `persona = "Virgilio"`
12. Fonte = "Carta Gigi" → `persona = "Figlio"`

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The app will be available at `http://localhost:3000`

### First Run

The app initializes automatically with:
- Empty transaction database (ready for imports)
- Default alert thresholds for common categories
- Sample seed data (can be customized in `/src/lib/seed.ts`)

### Importing Data

1. Navigate to **Upload** page
2. Drag & drop or select an Excel (.xlsx) or CSV (.csv) file
3. Select the bank source
4. Review the preview
5. Click "Importa Transazioni" to import

Expected file format:
```
data,descrizione,dettaglio,importo,macroCategoria,persona,note,fonte
2025-11-01,Carrefour,Spesa alimentare,-85.50,Spesa Alimentare,Virgilio,Spesa settimanale,Intesa
```

## Key Features in Detail

### Inline Editing
Click on any Categoria, Persona, or Note cell in the Transactions table to edit directly. Changes are auto-saved to the database.

### Color Coding
- **Red text**: Expenses (negative amounts)
- **Green text**: Income (positive amounts)
- **Blue**: Editable fields
- **Pink rows**: Moglie persona
- **Purple rows**: Da Dividere persona
- **Green rows**: Figlio (Spese Gigi)
- **Orange rows**: Casa Santa Severa

### Charts & Visualizations
- **Bar Charts**: Monthly trends and category breakdown
- **Pie Charts**: Distribution by person
- **Horizontal Bar Charts**: Top spending categories
- **Data Tables**: Matrix views with totals and subtotals

### Currency Formatting
All amounts display in Italian locale format:
- Decimal separator: `,` (comma)
- Thousands separator: `.` (period)
- Currency: EUR (€)

## Database

### Local Storage
All data is stored in **IndexedDB** (browser's local database):
- Persistent across browser sessions
- No cloud synchronization
- No server-side storage
- Maximum typical size: hundreds of thousands of transactions

### Backup & Export
- Export all transactions via Settings page
- Downloads as JSON file
- Import by uploading the exported file

## Performance Considerations

- **Pagination**: 50 transactions per page in main table
- **Live Queries**: Real-time updates using `dexie-react-hooks`
- **Memoization**: Optimized with `useMemo` for heavy computations
- **Lazy Rendering**: Charts and complex views render on demand

## Browser Compatibility

Works on all modern browsers with:
- ES2017+ support
- IndexedDB support
- CSS Grid & Flexbox support

Tested on:
- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Categories

The app includes 50+ predefined spending categories:

**Recurring Expenses**: Acqua/Luce, Gas/Energia, Internet/Telefono, Commissioni Bancarie

**Groceries & Food**: Spesa Alimentare, Ristorante, Bar e Caffè, Fast Food, Food Delivery

**Household**: Manutenzione Casa, Spese Casa, Lavanderia

**Transportation**: Carburante, Trasporti, Taxi/Parcheggi, Box Auto/Parcheggio, Pedaggi/Telepass

**Health & Personal**: Farmacia, Ottica/Vista, Cura Personale, Visite Mediche

**Family & Child**: Scuola Figlio, Sport Figlio, Spese Figlio

**Entertainment**: Cinema/Spettacoli, Gaming/App Online, Abbonamenti Streaming, Hobby Nautica

**Vacations & Travel**: Viaggi e Vacanze, Settimana Bianca, Viaggio Compleanno Gigi, Casa Santa Severa

**Work & Business**: Spese Lavoro, Formazione Professionale, Hosting/Domini Web, Software/Abbonamenti

**And more...** (50+ total)

## Troubleshooting

### Import Fails
- Check file format is Excel (.xlsx) or CSV (.csv)
- Ensure columns match expected headers: data, descrizione, dettaglio, importo, etc.
- Verify amounts use commas for decimals in CSVs

### Data Not Appearing
- Refresh the page
- Check browser IndexedDB in DevTools
- Verify transactions were imported to correct month

### Charts Not Showing
- Ensure you have transaction data
- Check date range filters aren't too restrictive
- Clear browser cache and reload

## Future Enhancements

Potential features for future versions:
- Multi-user support with cloud sync
- Recurring transaction templates
- Budget planning tools
- Receipt/document attachments
- Mobile app
- API integration with banks
- Advanced reporting (PDF export, etc.)
- Machine learning for auto-categorization
- Recurring expense forecasting

## License

Personal use only. Built for Virgilio Maretto.

## Support

For issues or feature requests, refer to the project documentation and code comments.

---

**Version**: 1.0.0
**Last Updated**: March 2026
**Author**: Developed with Claude Code
