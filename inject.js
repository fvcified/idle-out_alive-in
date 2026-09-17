'use strict';

(() => {
  const el = document.currentScript;
  const prefs = {
    visibilityState: el.dataset.visibilityState === 'true',
    hidden:          el.dataset.hidden === 'true',
    blur:            el.dataset.blur === 'true',
    focus:           el.dataset.focus === 'true',
    visibility:      el.dataset.visibility === 'true',
    mouseleave:      el.dataset.mouseleave === 'true',
    mouseout:        el.dataset.mouseout === 'true',
    pointercapture:  el.dataset.pointercapture === 'true',
    redirect:        el.dataset.redirect === 'true',
    log:             el.dataset.log === 'true',
    policy:          JSON.parse(el.dataset.policy || '[]'),
  };

  const log = (...args) => prefs.log && console.log('[Idle Out, Alive In]', ...args);
  const isDisallowedByPolicy = (type) => {
    if (type !== 'unload' && type !== 'beforeunload') return false;
    try {
      if (document.permissionsPolicy && typeof document.permissionsPolicy.allowsFeature === 'function') {
        return !document.permissionsPolicy.allowsFeature(type);
      }
      if (document.featurePolicy && typeof document.featurePolicy.allowsFeature === 'function') {
        return !document.featurePolicy.allowsFeature(type);
      }
    } catch (e) { /* ignore, fall through to allow */ }
    return false;
  };

  if (prefs.visibilityState && !prefs.policy.includes('visibilityState')) {
    try {
      Object.defineProperty(Document.prototype, 'visibilityState', {
        get: () => 'visible',
        configurable: true
      });
      log('visibilityState → "visible"');
    } catch (e) { log('visibilityState failed:', e.message); }
  }

  if (prefs.hidden && !prefs.policy.includes('hidden')) {
    try {
      Object.defineProperty(Document.prototype, 'hidden', {
        get: () => false,
        configurable: true
      });
      log('document.hidden → false');
    } catch (e) { log('document.hidden failed:', e.message); }
  }

  const BLOCKED = [];
  if (prefs.blur          && !prefs.policy.includes('blur'))          BLOCKED.push('blur');
  if (prefs.focus         && !prefs.policy.includes('focus'))         BLOCKED.push('focus');
  if (prefs.visibility    && !prefs.policy.includes('visibility'))    BLOCKED.push('visibilitychange');
  if (prefs.mouseleave    && !prefs.policy.includes('mouseleave'))    BLOCKED.push('mouseleave');
  if (prefs.mouseout      && !prefs.policy.includes('mouseout'))      BLOCKED.push('mouseout');
  if (prefs.pointercapture && !prefs.policy.includes('pointercapture')) BLOCKED.push('lostpointercapture');

  const _add = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, fn, opts) {
    if (BLOCKED.includes(type)) {
      log(`Blocked addEventListener: "${type}"`);
      return;
    }
    if (isDisallowedByPolicy(type)) {
      log(`Skipped addEventListener("${type}") disallowed by Permissions-Policy`);
      return;
    }
    try {
      return _add.call(this, type, fn, opts);
    } catch (e) {
      log(`addEventListener("${type}") failed:`, e.message);
    }
  };

  if (BLOCKED.length > 0) {
    const _dispatch = EventTarget.prototype.dispatchEvent;
    EventTarget.prototype.dispatchEvent = function (event) {
      if (BLOCKED.includes(event.type)) {
        log(`Blocked dispatchEvent: "${event.type}"`);
        return true;
      }
      try {
        return _dispatch.call(this, event);
      } catch (e) {
        log(`dispatchEvent("${event.type}") failed:`, e.message);
      }
    };

    log('Blocking events:', BLOCKED);
  }

  if (prefs.redirect && !prefs.policy.includes('redirect')) {
    if (typeof navigation !== 'undefined') {
      navigation.addEventListener('navigate', (e) => {
        if (document.hidden) {
          e.preventDefault();
          log('Blocked navigation while hidden');
        }
      });
      log('Redirect blocking active');
    }
  }
})();