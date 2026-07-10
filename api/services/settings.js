import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SETTINGS_PATH = path.join(__dirname, '../../config/system_settings.json');

const DEFAULT_SETTINGS = {
  site_name: "FAO APSAM 2026",
  site_subtitle: "Event Command Center",
  registration_enabled: true,
  webhook_url: "",
  zoom_account_id: "",
  zoom_client_id: "",
  zoom_client_secret: ""
};

export async function loadSettings() {
  let settings = { ...DEFAULT_SETTINGS };
  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = await fs.promises.readFile(SETTINGS_PATH, 'utf8');
      const parsed = JSON.parse(data);
      settings = { ...settings, ...parsed };
    }
  } catch (err) {
    console.error('Error loading settings:', err);
  }

  // Fall back to process.env for empty/missing values
  const keys = Object.keys(DEFAULT_SETTINGS);
  for (const key of keys) {
    const val = settings[key];
    if (val === undefined || val === null || val === '') {
      const envKey = key.toUpperCase();
      if (process.env[envKey] !== undefined) {
        if (key === 'registration_enabled') {
          settings[key] = process.env[envKey] === 'true' || process.env[envKey] === true || process.env[envKey] === '1';
        } else {
          settings[key] = process.env[envKey];
        }
      }
    }
  }

  return settings;
}

export async function saveSettings(newSettings) {
  try {
    const current = await loadSettings();
    const merged = { ...current };
    
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (newSettings[key] !== undefined) {
        let val = newSettings[key];
        if (key === 'registration_enabled') {
          merged[key] = (val === 'true' || val === true || val === 1 || val === '1');
        } else {
          if (val === '●●●●●●●●' && key === 'zoom_client_secret') {
            // Keep existing
          } else {
            merged[key] = val !== null ? String(val).trim() : '';
          }
        }
      }
    }

    await fs.promises.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
    await fs.promises.writeFile(SETTINGS_PATH, JSON.stringify(merged, null, 2), 'utf8');
    return merged;
  } catch (err) {
    console.error('Error saving settings:', err);
    throw err;
  }
}

export async function triggerWebhook(event, payload) {
  const settings = await loadSettings();
  const url = settings.webhook_url;
  if (!url) return;

  try {
    await axios.post(url, {
      event,
      timestamp: new Date().toISOString(),
      data: payload
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
  } catch (err) {
    console.error(`Webhook trigger error for event ${event}:`, err.message);
  }
}
