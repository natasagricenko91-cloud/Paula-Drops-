/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getCachedAccessToken } from './firebase';

export interface DriveBackupFile {
  id: string;
  name: string;
  mimeType: string;
  createdTime: string;
  webViewLink?: string;
  size?: string;
}

export interface MatchReplayTelemetry {
  matchId: string;
  timestamp: string;
  gameMode: string;
  durationSeconds: number;
  result: 'VICTORY' | 'DEFEAT' | 'DRAW';
  playerBrawler: string;
  playerKills: number;
  playerDeaths: number;
  playerDamage: number;
  starrDropsCollected: number;
  trophyDelta: number;
  mvp: string;
  eventsLog: Array<{ time: number; event: string; detail: string }>;
  teamScores: { blue: number; red: number };
}

export interface TournamentCalendarEvent {
  summary: string;
  description: string;
  startHoursFromNow: number;
  durationHours: number;
}

export interface GoogleCalendarItem {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  htmlLink?: string;
}

function getAuthHeader(): Record<string, string> {
  const token = getCachedAccessToken();
  if (!token) {
    throw new Error('NOT_AUTHENTICATED: Please sign in with your Google account to access Google Workspace services.');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

/* ========================================================================
   GOOGLE DRIVE API v3
   ======================================================================== */

/**
 * Uploads a JSON payload (Match Replay or Player Profile Backup) to user's Google Drive.
 */
export async function uploadJsonToDrive(
  fileName: string,
  data: Record<string, unknown> | unknown[],
  description = 'Paula Drops 2.0 Save Data'
): Promise<DriveBackupFile> {
  const headers = getAuthHeader();
  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    description,
    properties: {
      app: 'Paula Drops 2.0',
      type: 'backup',
    },
  };

  const boundary = '---------PaulaDropsDriveBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(data, null, 2) +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,createdTime,webViewLink,size',
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartBody,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive upload failed (${res.status}): ${errorText}`);
  }

  const result = await res.json();
  return result as DriveBackupFile;
}

/**
 * Lists backups stored in the user's Google Drive created by Paula Drops.
 */
export async function listPaulaDriveBackups(): Promise<DriveBackupFile[]> {
  const headers = getAuthHeader();
  const query = encodeURIComponent("name contains 'Paula_Drops' and trashed = false");
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,mimeType,createdTime,webViewLink,size)&orderBy=createdTime desc&pageSize=20`,
    {
      headers,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Drive list failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return (data.files || []) as DriveBackupFile[];
}

/**
 * Deletes a file from Google Drive (Caller MUST prompt user for confirmation first).
 */
export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const headers = getAuthHeader();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers,
  });

  if (!res.ok && res.status !== 404) {
    const errorText = await res.text();
    throw new Error(`Google Drive delete failed (${res.status}): ${errorText}`);
  }
  return true;
}

/* ========================================================================
   GOOGLE SHEETS API v4
   ======================================================================== */

export interface SheetCreationResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  title: string;
}

/**
 * Creates a brand new Esports Match History & Leaderboard Google Sheet.
 */
export async function createEsportsMatchSpreadsheet(customTitle?: string): Promise<SheetCreationResult> {
  const headers = getAuthHeader();
  const title = customTitle || `Paula Drops 2.0 - Esports Match History (${new Date().toLocaleDateString()})`;

  const body = {
    properties: {
      title,
    },
    sheets: [
      {
        properties: {
          title: 'Match History',
          gridProperties: {
            frozenRowCount: 1,
            columnCount: 10,
          },
          tabColor: { red: 0.1, green: 0.5, blue: 0.9 },
        },
        data: [
          {
            startRow: 0,
            startColumn: 0,
            rowData: [
              {
                values: [
                  { userEnteredValue: { stringValue: 'Date / Time' } },
                  { userEnteredValue: { stringValue: 'Game Mode' } },
                  { userEnteredValue: { stringValue: 'Outcome' } },
                  { userEnteredValue: { stringValue: 'Brawler' } },
                  { userEnteredValue: { stringValue: 'Kills' } },
                  { userEnteredValue: { stringValue: 'Deaths' } },
                  { userEnteredValue: { stringValue: 'Damage' } },
                  { userEnteredValue: { stringValue: 'Starr Drops' } },
                  { userEnteredValue: { stringValue: 'Trophy Δ' } },
                  { userEnteredValue: { stringValue: 'MVP Star Player' } },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Sheets creation failed (${res.status}): ${errorText}`);
  }

  const result = await res.json();
  return {
    spreadsheetId: result.spreadsheetId,
    spreadsheetUrl: result.spreadsheetUrl,
    title,
  };
}

/**
 * Appends a match record row to an existing Google Sheet.
 */
export async function appendMatchToSpreadsheet(
  spreadsheetId: string,
  matchData: {
    gameMode: string;
    result: string;
    brawler: string;
    kills: number;
    deaths: number;
    damage: number;
    starrDrops: number;
    trophyDelta: number;
    mvp: string;
  }
): Promise<boolean> {
  const headers = getAuthHeader();

  // First inspect spreadsheet metadata to avoid hardcoding assumed sheet names
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=sheets.properties`, {
    headers,
  });

  if (!metaRes.ok) {
    const errorText = await metaRes.text();
    throw new Error(`Failed to inspect spreadsheet (${metaRes.status}): ${errorText}`);
  }

  const meta = await metaRes.json();
  const firstSheetTitle = meta.sheets?.[0]?.properties?.title || 'Sheet1';
  const range = `${firstSheetTitle}!A:J`;

  const values = [
    [
      new Date().toLocaleString(),
      matchData.gameMode,
      matchData.result,
      matchData.brawler,
      matchData.kills,
      matchData.deaths,
      matchData.damage.toLocaleString(),
      matchData.starrDrops > 0 ? `${matchData.starrDrops} Drop(s)` : 'None',
      matchData.trophyDelta >= 0 ? `+${matchData.trophyDelta}` : `${matchData.trophyDelta}`,
      matchData.mvp,
    ],
  ];

  const appendRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values }),
    }
  );

  if (!appendRes.ok) {
    const errorText = await appendRes.text();
    throw new Error(`Failed to append match row (${appendRes.status}): ${errorText}`);
  }

  return true;
}

/* ========================================================================
   GOOGLE CALENDAR API v3
   ======================================================================== */

/**
 * Adds an official Paula Drops esports tournament or special event to the player's primary Google Calendar.
 */
export async function scheduleTournamentCalendarEvent(
  event: TournamentCalendarEvent
): Promise<{ id: string; htmlLink: string; summary: string }> {
  const headers = getAuthHeader();
  const startTime = new Date(Date.now() + event.startHoursFromNow * 3600 * 1000);
  const endTime = new Date(startTime.getTime() + event.durationHours * 3600 * 1000);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  const body = {
    summary: event.summary,
    description: `${event.description}\n\n🎮 Play Paula Drops 2.0 in real-time 3v3 arena!\n🎁 Win Legendary Starr Drops, Bling, and Power League trophies.`,
    start: {
      dateTime: startTime.toISOString(),
      timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone,
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'popup', minutes: 30 },
        { method: 'popup', minutes: 10 },
      ],
    },
  };

  const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Calendar event creation failed (${res.status}): ${errorText}`);
  }

  const result = await res.json();
  return {
    id: result.id,
    htmlLink: result.htmlLink || `https://calendar.google.com/calendar/event?eid=${result.id}`,
    summary: result.summary,
  };
}

/**
 * Lists upcoming Paula Drops events from Google Calendar.
 */
export async function listUpcomingCalendarEvents(): Promise<GoogleCalendarItem[]> {
  const headers = getAuthHeader();
  const now = new Date().toISOString();
  const query = encodeURIComponent('Paula Drops');

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?q=${query}&timeMin=${now}&singleEvents=true&orderBy=startTime&maxResults=10`,
    {
      headers,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Google Calendar fetch failed (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  return (data.items || []) as GoogleCalendarItem[];
}
