'use strict';

const toast = document.getElementById('toast');

const notify = (message, timeout = 2500) => {
  toast.textContent = message;
  clearTimeout(notify._id);
  notify._id = setTimeout(() => toast.textContent = '', timeout);
};

chrome.storage.local.get({
  visibilityState: true,
  hidden:          true,
  blur:            true,
  focus:           true,
  redirect:        true,
  visibility:      true,
  pointercapture:  true,
  mouseleave:      true,
  mouseout:        true,
  log:             false,
  faqs:            true,
  policies:        null,
  hosts:           []
}, (prefs) => {
  document.getElementById('visibilityState').checked = prefs.visibilityState;
  document.getElementById('hidden').checked          = prefs.hidden;
  document.getElementById('blur').checked            = prefs.blur;
  document.getElementById('focus').checked           = prefs.focus;
  document.getElementById('visibility').checked      = prefs.visibility;
  document.getElementById('mouseleave').checked      = prefs.mouseleave;
  document.getElementById('mouseout').checked        = prefs.mouseout;
  document.getElementById('pointercapture').checked  = prefs.pointercapture;
  document.getElementById('redirect').checked        = prefs.redirect;
  document.getElementById('log').checked             = prefs.log;
  document.getElementById('faqs').checked            = prefs.faqs;

  document.getElementById('policies').value =
    prefs.policies ? JSON.stringify(prefs.policies, null, '  ') : '';

  document.getElementById('hosts').value = prefs.hosts.join(', ');

  if (typeof navigation === 'undefined') {
    document.getElementById('redirect').checked = false;
    document.getElementById('redirect').disabled = true;
    document.getElementById('redirect-container').classList.add('disabled');
  }
});

document.getElementById('save').addEventListener('click', async () => {
  const prefs = {
    visibilityState: document.getElementById('visibilityState').checked,
    hidden:          document.getElementById('hidden').checked,
    blur:            document.getElementById('blur').checked,
    focus:           document.getElementById('focus').checked,
    visibility:      document.getElementById('visibility').checked,
    mouseleave:      document.getElementById('mouseleave').checked,
    mouseout:        document.getElementById('mouseout').checked,
    pointercapture:  document.getElementById('pointercapture').checked,
    redirect:        document.getElementById('redirect').checked,
    log:             document.getElementById('log').checked,
    faqs:            document.getElementById('faqs').checked
  };

  let policies = null;
  const policiesRaw = document.getElementById('policies').value.trim();
  if (policiesRaw) {
    try {
      policies = JSON.parse(policiesRaw);
      document.getElementById('policies').value = JSON.stringify(policies, null, '  ');
    } catch (e) {
      return notify('⚠ Policies error: ' + e.message, 4000);
    }
  }
  prefs.policies = policies;

  const rawHosts = document.getElementById('hosts').value
    .split(/\s*,\s*/)
    .map(h => h.trim())
    .filter(h => h.length > 0);

  const validHosts = [];
  for (const h of rawHosts) {
    const err = await chrome.runtime.sendMessage({ method: 'validate', hosts: [h] });
    if (err) {
      return notify(`⚠ ${h}: ${err}`, 4000);
    }
    validHosts.push(h);
  }

  prefs.hosts = validHosts;
  document.getElementById('hosts').value = validHosts.join(', ');

  await chrome.storage.local.set(prefs);
  notify('Options saved');
});

document.getElementById('reset').addEventListener('click', (e) => {
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

document.getElementById('support').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getManifest().homepage_url });
});

document.getElementById('report').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getManifest().homepage_url + '/issues' });
});