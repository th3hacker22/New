/**
 * Service worker registration + update flow.
 *
 * Uses vite-plugin-pwa's virtual module. When a new version is ready, we show
 * a non-blocking toast-like banner so the user can refresh; this avoids the
 * "stale tab" problem where users keep running an old cached build.
 */
import { registerSW } from 'virtual:pwa-register';

let updateReady = false;

export const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    updateReady = true;
    showUpdateBanner();
  },
  onOfflineReady() {
    // Optional: could show a "ready to work offline" toast.
  },
  onRegisterError(error) {
    console.warn('PWA registration failed:', error);
  },
});

function showUpdateBanner() {
  if (typeof document === 'undefined') return;
  const banner = document.createElement('div');
  banner.setAttribute('role', 'status');
  banner.style.cssText = [
    'position:fixed',
    'z-index:9999',
    'left:50%',
    'bottom:16px',
    'transform:translateX(-50%)',
    'display:flex',
    'align-items:center',
    'gap:12px',
    'padding:10px 14px',
    'background:#111',
    'color:#fff',
    'border:1px solid #CCFF00',
    'border-radius:12px',
    'box-shadow:0 8px 30px rgba(0,0,0,0.6)',
    'font:600 12px/1.2 system-ui,sans-serif',
    'max-width:calc(100vw - 32px)',
  ].join(';');
  banner.innerHTML =
    '<span>✨ New version available</span>' +
    '<button id="pwa-reload" style="background:#CCFF00;color:#000;border:0;border-radius:8px;padding:6px 10px;font-weight:800;cursor:pointer">Reload</button>' +
    '<button id="pwa-dismiss" style="background:transparent;color:#aaa;border:0;cursor:pointer">✕</button>';
  document.body.appendChild(banner);

  banner.querySelector('#pwa-reload')?.addEventListener('click', () => {
    updateSW?.(true);
  });
  banner.querySelector('#pwa-dismiss')?.addEventListener('click', () => {
    banner.remove();
  });
}

export function isUpdateReady() {
  return updateReady;
}
