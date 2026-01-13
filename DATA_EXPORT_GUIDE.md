# Firebase Data Export & Excel Guide

## Quick Start - Exporting Your Data

### Location: Analytics Tab → Export Data Section

In your Smart Campus Access Map:
1. Click **Analytics** tab (right sidebar)
2. Scroll down to **Export Data** section
3. Choose your format

---

## Export Formats

### 🟩 Export to Excel
**What it does:** Downloads all issues as a CSV file that opens in Microsoft Excel

**Contains:**
- Issue ID
- Type (blocked-ramp, broken-elevator, etc.)
- Location
- Description
- Severity (low, medium, high, critical)
- Status (pending, in-progress, resolved)
- Reporter Name
- Created Date & Time
- Updated Date & Time
- Building, Floor, Department (if entered)
- Contact Info (Phone, Email)
- Number of Attachments
- Status Notes
- Tags

**File Format:** `.csv` (Comma-Separated Values)

**Best For:**
- ✅ Managers analyzing data
- ✅ Creating reports
- ✅ Sharing with stakeholders
- ✅ Data analysis in Excel
- ✅ Monthly reports

**Example Filename:** `campus_issues_2024-01-15.csv`

---

### 📄 Export to JSON
**What it does:** Downloads all issues as a JSON backup file

**Contains:**
- Complete issue data with all fields
- Nested arrays (attachments, tags, audit trail)
- Firebase metadata

**File Format:** `.json` (JavaScript Object Notation)

**Best For:**
- ✅ System backups
- ✅ Archiving data
- ✅ Technical integration
- ✅ Migration to another system
- ✅ Long-term storage

**Example Filename:** `campus_issues_backup_2024-01-15.json`

---

### 📋 Generate Report
**What it does:** Creates an HTML report with summary statistics and issue details

**Contains:**
- Report generation timestamp
- Summary statistics (total issues, by status)
- Full issue table with all details
- Professional formatting

**File Format:** `.html` (Web Page)

**Best For:**
- ✅ Presenting to leadership
- ✅ Sharing in email
- ✅ Web viewing
- ✅ Print-friendly format
- ✅ Quick overview

**Example Filename:** `campus_report_2024-01-15.html`

---

### 📊 Export Analytics
**What it does:** Downloads statistical summary of your issues

**Contains:**
```json
{
  "Report Generated": "2024-01-15T10:30:00Z",
  "Total Issues": 45,
  "Total by Status": {
    "resolved": 28,
    "in-progress": 12,
    "pending": 5
  },
  "Total by Type": {
    "blocked-ramp": 15,
    "broken-elevator": 8,
    ...
  },
  "Total by Severity": {
    "critical": 2,
    "high": 8,
    ...
  },
  "Hot Spots": {
    "Main Building": 12,
    "Science Block": 8,
    ...
  },
  "Average Resolution Time": "4.2 hours"
}
```

**File Format:** `.json`

**Best For:**
- ✅ Analytics and metrics
- ✅ Performance monitoring
- ✅ Identifying problem areas
- ✅ Decision making
- ✅ Historical trending

**Example Filename:** `campus_analytics_2024-01-15.json`

---

## How to Use Exported Data

### In Microsoft Excel

#### Opening CSV File

1. **Download the CSV file** from your browser
2. **Open Microsoft Excel**
3. **File** → **Open** → Select your CSV file
4. **Excel** will automatically format the data

#### Working with the Data

**Sort by Severity:**
- Click **Data** menu
- Click **Sort**
- Choose "Severity" column
- Sort: Highest to Lowest

**Filter by Status:**
- Select any cell in the table
- **Data** → **AutoFilter**
- Click dropdown arrows to filter

**Create a Pivot Table:**
- **Insert** → **Pivot Table**
- Choose fields to analyze
- Generate summary statistics

**Calculate Statistics:**
```excel
=COUNTIF(Status:Status, "resolved")  → Count resolved issues
=COUNTIF(Severity:Severity, "high")   → Count high severity
=AVERAGE(Resolution_Time:Resolution_Time) → Average resolution time
```

---

## Opening JSON Files

### Option 1: Text Editor
- Open with Notepad, VS Code, or any text editor
- View raw data
- Best for archival purposes

### Option 2: Online JSON Viewer
- Go to https://jsoncrack.com/
- Upload your JSON file
- View as interactive diagram

### Option 3: Python Analysis
```python
import json

# Load the JSON file
with open('campus_issues_backup_2024-01-15.json', 'r') as f:
    issues = json.load(f)

# Count issues by status
status_counts = {}
for issue in issues:
    status = issue.get('status', 'unknown')
    status_counts[status] = status_counts.get(status, 0) + 1

print("Issues by Status:", status_counts)
```

---

## Opening HTML Reports

1. **Download the HTML file** from your browser
2. **Double-click** to open in your default browser
3. **View** the formatted report
4. **Print** using Ctrl+P if needed

---

## Firebase Data Structure

### Issues Collection in Firestore

```
issues/
├── issue_001/
│   ├── type: "blocked-ramp"
│   ├── location: "Main Building - Entrance"
│   ├── description: "Ramp has debris blocking wheelchair access"
│   ├── severity: "high"
│   ├── status: "pending"
│   ├── latitude: -0.353833
│   ├── longitude: 34.431822
│   ├── createdAt: 2024-01-15T09:00:00Z
│   ├── updatedAt: 2024-01-15T10:30:00Z
│   ├── reporter: "John Doe"
│   ├── userId: "user_123..."
│   ├── auditTrail: [
│   │   {
│   │     "action": "created",
│   │     "by": "user_123",
│   │     "timestamp": "2024-01-15T09:00:00Z"
│   │   },
│   │   {
│   │     "action": "status_changed",
│   │     "from": "pending",
│   │     "to": "in-progress",
│   │     "timestamp": "2024-01-15T09:30:00Z"
│   │   }
│   └── ]
│
├── issue_002/
└── ... more issues
```

---

## Common Excel Queries

### How many issues are still pending?

**Formula:**
```excel
=COUNTIF(Status:Status, "pending")
```

### What's the most reported issue type?

**Steps:**
1. Copy "Type" column
2. **Data** → **Subtotals**
3. Choose "Count"

### Which building has the most issues?

**Steps:**
1. Create Pivot Table
2. Drag "Building" to Row Labels
3. Drag "Issue ID" to Values
4. Sort by count (descending)

### Average time to resolve issues?

**Formula:**
```excel
=AVERAGE(IF(Status="resolved", ResolutionTime))
```

### Issues reported this week?

**Formula:**
```excel
=COUNTIFS(CreatedDate:CreatedDate, ">="&TODAY()-7, CreatedDate:CreatedDate, "<"&TODAY())
```

---

## Scheduling Automatic Exports

### Using Windows Task Scheduler

1. Create a script to download data
2. Schedule it to run daily/weekly
3. Archive exports for historical analysis

### Using Google Sheets Integration

1. Create a Google Sheet
2. Import CSV data
3. Set up daily automatic import
4. Create charts and dashboards

---

## Data Privacy & Security

### Before Sharing Exported Files:

- ✅ Remove personally identifiable information (PII)
- ✅ Aggregate data at location level (not individual)
- ✅ Redact contact information if sharing externally
- ✅ Use encryption if emailing sensitive data
- ✅ Limit distribution to authorized personnel only

### Example: Safe Export for Public Sharing

Remove these columns before sharing:
- Reporter Name
- Phone Number
- Email Address
- User ID
- Specific timestamps (use date ranges instead)

---

## Troubleshooting Export Issues

### ❌ "No issues to export" message

**Solution:**
- Report at least one issue first
- Click **Report Issue** tab
- Fill out and submit a form

### ❌ Downloaded file won't open

**Solution:**
- CSV files: Right-click → "Open With" → Excel
- JSON files: Use VS Code or Notepad
- HTML files: Double-click (opens in browser)

### ❌ Excel shows weird characters

**Solution:**
- This is an encoding issue
- In Excel: **File** → **Open**
- Choose **"Text Import Wizard"**
- Set encoding to **UTF-8**

### ❌ Can't find download location

**Solution:**
- Check your browser's Downloads folder
- Default location: `C:\Users\YourName\Downloads`
- Or check your browser's download history

---

## Advanced: Firebase Console View

You can also view data directly in Firebase:

1. Go to https://console.firebase.google.com
2. Select your project
3. Click **Firestore Database**
4. Expand **issues** collection
5. Click any issue to see full details

This is useful for:
- ✅ Real-time data verification
- ✅ Manual data edits (if admin)
- ✅ Checking timestamp details
- ✅ Viewing audit trails

---

## Best Practices

### Daily Management:
- ✅ Check Analytics tab daily
- ✅ Review pending issues
- ✅ Assign staff to high-severity items
- ✅ Update statuses as work completes

### Weekly Reporting:
- ✅ Export analytics summary
- ✅ Generate HTML report
- ✅ Share with stakeholders
- ✅ Identify trends

### Monthly Analysis:
- ✅ Export full data to Excel
- ✅ Create pivot tables
- ✅ Identify problem areas
- ✅ Update safety procedures

### Quarterly Archive:
- ✅ Export to JSON backup
- ✅ Store securely
- ✅ Keep for compliance/audit
- ✅ Historical comparison

---

## Sample Use Cases

### Use Case 1: Maintenance Request Tracking

**Export as:** Excel CSV

**Analysis:**
- Filter by "pending" status
- Sort by severity
- Assign to staff
- Update completion status

### Use Case 2: Monthly Report for Campus Management

**Export as:** HTML Report

**Distribution:**
- Email to campus leaders
- Print for meetings
- Archive for records

### Use Case 3: Data Backup for Compliance

**Export as:** JSON

**Storage:**
- Save to secure server
- Encrypt the file
- Keep for 7 years (typical requirement)

### Use Case 4: Analytics Dashboard

**Export as:** Analytics Summary JSON

**Use:**
- Import into BI tool (Power BI, Tableau)
- Create executive dashboard
- Monitor KPIs

---

## Getting Help

### Data Export Issues:
- Check console: `F12` → **Console** tab
- Look for error messages
- Email screenshot of errors

### Firebase Issues:
- See [FIREBASE_BACKEND_SETUP.md](FIREBASE_BACKEND_SETUP.md)
- Check [FIRESTORE_RULES.md](FIRESTORE_RULES.md)
- Review Firebase documentation

### Excel/CSV Questions:
- Microsoft Excel Help: https://support.microsoft.com/en-us/excel
- CSV Format Guide: https://tools.ietf.org/html/rfc4180

---

**Last Updated:** January 2024  
**For More Help:** See FIREBASE_BACKEND_SETUP.md and ARCHITECTURE.md
