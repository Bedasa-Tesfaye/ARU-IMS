<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body { font-family: DejaVu Sans, Arial, sans-serif; color: #1e293b; margin: 24px; }
        h1 { font-size: 1.4rem; }
        table { border-collapse: collapse; width: 100%; margin-top: 16px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background: #f1f5f9; }
        .muted { color: #64748b; font-size: 0.9rem; }
        .section { margin-top: 28px; }
    </style>
</head>
<body>
    @if(!empty($options['includeCover']))
        <h1>{{ $title }}</h1>
        <p class="muted">Generated {{ $generatedAt }} — Use your browser’s Print dialog to save as PDF if needed.</p>
    @endif

    @if(!empty($options['includeSummary']))
        <div class="section">
            <h2>Summary</h2>
            <p>Companies listed: {{ $rows->count() }} — Total postings (sum): {{ $rows->sum('postings') }}</p>
        </div>
    @endif

    @if(!empty($options['includeTables']))
        <div class="section">
            <h2>Companies by postings</h2>
            <table>
                <thead><tr><th>Company</th><th>Industry</th><th>Postings</th></tr></thead>
                <tbody>
                @foreach($rows as $r)
                    <tr><td>{{ $r->company_name }}</td><td>{{ $r->industry }}</td><td>{{ $r->postings }}</td></tr>
                @endforeach
                </tbody>
            </table>
        </div>
        <div class="section">
            <h2>Postings per month</h2>
            <table>
                <thead><tr><th>Month</th><th>Count</th></tr></thead>
                <tbody>
                @foreach($monthly as $m)
                    <tr><td>{{ $m->month }}</td><td>{{ $m->count }}</td></tr>
                @endforeach
                </tbody>
            </table>
        </div>
    @endif

    @if(!empty($options['includeCharts']))
        <div class="section muted">
            <p>Charts: open the Excel or CSV export for spreadsheet charts, or print this page for visual review.</p>
        </div>
    @endif

    @if(!empty($options['includeAIInsights']))
        <div class="section">
            <h2>AI insights (preview)</h2>
            <p class="muted">Focus follow-up on companies with accelerating month-over-month posting growth.</p>
        </div>
    @endif
</body>
</html>
