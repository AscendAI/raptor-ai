'use client';

import React from 'react';
import { type ComparisonResult } from '@/lib/types/comparison';
import { type InsuranceReportData } from '@/lib/types/extraction';
import { cn } from '@/lib/utils';

interface PDFReportTemplateProps {
  comparison: ComparisonResult;
  insuranceData?: InsuranceReportData;
  taskId: string;
  priceListStatus?: {
    status: 'pass' | 'failed' | 'warning';
    message: string;
  } | null;
}

export const PDFReportTemplate = React.forwardRef<
  HTMLDivElement,
  PDFReportTemplateProps
>(({ comparison, insuranceData, taskId, priceListStatus }, ref) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div ref={ref} className="pdf-report-template bg-white">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 20mm;
          }

          .pdf-report-template {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .page-break {
            page-break-before: always;
          }

          .avoid-break {
            page-break-inside: avoid;
          }

          .no-print {
            display: none !important;
          }
        }

        .pdf-report-template {
          font-family:
            -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          line-height: 1.7;
          color: #1f2937;
          padding: 32px;
          max-width: 100%;
        }

        .pdf-report-template h1 {
          font-size: 32px;
          font-weight: 700;
          color: #059669;
          margin-bottom: 12px;
          line-height: 1.3;
        }

        .pdf-report-template h2 {
          font-size: 22px;
          font-weight: 600;
          color: #047857;
          margin-top: 32px;
          margin-bottom: 16px;
          padding-bottom: 10px;
          border-bottom: 2px solid #d1fae5;
          line-height: 1.4;
        }

        .pdf-report-template h3 {
          font-size: 17px;
          font-weight: 600;
          color: #374151;
          margin-top: 20px;
          margin-bottom: 12px;
          line-height: 1.4;
        }

        .pdf-report-template table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }

        .pdf-report-template th {
          background-color: #f3f4f6;
          padding: 14px 16px;
          text-align: left;
          font-weight: 600;
          font-size: 14px;
          color: #374151;
          border: 1px solid #e5e7eb;
          line-height: 1.5;
        }

        .pdf-report-template td {
          padding: 14px 16px;
          border: 1px solid #e5e7eb;
          font-size: 14px;
          line-height: 1.6;
          vertical-align: top;
        }

        .pdf-report-template .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin: 20px 0;
        }

        .pdf-report-template .info-box {
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
          background-color: #f9fafb;
          min-height: 100px;
          display: flex;
          flex-direction: column;
        }

        .pdf-report-template .info-label {
          font-size: 12px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
          line-height: 1.3;
        }

        .pdf-report-template .info-value {
          font-size: 15px;
          font-weight: 500;
          color: #1f2937;
          line-height: 1.5;
          word-break: break-word;
        }

        .pdf-report-template .summary-card {
          border: 2px solid #d1fae5;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
          background-color: #f0fdf4;
        }

        .pdf-report-template .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 14px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          line-height: 1.2;
        }

        .pdf-report-template .status-pass {
          background-color: #d1fae5;
          color: #047857;
        }

        .pdf-report-template .status-failed {
          background-color: #fee2e2;
          color: #b91c1c;
        }

        .pdf-report-template .status-missing {
          background-color: #fef3c7;
          color: #d97706;
        }

        .pdf-report-template .header {
          border-bottom: 3px solid #059669;
          padding-bottom: 20px;
          margin-bottom: 32px;
        }

        .pdf-report-template .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 12px;
          color: #6b7280;
          text-align: center;
          line-height: 1.6;
        }
      `}</style>

      {/* Header */}
      <div className="header">
        <h1>Roof vs Insurance Analysis Report</h1>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Generated on {currentDate} • Task ID: {taskId.slice(-8)}
        </div>
      </div>

      {/* Insurance Details */}
      {insuranceData && (
        <div className="avoid-break">
          <h2>Insurance Details</h2>
          <div className="info-grid">
            <div className="info-box">
              <div className="info-label">Claim ID</div>
              <div className="info-value">{insuranceData.claim_id || '—'}</div>
            </div>
            <div className="info-box">
              <div className="info-label">Date</div>
              <div className="info-value">{insuranceData.date || '—'}</div>
            </div>
            <div className="info-box">
              <div className="info-label">Price List</div>
              <div className="info-value">
                {insuranceData.price_list || '—'}
              </div>
              {priceListStatus && (
                <div style={{ marginTop: '8px' }}>
                  <span
                    className={cn('status-badge', {
                      'status-pass': priceListStatus.status === 'pass',
                      'status-failed': priceListStatus.status === 'failed',
                      'status-missing': priceListStatus.status === 'warning',
                    })}
                  >
                    {priceListStatus.message}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overall Summary */}
      <div className="avoid-break">
        <h2>Overall Summary</h2>
        <div className="summary-card">
          <div className="info-grid">
            <div>
              <div className="info-label">Total Checkpoints</div>
              <div className="info-value" style={{ fontSize: '24px' }}>
                {comparison.summary.total}
              </div>
            </div>
            <div>
              <div className="info-label">Passed</div>
              <div
                className="info-value"
                style={{ fontSize: '24px', color: '#059669' }}
              >
                {comparison.summary.pass}
              </div>
            </div>
            <div>
              <div className="info-label">Failed</div>
              <div
                className="info-value"
                style={{ fontSize: '24px', color: '#dc2626' }}
              >
                {comparison.summary.failed}
              </div>
            </div>
          </div>
          {comparison.summary.missing > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div className="info-label">Missing</div>
              <div
                className="info-value"
                style={{ fontSize: '24px', color: '#f59e0b' }}
              >
                {comparison.summary.missing}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Single Structure Comparisons */}
      {comparison.comparisons && comparison.comparisons.length > 0 && (
        <div className="page-break">
          <h2>Detailed Comparison Results</h2>
          {comparison.comparisons.map((checkpoint, index) => (
            <div
              key={index}
              className="avoid-break"
              style={{ marginBottom: '16px' }}
            >
              <h3>
                {index + 1}. {checkpoint.checkpoint}
              </h3>
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '30%' }}>Field</th>
                    <th style={{ width: '30%' }}>Roof Report</th>
                    <th style={{ width: '30%' }}>Insurance Report</th>
                    <th style={{ width: '10%' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>{checkpoint.checkpoint}</td>
                    <td>{checkpoint.roof_report_value || '—'}</td>
                    <td>{checkpoint.insurance_report_value || '—'}</td>
                    <td>
                      <span
                        className={cn('status-badge', {
                          'status-pass': checkpoint.status === 'pass',
                          'status-failed': checkpoint.status === 'failed',
                          'status-missing': checkpoint.status === 'missing',
                        })}
                      >
                        {checkpoint.status === 'pass' && '✓ Pass'}
                        {checkpoint.status === 'failed' && '✗ Failed'}
                        {checkpoint.status === 'missing' && '⚠ Missing'}
                      </span>
                    </td>
                  </tr>
                  {checkpoint.notes && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          backgroundColor: '#f9fafb',
                          fontStyle: 'italic',
                        }}
                      >
                        <strong>Notes:</strong> {checkpoint.notes}
                      </td>
                    </tr>
                  )}
                  {checkpoint.warning && (
                    <tr>
                      <td
                        colSpan={4}
                        style={{
                          backgroundColor: '#fef3c7',
                          fontStyle: 'italic',
                        }}
                      >
                        <strong>⚠ Warning:</strong> {checkpoint.warning}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Multi-Structure Comparisons */}
      {comparison.structures &&
        comparison.structures.map((structure) => (
          <div key={structure.structureNumber} className="page-break">
            <h2>Structure {structure.structureNumber}</h2>

            {/* Structure Summary */}
            <div className="summary-card avoid-break">
              <div className="info-grid">
                <div>
                  <div className="info-label">Total Checkpoints</div>
                  <div className="info-value">{structure.summary.total}</div>
                </div>
                <div>
                  <div className="info-label">Passed</div>
                  <div className="info-value" style={{ color: '#059669' }}>
                    {structure.summary.pass}
                  </div>
                </div>
                <div>
                  <div className="info-label">Failed</div>
                  <div className="info-value" style={{ color: '#dc2626' }}>
                    {structure.summary.failed}
                  </div>
                </div>
              </div>
              {structure.summary.missing > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div className="info-label">Missing</div>
                  <div className="info-value" style={{ color: '#f59e0b' }}>
                    {structure.summary.missing}
                  </div>
                </div>
              )}
            </div>

            {/* Structure Comparisons */}
            {structure.comparisons.map((checkpoint, index) => (
              <div
                key={index}
                className="avoid-break"
                style={{ marginBottom: '16px' }}
              >
                <h3>
                  {index + 1}. {checkpoint.checkpoint}
                </h3>
                <table>
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Field</th>
                      <th style={{ width: '30%' }}>Roof Report</th>
                      <th style={{ width: '30%' }}>Insurance Report</th>
                      <th style={{ width: '10%' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ fontWeight: 600 }}>
                        {checkpoint.checkpoint}
                      </td>
                      <td>{checkpoint.roof_report_value || '—'}</td>
                      <td>{checkpoint.insurance_report_value || '—'}</td>
                      <td>
                        <span
                          className={cn('status-badge', {
                            'status-pass': checkpoint.status === 'pass',
                            'status-failed': checkpoint.status === 'failed',
                            'status-missing': checkpoint.status === 'missing',
                          })}
                        >
                          {checkpoint.status === 'pass' && '✓ Pass'}
                          {checkpoint.status === 'failed' && '✗ Failed'}
                          {checkpoint.status === 'missing' && '⚠ Missing'}
                        </span>
                      </td>
                    </tr>
                    {checkpoint.notes && (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            backgroundColor: '#f9fafb',
                            fontStyle: 'italic',
                          }}
                        >
                          <strong>Notes:</strong> {checkpoint.notes}
                        </td>
                      </tr>
                    )}
                    {checkpoint.warning && (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            backgroundColor: '#fef3c7',
                            fontStyle: 'italic',
                          }}
                        >
                          <strong>⚠ Warning:</strong> {checkpoint.warning}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ))}

      {/* Footer */}
      <div className="footer">
        <div>
          This report was automatically generated by Raptor AI Analysis System
        </div>
        <div>© {new Date().getFullYear()} Raptor AI. All rights reserved.</div>
      </div>
    </div>
  );
});

PDFReportTemplate.displayName = 'PDFReportTemplate';
