import {applySafeAreaVariables,installSafeAreaTracking,isPortraitViewport,safeAreaSupported,viewportMetrics} from './mobile-safe-area.js';

export const TOUCH_SETTINGS_KEY = 'pxTouchSettingsV1';
export const HAPTIC_MODES = Object.freeze(['on', 'reduced', 'off']);

export function detectMobilePlatform(
  nav = globalThis.navigator,
  view = globalThis.window
) {
  const ua = String(nav?.userAgent || '');
  const platform = String(nav?.platform || '');
  const touchPoints = Number(nav?.maxTouchPoints || 0);
  const isIPadDesktopUA = /Mac/.test(platform) && touchPoints > 1;
  const ios = /iPhone|iPad|iPod/i.test(ua) || isIPadDesktopUA;
  const android = /Android/i.test(ua);
  const safari = ios && /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS/i.test(ua);
  const coarse = !!view?.matchMedia?.('(pointer: coarse)')?.matches;
  return {
    ios,
    android,
    safari,
    touch: touchPoints > 0 || coarse,
    tablet: /iPad|Tablet/i.test(ua) || isIPadDesktopUA || (android && !/Mobile/i.test(ua)),
    safeArea: safeAreaSupported(view?.CSS || globalThis.CSS),
    standalone: !!view?.matchMedia?.('(display-mode: standalone)')?.matches || !!nav?.standalone
  };
}

export function loadTouchSettings(storage = globalThis.localStorage, fallbackFactory = () => ({})) {
  let stored = {};
  try {
    stored = JSON.parse(storage?.getItem?.(TOUCH_SETTINGS_KEY) || '{}') || {};
  } catch {
    stored = {};
  }
  return fallbackFactory(stored);
}

export function saveTouchSettings(settings, storage = globalThis.localStorage) {
  try {
    storage?.setItem?.(TOUCH_SETTINGS_KEY, JSON.stringify(settings));
    return true;
  } catch {
    return false;
  }
}

const HAPTIC_PATTERNS = Object.freeze({
  heavyHit: [16],
  perfectBlock: [10, 18, 10],
  guardBreak: [28, 20, 24],
  clash: [24],
  beamClash: [24],
  ultimateActivate: [18, 25, 32]
});

export class HapticsManager {
  constructor({
    nav = globalThis.navigator,
    mode = () => 'on',
    now = () => Date.now()
  } = {}) {
    this.nav = nav;
    this.mode = mode;
    this.now = now;
    this.lastPulse = 0;
  }

  trigger(cue) {
    const setting = this.mode();
    const pattern = HAPTIC_PATTERNS[cue];
    const current = this.now();
    if (!pattern || setting === 'off' || typeof this.nav?.vibrate !== 'function' || current - this.lastPulse < 70) return false;
    this.lastPulse = current;
    const output = setting === 'reduced' ? [Math.max(6, Math.round(pattern[0] * .55))] : pattern;
    return this.nav.vibrate(output) !== false;
  }
}

export class MobilePlatformController {
  constructor({
    doc = globalThis.document,
    view = globalThis.window,
    nav = globalThis.navigator,
    onBackPause = () => {},
    onViewportChange = () => {}
  } = {}) {
    this.doc = doc;
    this.view = view;
    this.nav = nav;
    this.info = detectMobilePlatform(nav, view);
    this.onBackPause = onBackPause;
    this.active = false;
    this.backArmed = false;
    this._prevent = event => {
      if (!this.active) return;
      if (event.target?.closest?.('.mobileModalCard')) return;
      if (event.cancelable) event.preventDefault();
    };
    this._back = event => {
      if (!this.active) return;
      event?.preventDefault?.();
      this.onBackPause();
      this._armBackEntry();
    };
    this.tracker = installSafeAreaTracking({doc, view, onChange:onViewportChange});
  }

  shouldUseTouch(width = viewportMetrics(this.view).width) {
    return this.info.touch || width <= 850;
  }

  _armBackEntry() {
    if (!this.active || !this.view?.history?.pushState) return;
    this.view.history.pushState({ ...(this.view.history.state || {}), pxMobileMatch: true }, '', this.view.location?.href);
    this.backArmed = true;
  }

  activateMatch() {
    if (this.active) return;
    this.active = true;
    applySafeAreaVariables(this.doc, this.view);
    this.doc?.body?.classList?.add('touch-match-active');
    this.doc?.addEventListener?.('touchmove', this._prevent, { passive: false });
    this.doc?.addEventListener?.('gesturestart', this._prevent, { passive: false });
    this.doc?.addEventListener?.('dblclick', this._prevent, { passive: false });
    this.view?.addEventListener?.('popstate', this._back);
    this._armBackEntry();
  }

  deactivateMatch() {
    if (!this.active) return;
    this.active = false;
    this.doc?.body?.classList?.remove('touch-match-active');
    this.doc?.removeEventListener?.('touchmove', this._prevent);
    this.doc?.removeEventListener?.('gesturestart', this._prevent);
    this.doc?.removeEventListener?.('dblclick', this._prevent);
    this.view?.removeEventListener?.('popstate', this._back);
    if (this.backArmed && this.view?.history?.replaceState) {
      const state = { ...(this.view.history.state || {}) };
      delete state.pxMobileMatch;
      this.view.history.replaceState(state, '', this.view.location?.href);
    }
    this.backArmed = false;
  }

  isPortrait() {
    return isPortraitViewport(this.view);
  }

  async requestFullscreen(element = this.doc?.documentElement) {
    try {
      if (!element?.requestFullscreen) return false;
      await element.requestFullscreen();
      return true;
    } catch {
      return false;
    }
  }

  dispose() {
    this.deactivateMatch();
    this.tracker?.dispose?.();
  }
}
