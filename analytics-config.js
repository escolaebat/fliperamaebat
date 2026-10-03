/*
 * Configuração das métricas do Fliperama EBAT.
 * desenvolvido por CamilaLeite (Humana Camila) para EBAT - Escola Brasileira de Arte e Tecnologia
 *
 * COMO USAR: troque "provider" pela ferramenta escolhida e preencha só o bloco dela.
 * Enquanto estiver "none", nada é enviado (o site funciona normalmente).
 *
 *   "none"         não mede nada
 *   "goatcounter"  gratuito para projetos sem fins lucrativos, sem cookies, o mais simples
 *   "umami"        sem cookies; versão na nuvem ou instalada por vocês
 *   "plausible"    sem cookies; pago (ou instalado por vocês)
 *   "ga4"          Google Analytics 4; mais completo, usa cookies
 *   "debug"        só mostra os eventos no console do navegador, para testar
 *
 * Para testar sem configurar nada: abra o site com ?debug_analytics=1 no final do endereço
 * e veja os eventos no console do navegador (ferramentas do desenvolvedor).
 */
window.EBAT_ANALYTICS = {
  provider: 'ga4',

  /* o navegador pode pedir "não rastrear"; por padrão respeitamos */
  respectDoNotTrack: true,
  /* medir também quando o site é aberto no próprio computador (arquivo local ou localhost) */
  trackLocalhost: false,
  /* aviso de cookies: 'auto' = aparece só para ferramentas que usam cookies (ga4); true = sempre; false = nunca.
     Com ga4 a medição só começa depois que a pessoa clica em "Aceitar". */
  cookieBanner: 'auto',

  goatcounter: { code: '' },            // ex.: 'ebat' -> https://ebat.goatcounter.com
  umami:       { websiteId: '', src: 'https://cloud.umami.is/script.js' },
  plausible:   { domain: '' },          // ex.: 'jogos.ebat.com.br'
  ga4:         { measurementId: 'G-4WN6CNXEFK' }    // ex.: 'G-XXXXXXXXXX'
};
