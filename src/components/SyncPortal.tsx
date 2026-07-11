/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CloudUpload, CloudDownload, RefreshCw, CheckCircle, Info, Lock } from "lucide-react";

interface SyncPortalProps {
  syncCode: string | undefined;
  onSavePreferences: () => Promise<string>;
  onLoadPreferences: (code: string) => Promise<boolean>;
  announceSpeech: (text: string) => void;
}

export default function SyncPortal({
  syncCode,
  onSavePreferences,
  onLoadPreferences,
  announceSpeech
}: SyncPortalProps) {
  const [inputCode, setInputCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleBackupSubmit = async () => {
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const code = await onSavePreferences();
      setSuccessMsg(`Backup successful! Secure Sync Code: ${code}`);
      announceSpeech(`Cloud synchronization complete. Your device configurations are securely stored under backup code ${code}.`);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to backup settings to server.");
      announceSpeech(`Sync failed: ${err.message || "server error"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleRetrieveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const ok = await onLoadPreferences(cleanCode);
      if (ok) {
        setSuccessMsg(`Successfully restored configurations for sync code ${cleanCode}!`);
        announceSpeech(`Cloud load complete. Favorites, custom layouts, and contrast modes synchronized.`);
        setInputCode("");
      } else {
        setErrorMsg("Backup data not found. Please verify the code and try again.");
        announceSpeech("Load failed: data token not found.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Server error loading synchronized backup.");
      announceSpeech(`Load failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-8 animate-fade-in">
      <div>
        <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <CloudUpload className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Multi-Device Configuration Synchronization
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Synchronize favorite locations, hourly widget parameters, and high contrast settings instantly across mobile, tablet, and desktop viewports.
        </p>
      </div>

      {errorMsg && (
        <div 
          className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 rounded-xl text-xs flex items-start gap-2"
          role="alert"
        >
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div 
          className="p-4 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs flex items-start gap-2"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Card: Create / Update Backup on Server */}
        <section 
          className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex flex-col justify-between"
          aria-labelledby="backup-heading"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CloudUpload className="w-5 h-5 text-sky-500" />
              <h3 id="backup-heading" className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                1. Secure Backup Profile
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Export your weather profile, saved cities list, and custom widgets layout directly to our server database. You will receive a unique 6-character backup token.
            </p>

            {syncCode && (
              <div className="p-4 rounded-xl bg-sky-50 dark:bg-slate-800/40 border border-sky-100 dark:border-slate-800 text-center space-y-1 mb-5">
                <p className="text-[10px] uppercase font-bold text-sky-600 dark:text-sky-400 tracking-widest">Active Device Token</p>
                <p className="text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-widest">{syncCode}</p>
                <p className="text-[10px] text-slate-400">Save this code to import settings on another browser frame.</p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleBackupSubmit}
            disabled={saving}
            className="w-full bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all-short cursor-pointer accessible-focus"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CloudUpload className="w-4 h-4" />
            )}
            {syncCode ? "Update Server Backup" : "Generate Sync Code"}
          </button>
        </section>

        {/* Right Card: Load Backup from Server using Sync Code */}
        <section 
          className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10 flex flex-col justify-between"
          aria-labelledby="restore-heading"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CloudDownload className="w-5 h-5 text-purple-500" />
              <h3 id="restore-heading" className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                2. Import Sync Profile
              </h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-4">
              Enter an active 6-character backup token generated from another browser session to instantly apply saved preferences and override current settings.
            </p>

            <form onSubmit={handleRetrieveSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="sync-code-input" className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  6-Character Sync Token
                </label>
                <input
                  id="sync-code-input"
                  type="text"
                  maxLength={6}
                  required
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  placeholder="e.g., F89B3K"
                  className="w-full text-xs font-mono font-bold tracking-widest text-center p-3 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-2 focus:ring-purple-500 bg-slate-100/50 dark:bg-slate-950 uppercase dark:text-white"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all-short cursor-pointer accessible-focus"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CloudDownload className="w-4 h-4" />
                )}
                Retrieve Saved Settings
              </button>
            </form>
          </div>
        </section>

      </div>

      <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 flex items-start gap-3">
        <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div className="text-[11px] text-slate-500 leading-relaxed">
          <p className="font-bold text-slate-700 dark:text-slate-200 mb-0.5">Secure Protocol Statement</p>
          No personal identifiers or sensitive coordinates are persisted. Synchronization processes exclusively parse non-identifiable parameters (such as metric flags, favorite city names, and layout states) to secure absolute privacy and digital protection.
        </div>
      </div>
    </div>
  );
}
