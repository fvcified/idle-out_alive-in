import { getHostname, matchesHost, validateHost } from './lib/hosts';
import type { ExtensionMessage, ValidateResponse } from './types/messages';
import browser from 'webextension-polyfill';

const updateBadge = async (tabId: number | undefined, hostname: string | null): Promise<void> => {
  if (typeof tabId !== 'number' || tabId < 0) return;
  if (!hostname) {
    browser.action.setBadgeText({ tabId, text: '' });
    return;
  }
  const { hosts } = (await browser.storage.local.get({ hosts: [] as string[] })) as { hosts: string[] };
  const active = matchesHost(hosts, hostname);
  browser.action.setBadgeText({ tabId, text: active ? '✓' : '' });
  browser.action.setBadgeBackgroundColor({ tabId, color: '#34a853' });
};

const DEFAULT_TITLE = 'Toggle Idle Out, Alive In for this site';

const resetTitle = (tabId: number): void => {
  browser.action.setTitle({ tabId, title: DEFAULT_TITLE });
};

const setToggleTitle = (tabId: number, hostname: string, active: boolean): void => {
  browser.action.setTitle({
    tabId,
    title: active
      ? `Idle Out, Alive In is --active for\n` +
        `-> ${hostname}\n` +
        `Click to disable\n`
      : `Idle Out, Alive In is --inactive for\n` +
        `-> ${hostname}\n` +
        `Click to enable\n`,
  });
};

const pendingToggleReload = new Map<number, string>();
const pendingClearTimers = new Map<number, ReturnType<typeof setTimeout>>();
const PENDING_CLEAR_DELAY_MS = 6500;

const armPendingClear = (tabId: number): void => {
  const existing = pendingClearTimers.get(tabId);
  if (existing) clearTimeout(existing);
  pendingClearTimers.set(
    tabId,
    setTimeout(() => {
      pendingToggleReload.delete(tabId);
      pendingClearTimers.delete(tabId);
    }, PENDING_CLEAR_DELAY_MS)
  );
};

const applyToggleTitle = async (tabId: number, hostname: string | null): Promise<void> => {
  if (!hostname) return;
  const { hosts } = (await browser.storage.local.get({ hosts: [] as string[] })) as { hosts: string[] };
  const active = matchesHost(hosts, hostname);
  setToggleTitle(tabId, hostname, active);
};

browser.runtime.onMessage.addListener(
  (message: unknown, _sender: browser.Runtime.MessageSender): ValidateResponse => {
    const msg = message as ExtensionMessage;
    if (msg.method === 'validate') {
      const hosts = msg.hosts.filter((h) => h.trim() !== '');
      for (const host of hosts) {
        const err = validateHost(host);
        if (err) return err;
      }
      return null;
    }
    return null;
  }
);

browser.action.onClicked.addListener(async (tab) => {
  const hostname = getHostname(tab.url);
  if (!hostname || typeof tab.id !== 'number') return;

  const { hosts } = (await browser.storage.local.get({ hosts: [] as string[] })) as { hosts: string[] };
  const exists = hosts.includes(hostname);
  const newHosts = exists ? hosts.filter((h) => h !== hostname) : [...hosts, hostname];

  await browser.storage.local.set({ hosts: newHosts });
  await updateBadge(tab.id, hostname);
  setToggleTitle(tab.id, hostname, !exists);

  pendingToggleReload.set(tab.id, hostname);
  browser.tabs.reload(tab.id);
});

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if ((changeInfo.status === 'loading' || changeInfo.status === 'complete') && tab.url) {
    const hostname = getHostname(tab.url);
    updateBadge(tabId, hostname);

    const pendingHostname = pendingToggleReload.get(tabId);
    const isPending = pendingHostname !== undefined && pendingHostname === hostname;

    if (isPending) {
      if (changeInfo.status === 'complete') {
        applyToggleTitle(tabId, hostname);
        armPendingClear(tabId);
      }
    } else {
      resetTitle(tabId);
    }
  }
});

browser.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await browser.tabs.get(tabId);
    updateBadge(tabId, getHostname(tab.url));
  } catch {}
});

browser.runtime.onInstalled.addListener(async ({ reason }) => {
  if (reason === 'install') {
    await browser.tabs.create({ url: browser.runtime.getURL('data/options/index.html') });
  } else if (reason === 'update') {
    const prefs = (await browser.storage.local.get({ faqs: true, _resetting: false })) as {
      faqs: boolean;
      _resetting: boolean;
    };
    if (prefs._resetting) {
      await browser.storage.local.remove('_resetting');
      return;
    }
    if (prefs.faqs) {
      await browser.tabs.create({ url: browser.runtime.getManifest().homepage_url + '/wiki/FAQ' });
    }
  }
});