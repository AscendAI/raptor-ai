/**
 * React hook for managing print-specific behaviors
 */

import { useEffect } from 'react';

/**
 * Hook to prepare a component for printing
 * Automatically hides interactive elements and expands collapsibles
 */
export function usePrintPreparation() {
  useEffect(() => {
    const handleBeforePrint = () => {
      // Mark interactive elements to hide
      const interactiveElements = document.querySelectorAll(
        'button:not([data-print-keep]), input:not([data-print-keep]), select:not([data-print-keep])'
      );
      interactiveElements.forEach((el) => {
        el.setAttribute(
          'data-original-display',
          window.getComputedStyle(el).display
        );
        (el as HTMLElement).style.display = 'none';
      });

      // Expand all accordions
      const closedAccordions = document.querySelectorAll(
        '[data-state="closed"][data-slot="accordion-trigger"]'
      );
      closedAccordions.forEach((el) => {
        (el as HTMLElement).click();
        el.setAttribute('data-was-closed', 'true');
      });
    };

    const handleAfterPrint = () => {
      // Restore interactive elements
      const hiddenElements = document.querySelectorAll(
        '[data-original-display]'
      );
      hiddenElements.forEach((el) => {
        const originalDisplay = el.getAttribute('data-original-display');
        if (originalDisplay) {
          (el as HTMLElement).style.display = originalDisplay;
          el.removeAttribute('data-original-display');
        }
      });

      // Restore accordion states
      const expandedAccordions = document.querySelectorAll(
        '[data-was-closed="true"]'
      );
      expandedAccordions.forEach((el) => {
        (el as HTMLElement).click();
        el.removeAttribute('data-was-closed');
      });
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);
}

/**
 * Hook to add a keyboard shortcut for printing
 * Default: Ctrl/Cmd + P
 */
export function usePrintShortcut(onPrint: () => void, enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Ctrl+P (Windows/Linux) or Cmd+P (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        onPrint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onPrint, enabled]);
}
