// Hash tabanlı yönlendirici — Cloudflare Pages ve Capacitor içinde sunucu ayarı gerektirmez
const routes = [];
let notFound = null;
let current = null;

export function route(pattern, handler) {
  const keys = [];
  const re = new RegExp(
    '^' + pattern.replace(/\//g, '\\/').replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '\\/?$'
  );
  routes.push({ re, keys, handler });
}
export const fallback = (h) => (notFound = h);

export function parse() {
  const h = location.hash.replace(/^#/, '') || '/';
  const [path, qs] = h.split('?');
  return { path, query: Object.fromEntries(new URLSearchParams(qs || '')) };
}

export async function resolve() {
  const { path, query } = parse();
  for (const r of routes) {
    const m = path.match(r.re);
    if (m) {
      const params = {};
      r.keys.forEach((k, i) => (params[k] = decodeURIComponent(m[i + 1])));
      current = { path, params, query };
      return r.handler(params, query);
    }
  }
  current = { path, params: {}, query };
  return notFound && notFound();
}

export const go = (path) => {
  if (location.hash === '#' + path) resolve();
  else location.hash = path;
};
export const here = () => current;

export function start() {
  window.addEventListener('hashchange', () => {
    document.querySelectorAll('.sheet-bg').forEach((s) => s.remove());
    resolve();
    window.scrollTo(0, 0);
  });
  resolve();
}
