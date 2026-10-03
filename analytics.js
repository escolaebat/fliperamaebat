/*!
 * Fliperama EBAT · camada de métricas anônimas
 * desenvolvido por CamilaLeite (Humana Camila) para EBAT - Escola Brasileira de Arte e Tecnologia
 *
 * O jogo chama apenas duas funções (window.EBATTrack e window.EBATScreen). Este arquivo decide
 * para qual ferramenta enviar, conforme o analytics-config.js. Para trocar de ferramenta,
 * basta mudar o "provider" no arquivo de configuração; o jogo não muda.
 *
 * Nada pessoal é enviado: nem o nome digitado, nem o nome da obra. Só contagens e tempos.
 */
(function () {
  'use strict';
  var C = window.EBAT_ANALYTICS || {};
  var provider = String(C.provider || 'none').toLowerCase();
  var qs = location.search || '';
  var host = location.hostname;
  var isLocal = !host || host === 'localhost' || host === '127.0.0.1' || location.protocol === 'file:';
  var debug = /[?&]debug_analytics=1/.test(qs) || provider === 'debug';

  /* A equipe pode excluir as próprias visitas: abra o site com ?notrack=1 (e ?notrack=0 para voltar) */
  try {
    if (/[?&]notrack=1/.test(qs)) localStorage.setItem('ebat_notrack', '1');
    if (/[?&]notrack=0/.test(qs)) localStorage.removeItem('ebat_notrack');
  } catch (e) {}
  var optOut = false; try { optOut = localStorage.getItem('ebat_notrack') === '1'; } catch (e) {}
  var dnt = C.respectDoNotTrack !== false && (navigator.doNotTrack === '1' || window.doNotTrack === '1');
  var off = provider === 'none' || optOut || dnt || (isLocal && !C.trackLocalhost && !debug);

  /* ---------- aviso de cookies ----------
   * Ferramentas com cookies (hoje: ga4) só começam a medir depois que a pessoa aceita no aviso.
   * Se recusar, nada é carregado nem enviado. A escolha fica salva só neste aparelho (ebat_cookies).
   * Em analytics-config.js: cookieBanner 'auto' (padrão: aparece só para ferramentas com cookies),
   * true (sempre aparece) ou false (nunca aparece; a medição não espera confirmação). */
  var CK = 'ebat_cookies';
  var cfgBanner = C.cookieBanner === undefined ? 'auto' : C.cookieBanner;
  var needConsent = cfgBanner === true || (cfgBanner === 'auto' && provider === 'ga4');
  function getConsent() { try { var v = localStorage.getItem(CK); return v === 'granted' || v === 'denied' ? v : null; } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(CK, v); } catch (e) {} }
  var consent = needConsent ? getConsent() : 'granted';
  var waiting = !off && needConsent && consent !== 'granted';   /* ainda sem permissão para medir */
  if (!off && needConsent && consent === 'denied') off = true;

  function clearGaCookies() {
    var parts = host.split('.'), doms = ['', host], i;
    for (i = 1; i < parts.length - 1; i++) doms.push('.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n !== '_ga' && n.indexOf('_ga_') !== 0 && n !== '_gid' && n.indexOf('_gat') !== 0) return;
      doms.forEach(function (d) { document.cookie = n + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : ''); });
    });
  }
  if (needConsent && consent === 'denied') { try { clearGaCookies(); } catch (e) {} }

  var log = window.__ebatEvents = [];
  var queue = [];

  function clean(p) {
    var o = {}, k, v;
    if (!p) return o;
    for (k in p) {
      v = p[k]; if (v == null) continue;
      if (typeof v === 'number') { if (isFinite(v)) o[k] = Math.round(v * 10) / 10; }
      else if (typeof v === 'boolean') o[k] = v ? 1 : 0;
      else o[k] = String(v).slice(0, 60);
    }
    return o;
  }
  function loadScript(src, attrs) {
    var s = document.createElement('script'); s.async = true; s.defer = true; s.src = src;
    for (var k in attrs || {}) s.setAttribute(k, attrs[k]);
    s.onerror = function () { if (debug) console.warn('[EBAT analytics] não foi possível carregar', src); };
    document.head.appendChild(s);
  }
  /* GoatCounter não tem propriedades: o evento vira um caminho legível, ex.: game_end/corrida-neon/normal */
  var PATH_KEYS = ['game', 'tool', 'tab', 'level', 'origem', 'tipo', 'forma', 'efeito', 'modo', 'screen', 'bucket', 'recorde', 'destino'];
  function suffix(p) { var a = []; PATH_KEYS.forEach(function (k) { if (p[k] != null && p[k] !== '') a.push(String(p[k]).replace(/[\/\s]+/g, '-')); }); return a.length ? '/' + a.join('/') : ''; }

  var adapters = {
    debug: { init: function () {}, ready: function () { return true }, event: function () {}, page: function () {} },
    goatcounter: {
      init: function () {
        var g = C.goatcounter || {}, ep = g.endpoint || (g.code ? 'https://' + g.code + '.goatcounter.com/count' : '');
        if (!ep) { if (debug) console.warn('[EBAT analytics] goatcounter: informe "code" no analytics-config.js'); off = true; return; }
        window.goatcounter = { endpoint: ep, no_onload: true };
        loadScript(g.src || 'https://gc.zgo.at/count.js');
      },
      ready: function () { return !!(window.goatcounter && window.goatcounter.count); },
      event: function (n, p) { window.goatcounter.count({ path: 'ev/' + n + suffix(p), title: n, event: true }); },
      page: function (path, title) { window.goatcounter.count({ path: path, title: title }); }
    },
    umami: {
      init: function () {
        var u = C.umami || {}; if (!u.websiteId) { if (debug) console.warn('[EBAT analytics] umami: informe "websiteId"'); off = true; return; }
        var at = { 'data-website-id': u.websiteId, 'data-auto-track': 'false' }; if (u.hostUrl) at['data-host-url'] = u.hostUrl;
        loadScript(u.src || 'https://cloud.umami.is/script.js', at);
      },
      ready: function () { return !!(window.umami && window.umami.track); },
      event: function (n, p) { window.umami.track(n, p); },
      page: function (path, title) { window.umami.track(function (props) { var o = {}; for (var k in props) o[k] = props[k]; o.url = path + (location.search || ''); o.title = title; return o; }); }
    },
    plausible: {
      init: function () {
        var s = C.plausible || {}; if (!s.domain) { if (debug) console.warn('[EBAT analytics] plausible: informe "domain"'); off = true; return; }
        window.plausible = window.plausible || function () { (window.plausible.q = window.plausible.q || []).push(arguments); };
        loadScript(s.src || 'https://plausible.io/js/script.manual.js', { 'data-domain': s.domain });
      },
      ready: function () { return typeof window.plausible === 'function'; },
      event: function (n, p) { window.plausible(n, { props: p }); },
      page: function (path) { window.plausible('pageview', { u: location.origin + path + (location.search || '') }); }
    },
    ga4: {
      init: function () {
        var g = C.ga4 || {}; if (!g.measurementId) { if (debug) console.warn('[EBAT analytics] ga4: informe "measurementId"'); off = true; return; }
        window.dataLayer = window.dataLayer || [];
        window.gtag = function () { window.dataLayer.push(arguments); };
        window.gtag('js', new Date());
        window.gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: g.analyticsStorage || 'granted' });
        window.gtag('config', g.measurementId, { send_page_view: false, anonymize_ip: true, allow_google_signals: false, allow_ad_personalization_signals: false });
        loadScript('https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(g.measurementId));
      },
      ready: function () { return typeof window.gtag === 'function'; },
      event: function (n, p) { window.gtag('event', n, p); },
      page: function (path, title) { window.gtag('event', 'page_view', { page_path: path, page_title: title, page_location: location.origin + path + (location.search || '') }); }
    }
  };
  var A = adapters[provider];
  if (!A) { if (provider !== 'none' && window.console) console.warn('[EBAT analytics] provider desconhecido:', provider); off = true; }
  var started = false;
  function start() {
    if (started || off) return;
    started = true;
    try { A.init(); } catch (e) { off = true; }
  }
  if (!off && !waiting) start();

  function flush() {
    if (off || waiting || !queue.length) return;
    if (!A.ready()) return;
    var q = queue; queue = [];
    q.forEach(function (it) { try { if (it.t === 'e') A.event(it.n, it.p); else A.page(it.n, it.p); } catch (e) {} });
  }
  var pollN = 0, poll = null;
  function kick() {
    pollN = 0; if (poll) clearInterval(poll);
    poll = setInterval(function () { flush(); if (++pollN > 100 || (!queue.length && pollN > 5)) { clearInterval(poll); poll = null; } }, 200);
  }
  kick();
  function push(it) {
    if (debug) { log.push(it.t === 'e' ? { evento: it.n, props: it.p } : { tela: it.n, titulo: it.p }); try { console.log('[EBAT analytics]', it.t === 'e' ? it.n : 'tela ' + it.n, it.t === 'e' ? it.p : ''); } catch (e) {} }
    if (off) return;
    if (waiting && queue.length >= 80) return;     /* guarda poucos eventos enquanto a pessoa decide */
    queue.push(it); flush();
  }

  /* ---------- aviso de cookies: aparência e ações ---------- */
  var bannerEl = null;
  function closeBanner() { if (bannerEl && bannerEl.parentNode) bannerEl.parentNode.removeChild(bannerEl); bannerEl = null; }
  function decide(v) {
    setConsent(v); consent = v; closeBanner();
    if (v === 'granted') {
      off = !A || provider === 'none' || optOut || dnt || (isLocal && !C.trackLocalhost && !debug);
      waiting = false; start(); kick(); flush();
    } else {
      waiting = true; queue = []; off = true;
      try { clearGaCookies(); } catch (e) {}
      try { if (C.ga4 && C.ga4.measurementId) window['ga-disable-' + C.ga4.measurementId] = true; } catch (e) {}
      try { if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' }); } catch (e) {}
    }
  }
  function openBanner() {
    if (bannerEl || !document.body) return;
    var st = document.createElement('style');
    st.textContent =
      '.ebck{position:fixed;left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));z-index:2147483000;max-width:540px;margin:0 auto;box-sizing:border-box;padding:12px 14px;background:#14102B;color:#E4DCF7;border:2px solid #35C3FF;border-radius:12px;box-shadow:0 6px 28px rgba(0,0,0,.55);font:13px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif}' +
      '.ebck b{display:block;color:#fff;font-size:14px;margin-bottom:3px}' +
      '.ebck p{margin:0 0 10px}.ebck a{color:#35C3FF}' +
      '.ebck .r{display:flex;gap:8px}' +
      '.ebck button{flex:1;min-height:42px;border-radius:9px;border:2px solid #F82CED;font:700 14px system-ui,-apple-system,"Segoe UI",sans-serif;cursor:pointer}' +
      '.ebck .y{background:#F82CED;color:#12081F}.ebck .n{background:transparent;color:#F4E9FF}' +
      '.ebck button:focus-visible{outline:3px solid #35C3FF;outline-offset:2px}';
    var box = document.createElement('div');
    box.className = 'ebck'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Aviso de cookies');
    box.innerHTML =
      '<b>Cookies e estatísticas</b>' +
      '<p>Usamos cookies do Google Analytics só para entender, de forma anônima, como o Fliperama é usado (acessos, jogos e tempo de uso). Não há anúncios. Você pode aceitar ou recusar e joga do mesmo jeito. <a href="privacidade.html">Saiba mais</a></p>' +
      '<div class="r"><button type="button" class="n">Recusar</button><button type="button" class="y">Aceitar</button></div>';
    box.appendChild(st);
    box.querySelector('.y').addEventListener('click', function () { decide('granted'); });
    box.querySelector('.n').addEventListener('click', function () { decide('denied'); });
    document.body.appendChild(box); bannerEl = box;
  }
  if (needConsent && !off && consent === null) {
    if (document.body) openBanner(); else document.addEventListener('DOMContentLoaded', openBanner);
  }
  window.EBATCookies = {
    status: function () { return getConsent(); },
    open: function () { if (needConsent) openBanner(); },
    set: function (v) { if (v === 'granted' || v === 'denied') decide(v); }
  };

  /* ---------- eventos ---------- */
  function track(name, props) { push({ t: 'e', n: String(name).slice(0, 40), p: clean(props) }); }

  /* ---------- telas (navegação) e tempo em cada tela ---------- */
  function bucket(s) { return s < 10 ? '0-10s' : s < 30 ? '10-30s' : s < 60 ? '30-60s' : s < 180 ? '1-3min' : s < 600 ? '3-10min' : '10min+'; }
  var curScreen = null, acc = 0, mark = document.hidden ? null : Date.now();
  function tick() { if (mark != null) { var n = Date.now(); acc += (n - mark) / 1000; mark = n; } }
  function flushTime() {
    tick();
    if (curScreen && acc >= 2) track('screen_time', { screen: curScreen, secs: Math.round(acc), bucket: bucket(acc) });
    acc = 0;
  }
  function screen(path, title) {
    if (path === curScreen) return;
    flushTime(); curScreen = path; acc = 0; if (!document.hidden) mark = Date.now();
    push({ t: 'p', n: path, p: title || '' });
  }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { flushTime(); mark = null; } else { mark = Date.now(); }
  });
  window.addEventListener('pagehide', function () { flushTime(); mark = null; });

  /* ---------- visita (uma vez por sessão): origem do QR e tipo de aparelho ---------- */
  function param(k) { var m = new RegExp('[?&]' + k + '=([^&#]*)').exec(qs); if (!m) return ''; try { return decodeURIComponent(m[1]).toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40); } catch (e) { return ''; } }
  (function () {
    var seen = false; try { seen = sessionStorage.getItem('ebat_visit') === '1'; sessionStorage.setItem('ebat_visit', '1'); } catch (e) {}
    if (seen) return;
    var origem = param('utm_campaign') || param('utm_source') || param('ref') || param('origem') || 'direto';
    var mobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    var inst = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) ? 1 : 0;
    track('visita', { origem: origem, aparelho: mobile ? 'celular' : 'computador', app_instalado: inst });
  })();

  /* ---------- cliques em links externos (redes sociais, site da EBAT): só o domínio ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || !a.hostname || a.hostname === host) return;
    if (a.protocol !== 'http:' && a.protocol !== 'https:') return;
    track('link_externo', { destino: a.hostname.replace(/^www\./, '') });
  }, true);

  window.EBATTrack = track;
  window.EBATScreen = screen;
})();
