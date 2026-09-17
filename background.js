'use strict';

const validateHost = (host) => {
  if (!host || host.trim() === '') return null;
  host = host.trim();

  const pattern = host.replace(/^\*\./, '');
  try {
    new URL('https://' + pattern);
    return null;
  } catch (e) {
    return `Invalid hostname: "${host}"`;
  }
};

const getHostname = (url) => {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return null;
  }
};

const matchesHost = (hosts, hostname) => {
  if (!hosts || hosts.length === 0) return false;
  for (const h of hosts) {
    const pattern = h.trim();
    if (!pattern) continue;
    if (pattern === hostname) return true;
    if (pattern.startsWith('*.')) {
      const base = pattern.slice(2);
      if (hostname === base || hostname.endsWith('.' + base)) return true;
    }
  }
  return false;
};

const updateBadge = async (tabId, hostname) => {
  if (typeof tabId !== 'number' || tabId < 0) return;
  if (!hostname) {
    chrome.action.setBadgeText({ tabId, text: '' });
    return;
  }
  const { hosts } = await chrome.storage.local.get({ hosts: [] });
  const active = matchesHost(hosts, hostname);
  chrome.action.setBadgeText({ tabId, text: active ? 'ON' : '' });
  chrome.action.setBadgeBackgroundColor({ tabId, color: '#34a853' });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.method === 'validate') {
    const hosts = message.hosts.filter(h => h.trim() !== '');
    for (const host of hosts) {
      const err = validateHost(host);
      if (err) {
        sendResponse(err);
        return true;
      }
    }
    sendResponse(null);
    return true;
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  const hostname = getHostname(tab.url);
  if (!hostname) return;

  const { hosts } = await chrome.storage.local.get({ hosts: [] });
  const exists = hosts.includes(hostname);
  const newHosts = exists
    ? hosts.filter(h => h !== hostname)
    : [...hosts, hostname];

  await chrome.storage.local.set({ hosts: newHosts });
  await updateBadge(tab.id, hostname);

  if (tab.id) chrome.tabs.reload(tab.id);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    updateBadge(tabId, getHostname(tab.url));
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  try {
    const tab = await chrome.tabs.get(tabId);
    updateBadge(tabId, getHostname(tab.url));
  } catch (e) { }
});

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.tabs.create({ url: chrome.runtime.getURL('data/options/index.html') });
  } else if (reason === 'update') {
    chrome.storage.local.get({ faqs: true }, (prefs) => {
      if (prefs.faqs) {
        chrome.tabs.create({ url: chrome.runtime.getManifest().homepage_url + '/wiki/FAQ' });
      }
    });
  }
});