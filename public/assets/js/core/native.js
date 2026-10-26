// =====================================================================
//  Yerel uygulama köprüsü (Android / iOS — Capacitor)
//  Web'de hiçbir şey değiştirmez; uygulamada yazdırma, dosya paylaşma ve
//  dış bağlantıları cihazın kendi özellikleriyle yapar.
// =====================================================================
import { CONFIG } from '../config.js';

const C = () => window.Capacitor;
export const isNative = () => !!C()?.isNativePlatform?.();
export const platform = () => (isNative() ? C().getPlatform() : 'web');
const P = (name) => C()?.Plugins?.[name];

// Raporu / sayfayı PDF olarak kaydet: web → tarayıcı yazdırma; iOS → PDF üret + paylaş; Android → sistem yazdırma (PDF olarak kaydet)
export async function printPage(name = 'Analiz ProX') {
  if (isNative() && P('ApxPrint')) {
    try {
      await P('ApxPrint').print({ name: String(name).replace(/[\\/:*?"<>|]+/g, '-').slice(0, 80) });
      return;
    } catch (e) {
      console.warn('native print', e);
    }
  }
  window.print();
}

// Metin dosyası (CSV) indir / paylaş
export async function saveTextFile(filename, text, mime = 'text/csv') {
  if (isNative() && P('Filesystem') && P('Share')) {
    const res = await P('Filesystem').writeFile({ path: filename, data: '﻿' + text, directory: 'CACHE', encoding: 'utf8' });
    await P('Share').share({ title: filename, files: [res.uri], dialogTitle: filename });
    return true;
  }
  return false;
}

// Sistem paylaşım menüsü (uygulamada ve paylaşımı destekleyen tarayıcılarda)
export const canShare = () => (isNative() && !!P('Share')) || !!navigator.share;
export async function shareText({ title, text, url }) {
  if (isNative() && P('Share')) return P('Share').share({ title, text, url, dialogTitle: title });
  if (navigator.share) return navigator.share({ title, text, url });
}

// Uygulamada: yeni sekmede açılan bağlantılar uygulama içi tarayıcıda, dış uygulama bağlantıları (WhatsApp vb.) ilgili uygulamada açılır
export function installNativeLinks() {
  if (!isNative()) return;
  document.documentElement.classList.add('native', 'native-' + platform());
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('javascript:')) return;
    const internal = href.startsWith('#');
    if (internal && a.target !== '_blank') return; // normal uygulama içi gezinme
    if (/^(mailto|tel|sms):/i.test(href)) return; // sistem halleder
    e.preventDefault();
    const url = internal ? CONFIG.PUBLIC_URL.replace(/\/$/, '') + '/' + href : href;
    if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//i.test(url)) {
      location.href = url; // Capacitor dış adresi sistem/WhatsApp'a devreder
      return;
    }
    const B = P('Browser');
    if (B) B.open({ url, presentationStyle: 'popover', toolbarColor: '#080b14' }).catch(() => (location.href = url));
    else location.href = url;
  }, true);
}
