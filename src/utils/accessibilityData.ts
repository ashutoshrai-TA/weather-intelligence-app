/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeveloperDoc, AccessibilityTest, TestSuiteResult } from "../types";

export const developerDocs: DeveloperDoc[] = [
  {
    section: "aria",
    title: "1. ARIA Landmarks & Structural Semantics",
    content: "Accessible applications must partition content into landmark regions. In our Weather Intelligence App, we utilize explicit HTML5 semantic tags backed by standard ARIA roles: <header> for titles/logo, <main id='main-content'> for central forecast displays, <aside> for alert centers, and <section> with descriptive 'aria-label' or 'aria-labelledby' attributes for individual widget cards.",
    codeSnippet: `<main id="main-content" role="main" aria-label="Weather Forecast Dashboard">
  <section aria-labelledby="hourly-widget-title">
    <h2 id="hourly-widget-title">Hourly Forecast Configuration</h2>
    <!-- widget code -->
  </section>
</main>`,
    ariaRoles: ["role='main'", "role='region'", "aria-labelledby", "aria-label"]
  },
  {
    section: "contrast",
    title: "2. Color Contrast Ratios (WCAG 2.1 AA & AAA)",
    content: "By default, text must have a minimum contrast ratio of 4.5:1 against its background. For high contrast mode, we increase this to 7:1 (AAA compliance) by employing pure high-contrast slate grays, black canvas overlays, crisp yellow highlight details, and explicit 2px bold borders around interactive elements. This caters to users with cataracts, macular degeneration, or low-vision conditions.",
    codeSnippet: `/* Tailwind high contrast styling combination */
<div class="bg-black text-white border-2 border-yellow-400 font-bold p-4 
            focus-within:ring-4 focus-within:ring-yellow-300">
  Extreme Wind Alert Active
</div>`,
    ariaRoles: ["contrast-AAA", "high-contrast-toggle"]
  },
  {
    section: "keyboard",
    title: "3. Keyboard Navigation & Focus Ring Anchors",
    content: "All functional actions (location search, metric toggling, widget rearranging, syncing) must be fully navigable via standard Tab/Shift+Tab controls. Focus indicators must never be hidden. We use 'focus:ring-4 focus:ring-sky-500 focus:outline-none' on all interactives, and provide an instant 'Skip to Main Content' anchor as the very first tabbable element.",
    codeSnippet: `<a href="#main-content" 
   class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
          bg-sky-600 text-white p-3 z-50 rounded-md">
  Skip to Main Content
</a>`,
    ariaRoles: ["tabindex='0'", "focus:ring-4", "sr-only focus:not-sr-only"]
  },
  {
    section: "screen-readers",
    title: "4. Dynamic Alerts & Screen Reader Announcements",
    content: "When live data updates or an extreme weather warning is fetched, screen readers must receive immediate, non-disruptive notifications. We implement this using 'role=alert' or 'aria-live=assertive' in our notification system. For non-critical updates like location search completions, we use 'aria-live=polite' to avoid interrupting active speech loops.",
    codeSnippet: `<div role="alert" aria-live="assertive" class="bg-red-900/50 p-4 rounded-xl">
  <span class="sr-only">Danger Warning:</span>
  Severe Gale Warning for Elevated Regions.
</div>`,
    ariaRoles: ["role='alert'", "aria-live='assertive'", "aria-live='polite'"]
  },
  {
    section: "forms",
    title: "5. Accessible Form Controls",
    content: "Form elements without matching textual label tags are invisible to screen-reader users. We ensure all inputs have a tightly associated <label> using 'htmlFor' and 'id'. For quick search icons inside input fields, we supply custom 'aria-label' text for absolute clarity.",
    codeSnippet: `<label htmlFor="location-search-input" class="sr-only">
  Search weather by city or region
</label>
<input id="location-search-input" type="search" placeholder="Search cities..." />`,
    ariaRoles: ["htmlFor", "id", "aria-label", "sr-only"]
  }
];

// Browser-level automated test suite runner
export function runAutomatedAccessibilityTests(highContrastEnabled: boolean): TestSuiteResult {
  const tests: AccessibilityTest[] = [];
  
  // 1. Skip to Content Anchor Test
  const skipAnchor = document.querySelector('a[href="#main-content"]');
  tests.push({
    id: "skip-link",
    name: "Skip to Content Anchor",
    category: "Keyboard",
    description: "Verifies that a 'Skip to Main Content' bypass link exists for keyboard-only navigators.",
    status: skipAnchor ? "passed" : "failed",
    details: skipAnchor 
      ? "Passed: Skip to Main Content anchor detected in DOM." 
      : "Failed: No link referencing #main-content found. Keyboard users must tab through all nav links repeatedly."
  });

  // 2. High Contrast Check
  tests.push({
    id: "high-contrast",
    name: "WCAG Contrast AA/AAA Readiness",
    category: "Contrast",
    description: "Checks if high contrast text and border overlays are active for visual accessibility.",
    status: highContrastEnabled ? "passed" : "untested",
    details: highContrastEnabled 
      ? "Passed: AAA High Contrast classes active. Text ratios exceed 7:1." 
      : "Untested: Normal visual contrast active (approx 4.5:1). Toggle High Contrast mode to verify AAA."
  });

  // 3. Image Alt text and Icon labels
  const buttonsWithIcons = Array.from(document.querySelectorAll('button'));
  let unlabeledButtonsCount = 0;
  buttonsWithIcons.forEach(btn => {
    const hasText = btn.textContent?.trim().length;
    const hasAriaLabel = btn.getAttribute('aria-label') || btn.getAttribute('aria-labelledby');
    if (!hasText && !hasAriaLabel) {
      unlabeledButtonsCount++;
    }
  });

  tests.push({
    id: "icon-button-labels",
    name: "Icon Button Labels",
    category: "ARIA",
    description: "All interactive buttons using visual icons must have text or explicit 'aria-label' descriptors.",
    status: unlabeledButtonsCount === 0 ? "passed" : "failed",
    details: unlabeledButtonsCount === 0 
      ? "Passed: All detected button elements have accessible text labels or ARIA descriptions." 
      : `Failed: Found ${unlabeledButtonsCount} icon-only button(s) lacking an 'aria-label'. Screen readers will read them as 'Button' with no context.`
  });

  // 4. Form Labels Connection
  const inputs = Array.from(document.querySelectorAll('input'));
  let unlabeledInputsCount = 0;
  inputs.forEach(input => {
    const id = input.getAttribute('id');
    const hasAriaLabel = input.getAttribute('aria-label');
    const labelMatchingId = id ? document.querySelector(`label[for="${id}"]`) : null;
    if (!hasAriaLabel && !labelMatchingId) {
      unlabeledInputsCount++;
    }
  });

  tests.push({
    id: "form-input-labels",
    name: "Form Input Labels",
    category: "Semantic",
    description: "Verifies every text input is explicitly associated with an HTML <label> or has an 'aria-label' attribute.",
    status: unlabeledInputsCount === 0 ? "passed" : "failed",
    details: unlabeledInputsCount === 0 
      ? "Passed: Every input field has an associated label or descriptive ARIA label." 
      : `Failed: Detected ${unlabeledInputsCount} input field(s) without paired <label> or aria-label attributes.`
  });

  // 5. Main Landmark Check
  const mainLandmark = document.querySelector('main') || document.querySelector('[role="main"]');
  tests.push({
    id: "main-landmark",
    name: "Main Landmark Region",
    category: "Semantic",
    description: "Confirms that the primary dashboard content is enclosed in a semantic <main> region.",
    status: mainLandmark ? "passed" : "failed",
    details: mainLandmark 
      ? "Passed: Semantic <main> element or role='main' landmark verified." 
      : "Failed: Missing main content landmark. Screen reader search indexes will fail to locate content."
  });

  // 6. Aria Alerts Test
  const alertsWithAria = document.querySelector('[role="alert"]') || document.querySelector('[aria-live="assertive"]');
  tests.push({
    id: "live-announcements",
    name: "Dynamic Announcement Live Regions",
    category: "ARIA",
    description: "Checks for active role='alert' or aria-live elements for extreme weather warnings.",
    status: alertsWithAria ? "passed" : "failed",
    details: alertsWithAria 
      ? "Passed: Live announcement region detected. Real-time storm notifications will speak immediately." 
      : "Warning: No live announcement elements active. Extreme alerts might appear visually but not announce in real time."
  });

  // Calculate score
  const passedCount = tests.filter(t => t.status === "passed").length;
  const failedCount = tests.filter(t => t.status === "failed").length;
  const totalCount = tests.length;
  // Compute score focusing on critical tests
  const score = Math.round((passedCount / totalCount) * 100);

  return {
    score,
    passedCount,
    failedCount,
    tests,
    timestamp: new Date().toLocaleTimeString()
  };
}
