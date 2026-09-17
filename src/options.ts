import { DEFAULT_PREFS, type Policies, type Prefs } from './types/prefs';
import type { ValidateMessage, ValidateResponse } from './types/messages';

const $ = <T extends HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el as T;
};
const check = (id: string): HTMLInputElement => $<HTMLInputElement>(id);
const area = (id: string): HTMLTextAreaElement => $<HTMLTextAreaElement>(id);

const toast = $<HTMLSpanElement>('toast');
let toastTimer: ReturnType<typeof setTimeout> | undefined;

const notify = (message: string, timeout = 2500): void => {
  toast.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.textContent = ''), timeout);
};

chrome.storage.local.get(DEFAULT_PREFS, (raw) => {
  const prefs = raw as Prefs;

  check('visibilityState').checked = prefs.visibilityState;
  check('hidden').checked = prefs.hidden;
  check('blur').checked = prefs.blur;
  check('focus').checked = prefs.focus;
  check('visibility').checked = prefs.visibility;
  check('mouseleave').checked = prefs.mouseleave;
  check('mouseout').checked = prefs.mouseout;
  check('pointercapture').checked = prefs.pointercapture;
  check('redirect').checked = prefs.redirect;
  check('log').checked = prefs.log;
  check('faqs').checked = prefs.faqs;

  area('policies').value = prefs.policies ? JSON.stringify(prefs.policies, null, '  ') : '';
  area('hosts').value = prefs.hosts.join(', ');

  if (typeof navigation === 'undefined') {
    const redirect = check('redirect');
    redirect.checked = false;
    redirect.disabled = true;
    $('redirect-container').classList.add('disabled');
  }
});

$('save').addEventListener('click', async () => {
  const toggles = {
    visibilityState: check('visibilityState').checked,
    hidden: check('hidden').checked,
    blur: check('blur').checked,
    focus: check('focus').checked,
    visibility: check('visibility').checked,
    mouseleave: check('mouseleave').checked,
    mouseout: check('mouseout').checked,
    pointercapture: check('pointercapture').checked,
    redirect: check('redirect').checked,
    log: check('log').checked,
    faqs: check('faqs').checked,
  };

  let policies: Policies | null = null;
  const policiesRaw = area('policies').value.trim();
  if (policiesRaw) {
    try {
      policies = JSON.parse(policiesRaw) as Policies;
      area('policies').value = JSON.stringify(policies, null, '  ');
    } catch (e) {
      notify('⚠ Policies error: ' + (e as Error).message, 4000);
      return;
    }
  }

  const rawHosts = area('hosts')
    .value.split(/\s*,\s*/)
    .map((h) => h.trim())
    .filter((h) => h.length > 0);

  const validHosts: string[] = [];
  for (const h of rawHosts) {
    const err = (await chrome.runtime.sendMessage({
      method: 'validate',
      hosts: [h],
    } satisfies ValidateMessage)) as ValidateResponse;
    if (err) {
      notify(`⚠ ${h}: ${err}`, 4000);
      return;
    }
    validHosts.push(h);
  }

  area('hosts').value = validHosts.join(', ');

  const finalPrefs: Prefs = { ...toggles, policies, hosts: validHosts };
  await chrome.storage.local.set(finalPrefs);
  notify('Options saved');
});

$('reset').addEventListener('click', (e: MouseEvent) => {
  if (e.detail === 1) {
    notify('Double-click to reset all settings', 2000);
  } else {
    chrome.storage.local.clear(() => {
      chrome.storage.local.set({ _resetting: true }, () => {
        chrome.runtime.reload();
      });
    });
  }
});

$('support').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getManifest().homepage_url });
});

$('report').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getManifest().homepage_url + '/issues' });
});