'use strict';

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
  policies:        null,
  hosts:           []
}, (prefs) => {
  const hostname = location.hostname;
  if (!matchesHost(prefs.hosts, hostname)) return;

  const policy = (prefs.policies && prefs.policies[hostname]) || [];

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');

  script.dataset.visibilityState = prefs.visibilityState;
  script.dataset.hidden          = prefs.hidden;
  script.dataset.blur            = prefs.blur;
  script.dataset.focus           = prefs.focus;
  script.dataset.visibility      = prefs.visibility;
  script.dataset.mouseleave      = prefs.mouseleave;
  script.dataset.mouseout        = prefs.mouseout;
  script.dataset.pointercapture  = prefs.pointercapture;
  script.dataset.redirect        = prefs.redirect;
  script.dataset.log             = prefs.log;
  script.dataset.policy          = JSON.stringify(policy);

  const target = document.head || document.documentElement;
  target.prepend(script);

  script.addEventListener('load', () => script.remove());
});