export const SAFE_AREA_VARIABLES = Object.freeze({
  top: 'env(safe-area-inset-top, 0px)',
  right: 'env(safe-area-inset-right, 0px)',
  bottom: 'env(safe-area-inset-bottom, 0px)',
  left: 'env(safe-area-inset-left, 0px)'
});

export function viewportMetrics(view = globalThis.window) {
  const visual = view?.visualViewport;
  return {
    width: Math.max(1, Number(visual?.width || view?.innerWidth || 1)),
    height: Math.max(1, Number(visual?.height || view?.innerHeight || 1)),
    offsetLeft: Number(visual?.offsetLeft || 0),
    offsetTop: Number(visual?.offsetTop || 0)
  };
}

export function isPortraitViewport(view = globalThis.window) {
  const { width, height } = viewportMetrics(view);
  return height > width;
}

export function safeAreaSupported(css = globalThis.CSS) {
  return !!css?.supports?.('padding-top: env(safe-area-inset-top)');
}

export function applySafeAreaVariables(doc = globalThis.document, view = globalThis.window) {
  const root = doc?.documentElement;
  if (!root) return viewportMetrics(view);
  const metrics = viewportMetrics(view);
  root.style.setProperty('--safe-top', SAFE_AREA_VARIABLES.top);
  root.style.setProperty('--safe-right', SAFE_AREA_VARIABLES.right);
  root.style.setProperty('--safe-bottom', SAFE_AREA_VARIABLES.bottom);
  root.style.setProperty('--safe-left', SAFE_AREA_VARIABLES.left);
  root.style.setProperty('--mobile-vh', `${metrics.height}px`);
  root.style.setProperty('--mobile-vw', `${metrics.width}px`);
  root.style.setProperty('--visual-offset-top', `${metrics.offsetTop}px`);
  root.style.setProperty('--visual-offset-left', `${metrics.offsetLeft}px`);
  root.dataset.mobileOrientation = metrics.height > metrics.width ? 'portrait' : 'landscape';
  return metrics;
}

export function installSafeAreaTracking({
  doc = globalThis.document,
  view = globalThis.window,
  onChange = () => {}
} = {}) {
  let last = applySafeAreaVariables(doc, view);
  const update = () => {
    const next = applySafeAreaVariables(doc, view);
    if (
      next.width !== last.width ||
      next.height !== last.height ||
      next.offsetTop !== last.offsetTop ||
      next.offsetLeft !== last.offsetLeft
    ) {
      last = next;
      onChange(next);
    }
  };
  view?.addEventListener?.('resize', update, { passive: true });
  view?.addEventListener?.('orientationchange', update, { passive: true });
  view?.visualViewport?.addEventListener?.('resize', update, { passive: true });
  view?.visualViewport?.addEventListener?.('scroll', update, { passive: true });
  return {
    update,
    dispose() {
      view?.removeEventListener?.('resize', update);
      view?.removeEventListener?.('orientationchange', update);
      view?.visualViewport?.removeEventListener?.('resize', update);
      view?.visualViewport?.removeEventListener?.('scroll', update);
    }
  };
}
