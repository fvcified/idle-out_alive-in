import { matchesHost } from './lib/hosts';
import { DEFAULT_PREFS, type Prefs } from './types/prefs';

chrome.storage.local.get(DEFAULT_PREFS, (raw) => {
  const prefs = raw as Prefs;
  const hostname = location.hostname;
  if (!matchesHost(prefs.hosts, hostname)) return;

  const policy = (prefs.policies && prefs.policies[hostname]) || [];

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');

  script.dataset.visibilityState = String(prefs.visibilityState);
  script.dataset.hidden = String(prefs.hidden);
  script.dataset.blur = String(prefs.blur);
  script.dataset.focus = String(prefs.focus);
  script.dataset.visibility = String(prefs.visibility);
  script.dataset.mouseleave = String(prefs.mouseleave);
  script.dataset.mouseout = String(prefs.mouseout);
  script.dataset.pointercapture = String(prefs.pointercapture);
  script.dataset.redirect = String(prefs.redirect);
  script.dataset.log = String(prefs.log);
  script.dataset.policy = JSON.stringify(policy);

  const target = document.head || document.documentElement;
  target.prepend(script);

  script.addEventListener('load', () => script.remove());
});