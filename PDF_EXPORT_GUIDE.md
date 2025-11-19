# PDF Export - Quick Start Guide

## 🎯 What's New

The PDF export now uses your browser's native print functionality for **reliable, high-quality** PDF generation.

## 🚀 Quick Usage

### For End Users

1. **Open Report** - Navigate to your analysis results page
2. **Click "Download Report"** - Opens a preview dialog
3. **Review PDF** - Check that everything looks correct
4. **Print/Save** - Click "Print / Save as PDF" button
5. **Choose Destination** - In browser dialog, select "Save as PDF"
6. **Save File** - Choose location and save

### Browser Print Dialog Steps

**Chrome/Edge:**

- Destination: Select "Save as PDF"
- Layout: Portrait
- Color: Color ✓
- Background graphics: ✓ (Important!)

**Firefox:**

- Destination: "Save to PDF"
- Options: Check "Print backgrounds"

**Safari:**

- PDF: Select "Save as PDF"
- Check "Print backgrounds"

## 💡 Key Benefits

### ✨ Reliability

No more failed exports or corrupted PDFs!

### 🎨 Quality

Perfect fonts, colors, and layouts every time.

### ⚡ Speed

Instant preview, no waiting for processing.

### 📄 File Size

Smaller, cleaner PDF files.

## 🛠️ For Developers

### Basic Implementation

```typescript
import { PDFPreviewDialog } from '@/components/results/pdf-preview-dialog';

function MyComponent() {
  const [showPdf, setShowPdf] = useState(false);

  return (
    <>
      <button onClick={() => setShowPdf(true)}>
        Download PDF
      </button>

      <PDFPreviewDialog
        open={showPdf}
        onOpenChange={setShowPdf}
        comparison={comparisonData}
        insuranceData={insuranceData}
        taskId={taskId}
      />
    </>
  );
}
```

### Hiding Elements in Print

```tsx
{
  /* Won't appear in PDF */
}
<button className="no-print">Edit</button>;

{
  /* Alternative using data attribute */
}
<div data-no-print="true">Hidden from PDF</div>;
```

### Controlling Page Breaks

```tsx
{
  /* Forces new page */
}
<section className="page-break">New Page Content</section>;

{
  /* Prevents breaking inside */
}
<table className="avoid-break">{/* Table stays together */}</table>;
```

### Using Print Hooks

```typescript
import { usePrintPreparation, usePrintShortcut } from '@/hooks/use-print';

function MyComponent() {
  // Auto-prepare for printing
  usePrintPreparation();

  // Add Ctrl+P shortcut
  usePrintShortcut(() => setShowPdf(true));

  return <div>Content</div>;
}
```

## 📋 Print Styles

### Custom Print CSS

```css
/* Hide in print */
.no-print {
  @media print {
    display: none !important;
  }
}

/* Page breaks */
.page-break {
  @media print {
    page-break-before: always;
  }
}

/* Keep together */
.avoid-break {
  @media print {
    page-break-inside: avoid;
  }
}

/* Print-only content */
.print-only {
  display: none;

  @media print {
    display: block !important;
  }
}
```

## 🔧 Customization

### Custom PDF Template

Create your own template by extending `PDFReportTemplate`:

```typescript
import { PDFReportTemplate } from '@/components/results/pdf-report-template';

export function CustomPDFTemplate(props) {
  return (
    <div className="pdf-report-template">
      {/* Your custom layout */}
      <header>Custom Header</header>

      {/* Reuse base template */}
      <PDFReportTemplate {...props} />

      <footer>Custom Footer</footer>
    </div>
  );
}
```

### Custom Styles

Override template styles:

```css
.pdf-report-template {
  /* Custom colors */
  --primary-color: #059669;
  --secondary-color: #047857;

  /* Custom fonts */
  font-family: 'Your Custom Font', sans-serif;
}
```

## ❓ Troubleshooting

### "PDF is blank"

- **Cause**: Content hasn't loaded yet
- **Fix**: Wait for preview to fully load before printing

### "Colors missing in PDF"

- **Cause**: Browser setting disabled
- **Fix**: Enable "Background graphics" in print dialog

### "Content cut off"

- **Cause**: Fixed heights or overflow issues
- **Fix**: Use `@media print` to adjust layouts

### "Keyboard shortcut not working"

- **Cause**: Hook not added or disabled
- **Fix**: Use `usePrintShortcut()` hook

## 📚 Learn More

- **Full Documentation**: See `PDF_EXPORT_IMPLEMENTATION.md`
- **API Reference**: See component prop types
- **Examples**: Check `results-client-wrapper.tsx`

## 🎓 Best Practices

1. **Always preview** before saving
2. **Check all pages** in preview
3. **Enable background graphics** in print settings
4. **Use semantic HTML** for better rendering
5. **Test in multiple browsers**

## 🚀 Performance Tips

- Keep templates simple
- Minimize large images
- Use CSS for styling over inline styles (except where needed for print)
- Avoid heavy JavaScript in print templates

## 🤝 Contributing

Found an issue or want to improve the PDF export?

1. Check existing issues
2. Create a detailed bug report or feature request
3. Submit a PR with improvements

## 📞 Support

Need help?

- Check the troubleshooting section above
- Review the full documentation
- Check browser console for errors
- Test in different browsers

---

**Version**: 2.0.0  
**Last Updated**: November 2024  
**Status**: ✅ Production Ready
