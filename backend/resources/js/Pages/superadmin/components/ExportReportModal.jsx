import React, { useState } from 'react';

const defaultOptions = () => ({
  format: 'pdf',
  pageSize: 'A4',
  orientation: 'portrait',
  includeCharts: true,
  includeTables: true,
  includeSummary: true,
  includeAIInsights: false,
  includeCover: true,
});

export default function ExportReportModal({ reportType, reportTitle, filters, onClose, onExport, exporting }) {
  const [opts, setOpts] = useState(defaultOptions);

  const toggle = (key) => setOpts((o) => ({ ...o, [key]: !o[key] }));

  return (
    <div className="sa-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="export-report-title">
      <div className="sa-modal sa-export-modal">
        <div className="sa-modal-header">
          <h3 id="export-report-title">Export Report</h3>
          <button type="button" className="sa-modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="sa-export-sub">{reportTitle}</p>

        <div className="sa-export-body">
          <fieldset className="sa-fieldset">
            <legend>Format</legend>
            <label className="sa-radio">
              <input type="radio" name="fmt" checked={opts.format === 'pdf'} onChange={() => setOpts((o) => ({ ...o, format: 'pdf' }))} />
              PDF (printable HTML — open and use Print → Save as PDF)
            </label>
            <label className="sa-radio">
              <input type="radio" name="fmt" checked={opts.format === 'excel'} onChange={() => setOpts((o) => ({ ...o, format: 'excel' }))} />
              Excel
            </label>
            <label className="sa-radio">
              <input type="radio" name="fmt" checked={opts.format === 'csv'} onChange={() => setOpts((o) => ({ ...o, format: 'csv' }))} />
              CSV
            </label>
          </fieldset>

          <fieldset className="sa-fieldset">
            <legend>Page size</legend>
            <div className="sa-radio-row">
              {['A4', 'Letter', 'Legal'].map((s) => (
                <label key={s} className="sa-radio-inline">
                  <input type="radio" name="page" checked={opts.pageSize === s} onChange={() => setOpts((o) => ({ ...o, pageSize: s }))} />
                  {s}
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="sa-fieldset">
            <legend>Orientation</legend>
            <div className="sa-radio-row">
              <label className="sa-radio-inline">
                <input
                  type="radio"
                  name="orient"
                  checked={opts.orientation === 'portrait'}
                  onChange={() => setOpts((o) => ({ ...o, orientation: 'portrait' }))}
                />
                Portrait
              </label>
              <label className="sa-radio-inline">
                <input
                  type="radio"
                  name="orient"
                  checked={opts.orientation === 'landscape'}
                  onChange={() => setOpts((o) => ({ ...o, orientation: 'landscape' }))}
                />
                Landscape
              </label>
            </div>
          </fieldset>

          <fieldset className="sa-fieldset">
            <legend>Include</legend>
            <label className="sa-check">
              <input type="checkbox" checked={opts.includeCharts} onChange={() => toggle('includeCharts')} />
              Charts &amp; graphs (notes / print layout)
            </label>
            <label className="sa-check">
              <input type="checkbox" checked={opts.includeTables} onChange={() => toggle('includeTables')} />
              Data tables
            </label>
            <label className="sa-check">
              <input type="checkbox" checked={opts.includeSummary} onChange={() => toggle('includeSummary')} />
              Summary statistics
            </label>
            <label className="sa-check">
              <input type="checkbox" checked={opts.includeAIInsights} onChange={() => toggle('includeAIInsights')} />
              AI insights
            </label>
            <label className="sa-check">
              <input type="checkbox" checked={opts.includeCover} onChange={() => toggle('includeCover')} />
              Cover page
            </label>
          </fieldset>
        </div>

        <div className="sa-modal-footer">
          <button type="button" className="sa-btn-secondary" onClick={onClose} disabled={exporting}>
            Cancel
          </button>
          <button
            type="button"
            className="sa-btn-primary"
            disabled={exporting}
            onClick={() =>
              onExport({
                type: reportType,
                format: opts.format,
                filters,
                options: {
                  includeCharts: opts.includeCharts,
                  includeTables: opts.includeTables,
                  includeSummary: opts.includeSummary,
                  includeAIInsights: opts.includeAIInsights,
                  includeCover: opts.includeCover,
                  pageSize: opts.pageSize,
                  orientation: opts.orientation,
                },
              })
            }
          >
            {exporting ? 'Exporting…' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
