import isletme from './isletme.js';
import guven from './guven.js';
import stres from './stres.js';
import toplanti from './toplanti.js';
import senaryo from './senaryo.js';
import vizyon from './vizyon.js';
import ik from './ik.js';

export const MODULES = [isletme, guven, ik, vizyon, senaryo, stres, toplanti];
export const byKey = Object.fromEntries(MODULES.map((m) => [m.key, m]));
export const getModule = (k) => byKey[k] || null;

// Değerlendirme ayarlarına göre (ör. seçilen senaryolar) modülün etkin hâli
export function effective(mod, settings) {
  return mod.forSettings ? mod.forSettings(settings?.public || {}) : mod;
}
