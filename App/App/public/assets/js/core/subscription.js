// =====================================================================
//  Abonelik: 30 günlük deneme + aylık "ProX Yedilisi" aboneliği (RevenueCat)
//  • Erişim kararı sunucuda verilir (005_subscription.sql); buradaki hesap yalnızca ekran içindir.
//  • Satın alma yalnızca Android/iOS uygulamasında, mağaza ödeme sistemiyle yapılır.
//  • RevenueCat App User ID = kurum id'si → abonelik kuruma bağlıdır, tüm cihazlarda geçerlidir.
//  • Fiyat ve ürün adı her zaman mağazadan okunur; uygulamada sabit fiyat yoktur.
// =====================================================================
import { CONFIG } from '../config.js';
import { api } from './api.js';
import { state, refresh } from './state.js';
import { isNative, platform } from './native.js';

const DAY = 864e5;
const fut = (x) => !!x && new Date(x).getTime() > Date.now();

// Kurumun erişim durumu (ekranda gösterim için)
export function access(org = state.org, { ignoreAdmin = false } = {}) {
  if (!org) return { has: false, kind: 'none' };
  if (!ignoreAdmin && (state.isSuper || org.viaAdmin)) return { has: true, kind: 'admin' };
  const sub = fut(org.sub_expires_at);
  const trial = fut(org.trial_ends_at);
  if (org.trial_ends_at === undefined && org.sub_expires_at === undefined) return { has: true, kind: 'legacy' }; // eski şema
  if (sub) return { has: true, kind: org.sub_store === 'admin' || org.sub_status === 'granted' ? 'granted' : 'sub', until: org.sub_expires_at, status: org.sub_status, store: org.sub_store, willRenew: org.sub_will_renew };
  if (trial) return { has: true, kind: 'trial', until: org.trial_ends_at, daysLeft: Math.max(1, Math.ceil((new Date(org.trial_ends_at) - Date.now()) / DAY)) };
  return { has: false, kind: 'expired', trialEnded: org.trial_ends_at, subEnded: org.sub_expires_at, status: org.sub_status };
}

// ------------------------------------------------------------ RevenueCat (yalnızca uygulamada)
const P = () => window.Capacitor?.Plugins?.Purchases;
const apiKey = () => (platform() === 'ios' ? CONFIG.REVENUECAT_IOS_KEY : platform() === 'android' ? CONFIG.REVENUECAT_ANDROID_KEY : '');
export const canPurchase = () => isNative() && !!P() && !!apiKey();

let configuredFor = null;
async function ensure(orgId) {
  if (!canPurchase()) throw new Error('purchases_unavailable');
  if (configuredFor === orgId) return;
  if (configuredFor === null) await P().configure({ apiKey: apiKey(), appUserID: orgId });
  else await P().logIn({ appUserID: orgId });
  configuredFor = orgId;
}

// Mağazadaki aylık paketi getir (fiyat, ad, süre mağazadan)
export async function loadPackage(orgId) {
  await ensure(orgId);
  const res = await P().getOfferings();
  const off = res?.current || Object.values(res?.all || {})[0];
  const pkgs = off?.availablePackages || [];
  return pkgs.find((p) => p.packageType === 'MONTHLY') || pkgs.find((p) => p.product?.identifier?.startsWith(CONFIG.RC_PRODUCT)) || pkgs[0] || null;
}

const userCancelled = (e) => !!(e?.userCancelled || e?.code === '1' || e?.code === 1 || /cancel/i.test(e?.message || ''));

async function syncAndRefresh(orgId) {
  try {
    await api.syncSubscription(orgId);
  } catch (e) {
    console.warn('sync', e); // webhook birkaç saniye içinde yine de işler
  }
  await refresh();
}

export async function purchase(orgId, pkg) {
  await ensure(orgId);
  try {
    await P().purchasePackage({ aPackage: pkg });
  } catch (e) {
    if (userCancelled(e)) return { cancelled: true };
    throw e;
  }
  await syncAndRefresh(orgId);
  return { ok: true };
}

export async function restore(orgId) {
  await ensure(orgId);
  await P().restorePurchases();
  await syncAndRefresh(orgId);
  return access(state.orgs.find((o) => o.id === orgId));
}

// Mağaza abonelik yönetim sayfası
export function manageUrl() {
  if (platform() === 'ios') return 'https://apps.apple.com/account/subscriptions';
  return `https://play.google.com/store/account/subscriptions?package=com.barisakca.analizprox&sku=${CONFIG.RC_PRODUCT}`;
}

// ------------------------------------------------------------ Microsoft Store (Windows uygulaması — Digital Goods API)
// Yalnızca Microsoft Store'dan kurulan Windows uygulamasında çalışır; tarayıcıda hiçbir şey yapmaz.
const MS_BILLING = 'https://store.microsoft.com/billing';
let msSvc;
export async function msService() {
  if (msSvc !== undefined) return msSvc;
  msSvc = null;
  if (typeof window.getDigitalGoodsService !== 'function' || isNative()) return null;
  try {
    msSvc = await window.getDigitalGoodsService(MS_BILLING);
  } catch {
    msSvc = null;
  }
  return msSvc;
}

// Mağazadaki abonelik eklentisinin adı ve fiyatı (fiyat Microsoft'tan, kullanıcının bölgesine göre)
export async function msLoadItem() {
  const svc = await msService();
  if (!svc) return null;
  const items = await svc.getDetails([CONFIG.MS_STORE_SKU]);
  const it = (items || []).find((x) => x.itemId === CONFIG.MS_STORE_SKU) || (items || [])[0];
  if (!it) return null;
  let priceString = '';
  try {
    priceString = new Intl.NumberFormat(document.documentElement.lang === 'en' ? 'en-US' : 'tr-TR', { style: 'currency', currency: it.price.currency }).format(Number(it.price.value));
  } catch {
    priceString = `${it.price?.value} ${it.price?.currency}`;
  }
  return { ...it, priceString };
}

// Sahip olunan (süresi dolmamış) abonelikleri sunucuya bildir → erişim uzar
export async function msSync(orgId) {
  const svc = await msService();
  if (!svc || !orgId) return false;
  const owned = ((await svc.listPurchases()) || []).filter((p) => p.itemId === CONFIG.MS_STORE_SKU && p.purchaseToken);
  let ok = false;
  for (const p of owned) {
    try {
      const r = await api.msRecordPurchase(orgId, p.itemId, p.purchaseToken);
      ok = ok || !!r?.ok;
    } catch (e) {
      console.warn('ms sync', e);
    }
  }
  return ok;
}

export async function msPurchase(orgId) {
  const svc = await msService();
  if (!svc) throw new Error('purchases_unavailable');
  const req = new PaymentRequest([{ supportedMethods: MS_BILLING, data: { sku: CONFIG.MS_STORE_SKU } }]);
  let res;
  try {
    res = await req.show();
  } catch (e) {
    if (/abort|cancel/i.test(e?.name + ' ' + e?.message)) return { cancelled: true };
    throw e;
  }
  try {
    await res.complete?.('success');
  } catch {
    /* bazı sürümlerde gerekmez */
  }
  const token = res?.details?.purchaseToken;
  if (token) await api.msRecordPurchase(orgId, CONFIG.MS_STORE_SKU, token).catch((e) => console.warn(e));
  await msSync(orgId); // jeton yanıtta yoksa sahip olunanlar listesinden al
  await refresh();
  return { ok: true };
}

// Windows uygulaması her açıldığında: yenilenen aboneliği otomatik uzat
export async function msAutoSync() {
  if (!state.session || !state.org || state.org.viaAdmin) return;
  if (!['owner', 'admin'].includes(state.org.role)) return;
  if (await msSync(state.org.id).catch(() => false)) await refresh();
}

export const msManageUrl = 'https://account.microsoft.com/services';
