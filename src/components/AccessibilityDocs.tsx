/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  FileText, 
  Settings, 
  Accessibility, 
  ClipboardCheck, 
  AlertCircle, 
  CheckCircle2, 
  Terminal, 
  ArrowRight,
  Sparkles,
  Info
} from "lucide-react";
import { DeveloperDoc, TestSuiteResult } from "../types";
import { developerDocs, runAutomatedAccessibilityTests } from "../utils/accessibilityData";

interface AccessibilityDocsProps {
  highContrast: boolean;
  announceSpeech: (text: string) => void;
  testResult: TestSuiteResult | null;
  onRunAudit: (result: TestSuiteResult) => void;
}

export default function AccessibilityDocs({
  highContrast,
  announceSpeech,
  testResult,
  onRunAudit
}: AccessibilityDocsProps) {
  const [activeDocSection, setActiveDocSection] = useState<string>("aria");
  const [auditing, setAuditing] = useState(false);

  const handleRunAuditSubmit = () => {
    setAuditing(true);
    announceSpeech("Running automated compliance audit against rendered application landmarks...");
    
    setTimeout(() => {
      const result = runAutomatedAccessibilityTests(highContrast);
      onRunAudit(result);
      setAuditing(false);
      announceSpeech(`Compliance audit complete. Score computed at ${result.score} percent. ${result.passedCount} tests passed, ${result.failedCount} tests require remediation.`);
    }, 1200);
  };

  const currentDoc = developerDocs.find((doc) => doc.section === activeDocSection) || developerDocs[0];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Test Suite & Visual Scorecard */}
      <section 
        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6"
        aria-labelledby="audit-suite-title"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 id="audit-suite-title" className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="w-5.5 h-5.5 text-sky-600 dark:text-sky-400" />
              Automated Compliance Testing Suite
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Execute live browser audits evaluating ARIA roles, input labels, focus accessibility and landmarks compliance.
            </p>
          </div>

          <button
            onClick={handleRunAuditSubmit}
            disabled={auditing}
            className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow hover:shadow-md transition-all-short flex items-center gap-1.5 cursor-pointer self-start sm:self-center accessible-focus"
            aria-label="Execute automated accessibility checks"
          >
            {auditing ? (
              <>
                <RefreshCwSpinner /> Auditing DOM...
              </>
            ) : (
              <>
                <Accessibility className="w-4 h-4" /> Run Compliance Audit
              </>
            )}
          </button>
        </div>

        {/* Live score circle and detailed output if run */}
        {testResult ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Score Circle */}
            <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-900 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <div className="relative flex items-center justify-center">
                {/* Score Circular bar representation */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-slate-200 dark:text-slate-800"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="54"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 54}
                    strokeDashoffset={2 * Math.PI * 54 * (1 - testResult.score / 100)}
                    className={`${testResult.score >= 90 ? "text-emerald-500" : testResult.score >= 70 ? "text-amber-500" : "text-red-500"}`}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-mono font-extrabold text-slate-800 dark:text-white">{testResult.score}%</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">A11y Index</span>
                </div>
              </div>

              <h3 className="font-display font-bold text-sm text-slate-800 dark:text-white mt-4">
                {testResult.score >= 90 ? "Excellent Compliance" : testResult.score >= 70 ? "Satisfactory - Needs Tuning" : "Critical Fixes Required"}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                {testResult.passedCount} tests passed successfully. {testResult.failedCount} failed constraints detected in the active viewport layout.
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-3">Audit timestamp: {testResult.timestamp}</p>
            </div>

            {/* Right: Tests Checklist */}
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Checklist Details</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {testResult.tests.map((test) => (
                  <div 
                    key={test.id} 
                    className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/10 dark:bg-slate-900/10 flex items-start gap-3.5 transition-all-short hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    {test.status === "passed" ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    ) : test.status === "failed" ? (
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    ) : (
                      <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{test.name}</span>
                        <span className="text-[9px] font-mono uppercase bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 dark:text-slate-400">
                          {test.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-normal">{test.description}</p>
                      <p className={`text-[11px] font-mono leading-relaxed mt-1.5 p-2 rounded-lg ${
                        test.status === "passed" 
                          ? "bg-emerald-500/5 text-emerald-800 dark:text-emerald-400/80" 
                          : test.status === "failed" 
                            ? "bg-red-500/5 text-red-800 dark:text-red-400/80 border border-red-500/10"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-500"
                      }`}>
                        {test.details}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/10 text-center text-slate-400">
            <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-pulse" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Accessibility test suite ready</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Click 'Run Compliance Audit' to programmatically examine the rendered dashboard components for landmarks, labels, and focus tags.
            </p>
          </div>
        )}
      </section>

      {/* Developer Documentation Center */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <FileText className="w-5.5 h-5.5 text-sky-600 dark:text-sky-400" aria-hidden="true" />
            Inclusive Design & ARIA Integration Guidelines
          </h2>
          <p className="text-xs text-slate-500 mt-1">Detailed design implementation records ensuring full accessibility and seamless screen reader execution.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Doc Index Sidebar */}
          <nav className="lg:col-span-4 flex flex-col gap-2" aria-label="Documentation Categories">
            {developerDocs.map((doc) => (
              <button
                key={doc.section}
                onClick={() => {
                  setActiveDocSection(doc.section);
                  announceSpeech(`Switched to documentation section: ${doc.title}`);
                }}
                className={`p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all-short cursor-pointer accessible-focus ${
                  activeDocSection === doc.section
                    ? "bg-sky-50 border-sky-400 text-sky-900 dark:bg-sky-950/20 dark:border-sky-800 dark:text-sky-300"
                    : "bg-white border-slate-100 hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-900 dark:text-slate-400"
                }`}
                aria-current={activeDocSection === doc.section ? "page" : undefined}
              >
                <span>{doc.title.split(".")[1] || doc.title}</span>
                <ArrowRight className="w-4 h-4 text-sky-500 shrink-0" />
              </button>
            ))}
          </nav>

          {/* Doc Content panel */}
          <section className="lg:col-span-8 space-y-4" aria-live="polite">
            <h3 className="text-base font-display font-bold text-slate-900 dark:text-white">
              {currentDoc.title}
            </h3>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {currentDoc.content}
            </p>

            {/* Code Snippet block */}
            {currentDoc.codeSnippet && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-sky-500" /> Compliant Code Pattern
                </p>
                <pre className="p-4 bg-slate-950 text-sky-400 text-[11px] font-mono rounded-xl overflow-x-auto leading-relaxed border border-slate-900">
                  <code>{currentDoc.codeSnippet}</code>
                </pre>
              </div>
            )}

            {/* Active ARIA badges */}
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mr-1.5 self-center">Targets:</span>
              {currentDoc.ariaRoles?.map((role, i) => (
                <span 
                  key={i} 
                  className="bg-sky-50 dark:bg-slate-800 text-sky-800 dark:text-sky-300 font-mono text-[10px] px-2 py-0.5 rounded border border-sky-100 dark:border-slate-700"
                >
                  {role}
                </span>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function RefreshCwSpinner() {
  return (
    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
