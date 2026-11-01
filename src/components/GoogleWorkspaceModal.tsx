/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { soundManager } from '../audio/soundManager';
import {
  uploadJsonToDrive,
  listPaulaDriveBackups,
  deleteDriveFile,
  createEsportsMatchSpreadsheet,
  appendMatchToSpreadsheet,
  scheduleTournamentCalendarEvent,
  listUpcomingCalendarEvents,
  type DriveBackupFile,
  type GoogleCalendarItem,
  type SheetCreationResult,
} from '../services/googleWorkspace';
import { generateEsportsCastingCommentary } from '../services/geminiAnnouncer';
import { getCachedAccessToken } from '../services/firebase';

interface GoogleWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onSignInGoogle: () => void;
  gameState: {
    trophies: number;
    gold: number;
    gems: number;
    bling: number;
    selectedBrawler: string;
    brawlerLevels: { [id: string]: number };
  };
}

export const GoogleWorkspaceModal: React.FC<GoogleWorkspaceModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignInGoogle,
  gameState,
}) => {
  const [activeTab, setActiveTab] = useState<'drive' | 'sheets' | 'calendar' | 'gemini'>('drive');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Drive state
  const [driveFiles, setDriveFiles] = useState<DriveBackupFile[]>([]);
  const [deleteConfirmationFile, setDeleteConfirmationFile] = useState<DriveBackupFile | null>(null);

  // Sheets state
  const [activeSheet, setActiveSheet] = useState<SheetCreationResult | null>(() => {
    const saved = localStorage.getItem('paula_active_sheet');
    return saved ? JSON.parse(saved) : null;
  });

  // Calendar state
  const [calendarEvents, setCalendarEvents] = useState<GoogleCalendarItem[]>([]);

  // Gemini state
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [generatingAi, setGeneratingAi] = useState(false);

  const hasAccessToken = !!getCachedAccessToken();

  useEffect(() => {
    if (isOpen && currentUser && hasAccessToken) {
      refreshData();
    }
  }, [isOpen, currentUser, hasAccessToken, activeTab]);

  const refreshData = async () => {
    if (!hasAccessToken) return;
    try {
      if (activeTab === 'drive') {
        const files = await listPaulaDriveBackups();
        setDriveFiles(files);
      } else if (activeTab === 'calendar') {
        const events = await listUpcomingCalendarEvents();
        setCalendarEvents(events);
      }
    } catch (err: any) {
      console.warn('Refresh error:', err);
    }
  };

  const notify = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setStatusMessage({ text, type });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4500);
  };

  // Google Drive: Backup Player Profile
  const handleBackupProfileToDrive = async () => {
    if (!currentUser) return;
    setLoading(true);
    soundManager.playUiClick();
    try {
      const backupPayload = {
        exportedAt: new Date().toISOString(),
        playerUid: currentUser.uid,
        email: currentUser.email,
        displayName: currentUser.displayName,
        trophies: gameState.trophies,
        gold: gameState.gold,
        gems: gameState.gems,
        bling: gameState.bling,
        selectedBrawler: gameState.selectedBrawler,
        brawlerLevels: gameState.brawlerLevels,
        engineVersion: 'Paula Drops 2.0 (Titan Engine 54.200)',
      };

      const fileName = `Paula_Drops_Cloud_Save_${currentUser.displayName || 'Hero'}_${Date.now()}.json`;
      const file = await uploadJsonToDrive(fileName, backupPayload, 'Paula Drops Cloud Save Backup');
      soundManager.playVictory();
      notify(`✅ Backup saved to Google Drive: "${file.name}"`, 'success');
      refreshData();
    } catch (err: any) {
      notify(`❌ Backup failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Google Drive: Delete File (Mandatory Confirmation)
  const confirmDeleteFile = async () => {
    if (!deleteConfirmationFile) return;
    setLoading(true);
    try {
      await deleteDriveFile(deleteConfirmationFile.id);
      soundManager.playUiClick();
      notify(`🗑️ Deleted "${deleteConfirmationFile.name}" from Google Drive.`, 'info');
      setDeleteConfirmationFile(null);
      refreshData();
    } catch (err: any) {
      notify(`❌ Delete failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Google Sheets: Create Spreadsheet
  const handleCreateSheet = async () => {
    setLoading(true);
    soundManager.playUiClick();
    try {
      const result = await createEsportsMatchSpreadsheet();
      setActiveSheet(result);
      localStorage.setItem('paula_active_sheet', JSON.stringify(result));
      soundManager.playVictory();
      notify(`📊 Created Google Sheet: "${result.title}"`, 'success');
    } catch (err: any) {
      notify(`❌ Sheet creation failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Google Sheets: Log Test / Recent Match
  const handleLogMatchToSheet = async () => {
    if (!activeSheet) {
      notify('Please create or link a Google Sheet first!', 'info');
      return;
    }
    setLoading(true);
    soundManager.playUiClick();
    try {
      await appendMatchToSpreadsheet(activeSheet.spreadsheetId, {
        gameMode: 'Gem Grab (3v3)',
        result: 'VICTORY',
        brawler: gameState.selectedBrawler.toUpperCase(),
        kills: Math.floor(Math.random() * 8) + 4,
        deaths: Math.floor(Math.random() * 3),
        damage: Math.floor(Math.random() * 35000) + 15000,
        starrDrops: 2,
        trophyDelta: 8,
        mvp: currentUser?.displayName || 'Paula Player',
      });
      soundManager.playVictory();
      notify('✅ Battle logged into Google Sheet!', 'success');
    } catch (err: any) {
      notify(`❌ Failed to log match: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Google Calendar: Schedule Tournament
  const handleScheduleEvent = async (eventDef: { summary: string; description: string; startHours: number; duration: number }) => {
    setLoading(true);
    soundManager.playUiClick();
    try {
      const res = await scheduleTournamentCalendarEvent({
        summary: eventDef.summary,
        description: eventDef.description,
        startHoursFromNow: eventDef.startHours,
        durationHours: eventDef.duration,
      });
      soundManager.playVictory();
      notify(`📅 Added "${res.summary}" to Google Calendar!`, 'success');
      refreshData();
    } catch (err: any) {
      notify(`❌ Calendar schedule failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Gemini AI: Generate Match & Tactics Analysis
  const handleRunAiAnalysis = async () => {
    setGeneratingAi(true);
    soundManager.playUiClick();
    try {
      const commentary = await generateEsportsCastingCommentary({
        brawlerName: gameState.selectedBrawler.toUpperCase(),
        gameMode: 'Gem Grab 3v3',
        result: 'VICTORY',
        kills: 7,
        deaths: 1,
        damage: 48900,
        dropsFound: 2,
        trophies: gameState.trophies,
      });
      setAiAnalysis(commentary);
      soundManager.playVictory();
    } catch (err: any) {
      notify(`AI analysis error: ${err.message}`, 'error');
    } finally {
      setGeneratingAi(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md font-body">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-4 border-sky-400 rounded-3xl shadow-[0_0_50px_rgba(56,189,248,0.4)] overflow-hidden text-white animate-in zoom-in-95 duration-150">
        
        {/* HEADER BAR */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-b-2 border-sky-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg p-1.5">
              <svg className="w-full h-full" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </div>
            <div>
              <h2 className="font-brawl text-2xl text-white tracking-wide flex items-center gap-2">
                GOOGLE WORKSPACE & AI HUB
                <span className="text-xs bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-400">
                  APIs ACTIVE
                </span>
              </h2>
              <p className="text-xs text-sky-200">
                Connected with Google Drive, Sheets, Calendar & Gemini SDK
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-rose-600 text-white font-brawl text-lg flex items-center justify-center border-2 border-slate-600 hover:border-rose-400 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* NOTIFICATION BANNER */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-brawl flex items-center justify-between border-b ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500'
                : statusMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500'
                : 'bg-sky-950/90 text-sky-300 border-sky-500'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button onClick={() => setStatusMessage(null)} className="text-white hover:text-slate-300 font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {/* ACCOUNT STATUS BAR */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-sky-400" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center font-brawl text-xs">
                    {currentUser.displayName?.[0] || 'U'}
                  </div>
                )}
                <div>
                  <div className="font-brawl text-xs text-white leading-tight">
                    {currentUser.displayName || 'Google Brawler'}
                  </div>
                  <div className="text-[10px] text-sky-400">{currentUser.email}</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-amber-300 font-brawl">
                <span>⚠️ Google Account Not Linked</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!currentUser || !hasAccessToken ? (
              <button
                onClick={() => {
                  soundManager.playUiClick();
                  onSignInGoogle();
                }}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 font-brawl text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer border border-slate-300"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Authorize Google Workspace APIs
              </button>
            ) : (
              <span className="text-[11px] font-brawl bg-emerald-950/80 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/50 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected to Workspace
              </span>
            )}
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 gap-2">
          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('drive');
            }}
            className={`px-4 py-2.5 font-brawl text-xs rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'drive'
                ? 'bg-slate-900 text-sky-300 border-t-2 border-x-2 border-sky-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📁</span> Google Drive Backup
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('sheets');
            }}
            className={`px-4 py-2.5 font-brawl text-xs rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sheets'
                ? 'bg-slate-900 text-emerald-300 border-t-2 border-x-2 border-emerald-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📊</span> Google Sheets Logs
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('calendar');
            }}
            className={`px-4 py-2.5 font-brawl text-xs rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-slate-900 text-amber-300 border-t-2 border-x-2 border-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📅</span> Google Calendar Events
          </button>

          <button
            onClick={() => {
              soundManager.playUiClick();
              setActiveTab('gemini');
            }}
            className={`px-4 py-2.5 font-brawl text-xs rounded-t-xl transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'gemini'
                ? 'bg-slate-900 text-indigo-300 border-t-2 border-x-2 border-indigo-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>✨</span> Gemini Esports AI
          </button>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          
          {/* TAB 1: GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-sky-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-brawl text-lg text-white">Cloud Save & Match Replay Backup</h3>
                  <p className="text-xs text-slate-300 max-w-lg mt-1">
                    Export your Paula Drops 2.0 account state, unlocked brawlers, legacy compensation certificate, and match telemetry directly into your personal Google Drive with permission from your account.
                  </p>
                </div>
                <button
                  onClick={handleBackupProfileToDrive}
                  disabled={loading || !hasAccessToken}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-50 text-white font-brawl text-sm shadow-lg border-2 border-sky-300 transition-all cursor-pointer whitespace-nowrap active:translate-y-0.5"
                >
                  {loading ? 'UPLOADING...' : '💾 BACKUP TO DRIVE'}
                </button>
              </div>

              {/* Saved Files on Google Drive */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-brawl text-sm text-sky-300">
                    SAVED FILES ON YOUR GOOGLE DRIVE ({driveFiles.length})
                  </h4>
                  <button
                    onClick={refreshData}
                    className="text-xs text-sky-400 hover:text-sky-300 underline font-brawl cursor-pointer"
                  >
                    🔄 Refresh List
                  </button>
                </div>

                {driveFiles.length === 0 ? (
                  <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs font-brawl">
                    No Paula Drops backups found yet. Click "Backup to Drive" above to create your first save!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {driveFiles.map((f) => (
                      <div
                        key={f.id}
                        className="flex items-center justify-between p-3.5 bg-slate-950/70 rounded-xl border border-slate-800 hover:border-sky-500/50 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">📄</span>
                          <div>
                            <div className="font-brawl text-xs text-white">{f.name}</div>
                            <div className="text-[10px] text-slate-400">
                              Created: {new Date(f.createdTime).toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {f.webViewLink && (
                            <a
                              href={f.webViewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-300 text-xs font-brawl border border-sky-600 cursor-pointer"
                            >
                              Open in Drive ↗
                            </a>
                          )}
                          <button
                            onClick={() => {
                              soundManager.playUiClick();
                              setDeleteConfirmationFile(f);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-brawl border border-rose-600 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE SHEETS */}
          {activeTab === 'sheets' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-brawl text-lg text-white">Google Sheets Esports Match Log</h3>
                  <p className="text-xs text-slate-300 max-w-lg mt-1">
                    Create an official esports scorecard spreadsheet in Google Sheets. Automatically record your kills, damage, brawler picks, Starr Drops found, and trophy deltas with each match.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateSheet}
                    disabled={loading || !hasAccessToken}
                    className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-brawl text-sm shadow-lg border-2 border-emerald-300 transition-all cursor-pointer whitespace-nowrap active:translate-y-0.5"
                  >
                    {loading ? 'CREATING...' : '📊 NEW SPREADSHEET'}
                  </button>
                </div>
              </div>

              {activeSheet && (
                <div className="p-4 bg-emerald-950/30 rounded-2xl border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-emerald-400 font-brawl uppercase tracking-wider">
                        Active Linked Sheet
                      </div>
                      <div className="font-brawl text-base text-white">{activeSheet.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {activeSheet.spreadsheetId}</div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={activeSheet.spreadsheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-brawl text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 border border-emerald-300"
                      >
                        Open in Sheets ↗
                      </a>
                      <button
                        onClick={handleLogMatchToSheet}
                        disabled={loading || !hasAccessToken}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 font-brawl text-xs rounded-xl shadow-md cursor-pointer border border-emerald-500/40"
                      >
                        + Log Test Battle
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Sample format guide */}
              <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-xs">
                <div className="font-brawl text-slate-300 mb-2">Spreadsheet Columns & Automation Schema:</div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px] text-slate-400 font-mono">
                  <span className="p-2 bg-slate-900 rounded border border-slate-800">1. Timestamp</span>
                  <span className="p-2 bg-slate-900 rounded border border-slate-800">2. Game Mode</span>
                  <span className="p-2 bg-slate-900 rounded border border-slate-800">3. Outcome</span>
                  <span className="p-2 bg-slate-900 rounded border border-slate-800">4. Brawler</span>
                  <span className="p-2 bg-slate-900 rounded border border-slate-800">5. Kills</span>
                  <span className="p-2 bg-slate-900 rounded border border-slate-800">6. Deaths</span>
                  <span className="p-2 bg-slate-900 rounded border border-slate-800">7. Damage</span>
                  <span className="p-2 bg-slate-900 rounded border border-slate-800">8. Starr Drops</span>
                  <span className="p-2 bg-slate-900 rounded border border-slate-800">9. Trophy Δ</span>
                  <span className="p-2 bg-slate-900 rounded border border-slate-800">10. MVP Player</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE CALENDAR */}
          {activeTab === 'calendar' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-amber-500/30">
                <h3 className="font-brawl text-lg text-white">Championship & Special Event Schedules</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Add Paula Drops 2.0 official tournaments and weekend special events directly into your primary Google Calendar with push reminders.
                </p>
              </div>

              {/* Tournament Presets */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-amber-500/40 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs font-brawl text-amber-400">🏆 WORLD CHAMPIONSHIP</div>
                    <div className="font-brawl text-sm text-white mt-1">Paula Drops 2.0 World Finals Qualifier</div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      3v3 bracket tournament with 10,000 Bling prize pool & Legendary Starr Drop drops.
                    </p>
                    <div className="text-[10px] text-amber-300 mt-2 font-mono">Starts in 24 hours (Duration: 2h)</div>
                  </div>
                  <button
                    onClick={() =>
                      handleScheduleEvent({
                        summary: '🏆 Paula Drops 2.0 World Championship Qualifier',
                        description: 'Official 3v3 Paula Drops Esports tournament! Check in 15 minutes before start.',
                        startHours: 24,
                        duration: 2,
                      })
                    }
                    disabled={loading || !hasAccessToken}
                    className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-brawl text-xs shadow cursor-pointer font-bold border border-amber-300"
                  >
                    + Add to Google Calendar
                  </button>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-2xl border border-sky-500/40 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs font-brawl text-sky-400">⚡ STARR DROP FRENZY</div>
                    <div className="font-brawl text-sm text-white mt-1">Double Starr Drop Weekend Rush</div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Earn 2x Starr Drops in every match victory with 100% Hypercharge spawn rates.
                    </p>
                    <div className="text-[10px] text-sky-300 mt-2 font-mono">Starts this Saturday (Duration: 48h)</div>
                  </div>
                  <button
                    onClick={() =>
                      handleScheduleEvent({
                        summary: '⚡ Paula Drops: Double Starr Drop Weekend',
                        description: 'Starr Drop Frenzy weekend active! All match wins yield double drops.',
                        startHours: 72,
                        duration: 48,
                      })
                    }
                    disabled={loading || !hasAccessToken}
                    className="w-full py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-brawl text-xs shadow cursor-pointer font-bold border border-sky-300"
                  >
                    + Add to Google Calendar
                  </button>
                </div>

                <div className="p-4 bg-slate-950/70 rounded-2xl border border-indigo-500/40 flex flex-col justify-between gap-3">
                  <div>
                    <div className="text-xs font-brawl text-indigo-400">👑 POWER LEAGUE</div>
                    <div className="font-brawl text-sm text-white mt-1">Season 14 Ladder Reset & Rewards</div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Claim ranked badges, competitive Bling bonuses, and exclusive hero skins.
                    </p>
                    <div className="text-[10px] text-indigo-300 mt-2 font-mono">Starts in 7 days (Duration: 1h)</div>
                  </div>
                  <button
                    onClick={() =>
                      handleScheduleEvent({
                        summary: '👑 Paula Drops: Power League Season 14 Reset',
                        description: 'Season reset event! Collect season end rewards and begin placement matches.',
                        startHours: 168,
                        duration: 1,
                      })
                    }
                    disabled={loading || !hasAccessToken}
                    className="w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-brawl text-xs shadow cursor-pointer font-bold border border-indigo-300"
                  >
                    + Add to Google Calendar
                  </button>
                </div>
              </div>

              {/* Synced Calendar Events */}
              <div>
                <h4 className="font-brawl text-xs text-slate-400 uppercase tracking-wider mb-2">
                  Synced Events on Your Calendar ({calendarEvents.length})
                </h4>
                {calendarEvents.length === 0 ? (
                  <div className="p-4 bg-slate-950/30 rounded-xl text-center text-xs text-slate-500 font-brawl">
                    No Paula Drops events on your calendar yet. Click "+ Add to Google Calendar" to add one!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {calendarEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="flex items-center justify-between p-3 bg-slate-950/60 rounded-xl border border-slate-800"
                      >
                        <div>
                          <div className="font-brawl text-xs text-amber-300">{evt.summary}</div>
                          <div className="text-[10px] text-slate-400">
                            {evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleString() : 'All day'}
                          </div>
                        </div>
                        {evt.htmlLink && (
                          <a
                            href={evt.htmlLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-brawl rounded-lg border border-amber-500/40"
                          >
                            View in Calendar ↗
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: GEMINI ESPORTS AI */}
          {activeTab === 'gemini' && (
            <div className="space-y-6">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="font-brawl text-lg text-white">Google Gemini AI Match Analyst & Coach</h3>
                  <p className="text-xs text-slate-300 max-w-lg mt-1">
                    Powered by the official Google Gen AI SDK (@google/genai). Generates electrifying esports shoutcasting commentary and tactical build suggestions for your brawler!
                  </p>
                </div>
                <button
                  onClick={handleRunAiAnalysis}
                  disabled={generatingAi}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-brawl text-sm shadow-lg border-2 border-indigo-300 transition-all cursor-pointer whitespace-nowrap active:translate-y-0.5"
                >
                  {generatingAi ? 'ANALYZING...' : '✨ CAST MATCH RECAP'}
                </button>
              </div>

              {aiAnalysis && (
                <div className="p-5 bg-gradient-to-br from-indigo-950/80 to-slate-950 rounded-2xl border-2 border-indigo-400 shadow-xl space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎙️</span>
                    <span className="font-brawl text-xs text-indigo-300 uppercase tracking-wider">
                      Paula AI Live Caster Debrief
                    </span>
                  </div>
                  <p className="font-brawl text-base text-white italic leading-relaxed">
                    {aiAnalysis}
                  </p>
                </div>
              )}

              {/* Tactical Brawler Matrix with Gemini */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
                  <div className="text-xs font-brawl text-rose-400">VEXA (ASSASSIN)</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Gemini Tip: Chain Shadow Dagger teleport into bushes right as enemy gem carriers overextend. Pop Void Shift gadget to survive burst damage!
                  </div>
                </div>
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
                  <div className="text-xs font-brawl text-emerald-400">ZEPHYR (ARTILLERY)</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Gemini Tip: Pre-fire Gale Mortars over center obstacles to deny mine control. Deploy updraft geyser to launch retreating enemies back into the fight!
                  </div>
                </div>
                <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800">
                  <div className="text-xs font-brawl text-amber-400">THRUM (HEAVY TANK)</div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    Gemini Tip: Charge Sonic Boom straight into dense fog or high-traffic chokepoints to stun enemy clusters and secure match-winning Starr Drops.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="px-6 py-3.5 bg-slate-950/90 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400 font-brawl">
          <div className="flex items-center gap-3">
            <span>Powered by Google Workspace APIs & Google Gen AI</span>
          </div>
          <button
            onClick={() => {
              soundManager.playUiClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-brawl border border-slate-600 cursor-pointer"
          >
            CLOSE
          </button>
        </div>

      </div>

      {/* MANDATORY CONFIRMATION DIALOG FOR DESTRUCTIVE ACTION (Drive File Deletion) */}
      {deleteConfirmationFile && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border-4 border-rose-500 rounded-3xl p-6 shadow-2xl text-white space-y-4 font-body animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-400">
              <span className="text-3xl">⚠️</span>
              <h3 className="font-brawl text-xl">Confirm Google Drive Deletion</h3>
            </div>
            <p className="text-sm text-slate-300">
              Are you sure you want to permanently delete this backup file from your Google Drive?
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-rose-300 break-all">
              {deleteConfirmationFile.name}
            </div>
            <p className="text-xs text-slate-400">
              This action cannot be undone. The file will be removed from your Google Drive storage.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmationFile(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-brawl text-xs border border-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                disabled={loading}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-brawl text-xs shadow-lg border border-rose-400 cursor-pointer"
              >
                {loading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
