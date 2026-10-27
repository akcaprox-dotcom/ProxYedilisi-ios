// Yasal metinler: uygulamada (Android/iOS) her açılışta sitedeki güncel metin
// (PUBLIC_URL/legal.json) çekilir; çevrimdışıysa son çekilen kopya, o da yoksa
// uygulamaya gömülü kopya gösterilir. Web'de zaten sitenin kendi dosyası kullanılır.
import { DOCS as LOCAL_DOCS, UPDATED as LOCAL_UPDATED } from '../content/legal.js';
import { isNative } from './native.js';
import { CONFIG } from '../config.js';

const KEY = 'apx.legal.live';
const valid = (j) => j && typeof j.UPDATED === 'string' && j.DOCS && j.DOCS.privacy && j.DOCS.kvkk && j.DOCS['kvkk-respondent'];
let cur = { DOCS: LOCAL_DOCS, UPDATED: LOCAL_UPDATED };
const take = (j) => { if (valid(j) && j.UPDATED >= cur.UPDATED) cur = { DOCS: j.DOCS, UPDATED: j.UPDATED }; };

try { take(JSON.parse(localStorage.getItem(KEY) || 'null')); } catch { /* yok say */ }

export const legal = () => cur;

let pending = null;
export function loadLiveLegal() {
  if (!isNative()) return Promise.resolve(cur);
  if (!pending) {
    pending = (async () => {
      try {
        const ctl = new AbortController();
        const tm = setTimeout(() => ctl.abort(), 6000);
        const r = await fetch(`${CONFIG.PUBLIC_URL}/legal.json`, { signal: ctl.signal, cache: 'no-cache' });
        clearTimeout(tm);
        if (r.ok) {
          const j = await r.json();
          if (valid(j)) {
            take(j);
            try { localStorage.setItem(KEY, JSON.stringify(j)); } catch { /* yok say */ }
          }
        }
      } catch { /* çevrimdışı: eldeki kopya */ }
      return cur;
    })();
  }
  return pending;
}
