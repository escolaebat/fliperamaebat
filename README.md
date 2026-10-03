# Fliperama EBAT

Jogos e atividades criativas da EBAT - Escola Brasileira de Arte e Tecnologia. É um site estático: não precisa de servidor, só do GitHub Pages.

## O que tem na pasta

| Arquivo | Para que serve |
|---|---|
| `index.html` | O Fliperama inteiro (jogos, laboratório, estilos e imagens). Não precisa mexer. |
| `analytics-config.js` | **O único arquivo que você edita**: escolhe a ferramenta de métricas. |
| `analytics.js` | Envia os eventos para a ferramenta escolhida. Não precisa mexer. |
| `privacidade.html` | Página de privacidade, ligada no rodapé do site. |
| `404.html`, `.nojekyll` | Página de erro e ajuste do GitHub Pages. |
| `favicon.svg`, `favicon.ico`, `favicon*.png` | Ícone da aba do navegador e do Google: a palavra EBAT (EB em cima, AT embaixo) com fundo transparente. |
| `apple-touch-icon.png`, `icon-*.png` | Ícones de tela inicial do celular, com fundo escuro (o iPhone não aceita fundo transparente). |
| `og-image.jpg` | Miniatura que aparece quando o link é compartilhado (WhatsApp, Instagram, Telegram, redes). |
| `robots.txt`, `sitemap.xml`, `llms.txt` | Ajudam o Google e as IAs (ChatGPT, Gemini, Claude...) a entender e indicar o site. |

## Publicar no GitHub Pages

1. No GitHub, crie um repositório **público** (ex.: `fliperama-ebat`).
2. Clique em **Add file > Upload files**, arraste **todo o conteúdo desta pasta** (o `index.html` precisa ficar na raiz, não dentro de outra pasta) e clique em **Commit changes**.
3. Vá em **Settings > Pages**. Em **Source**, escolha **Deploy from a branch**, branch **main**, pasta **/ (root)**, e salve.
4. Em 1 a 2 minutos o endereço aparece no topo da mesma tela: `https://SEU-USUARIO.github.io/fliperama-ebat/`.
5. Abra no celular e teste antes de imprimir qualquer coisa.

Endereço próprio (ex.: `jogos.ebat.com.br`): em **Settings > Pages > Custom domain**, siga as instruções do GitHub para criar o registro DNS. Vale a pena, porque o QR Code impresso continua funcionando mesmo se o endereço do GitHub mudar.

## Ligar as métricas

1. Escolha uma ferramenta e crie a conta/site nela:
   - **GoatCounter**: o mais simples, sem cookies, gratuito para projetos sem fins lucrativos (confira os termos).
   - **Umami** ou **Plausible**: sem cookies, com gráficos melhores. A Plausible é paga; a Umami tem versão na nuvem.
   - **Google Analytics 4**: o mais completo, mas usa cookies. Com ele o site mostra um **aviso de cookies** (Aceitar/Recusar) e só começa a medir depois do "Aceitar". A escolha fica salva no aparelho e pode ser mudada na página de Privacidade. Para ocultar o aviso, use `cookieBanner: false` em `analytics-config.js` (não recomendado com o GA4).
2. No GitHub, abra `analytics-config.js` (ícone de lápis), troque `provider: 'none'` pela ferramenta (`'goatcounter'`, `'umami'`, `'plausible'` ou `'ga4'`), preencha o código dela no bloco correspondente e faça o **Commit**.
3. Teste: abra o site com `?debug_analytics=1` no final do endereço e olhe o console do navegador (F12). Cada ação aparece como um evento.
4. Para a equipe não contar as próprias visitas, abra o site uma vez com `?notrack=1` em cada aparelho. Para voltar a medir, use `?notrack=0`.

Nada pessoal é enviado: nem o nome digitado, nem o nome das obras. Se o navegador estiver com "Não rastrear" ligado, nada é medido.

## O que é medido

**Telas** (aparecem como páginas visitadas, mostrando a navegação): `/jogos`, `/laboratorio`, `/sobre`, `/jogo/corre-criativo`, `/jogo/batalha-nave`, `/jogo/torre-criativa`, `/jogo/corrida-neon`, `/jogo/traco`, `/jogo/quebra-pixel`, `/laboratorio/oficina-de-vj`, `/laboratorio/binario-do-nome`, `/laboratorio/pixel-studio`, `/laboratorio/mixer-de-luz`.

**Eventos:**

| Evento | O que mostra | Detalhes enviados |
|---|---|---|
| `visita` | Uma por sessão | origem (valor de `utm_campaign`), celular ou computador |
| `screen_time` | **Permanência** em cada tela | tela, segundos, faixa de tempo |
| `game_open` / `game_start` | Jogos preferidos | jogo, nível |
| `game_end` | Resultado de cada partida | jogo, nível, pontos, segundos, se foi recorde |
| `game_quit` | Saiu no meio da partida | jogo, nível, segundos |
| `game_tutorial` | Abriu "Aprenda a jogar" | jogo |
| `lab_open` | Atividades preferidas | atividade |
| `lab_gravar`, `lab_salvar` | Gravou, salvou imagem ou vídeo | atividade, tipo |
| `lab_forma`, `lab_efeito`, `mixer_modo` | O que usam dentro das atividades | forma, efeito, modo |
| `carta_aberta`, `carta_salvar`, `carta_compartilhar` | Engajamento com as cartas | origem (jogo ou atividade), tipo |
| `link_externo` | Cliques em Instagram, TikTok, site da EBAT | só o domínio |

**Permanência total** = soma de `screen_time`. A GoatCounter não guarda os números de cada evento (segundos, pontos); ela mostra as contagens e as faixas de tempo (`0-10s`, `1-3min`...). Umami, Plausible e GA4 guardam os detalhes. No GA4, para ver os detalhes nos relatórios, cadastre-os em **Admin > Definições personalizadas**.

## Saber de onde veio cada acesso (QR Code)

Coloque estes parâmetros no endereço que vai dentro do QR (no Linktree, no link de destino):

```
https://SEU-ENDERECO/?utm_source=qr&utm_medium=impresso&utm_campaign=cartaz-nave-recife
```

Troque só o final de `utm_campaign` para cada material (`folder-familias`, `convite-evento`...). Letras minúsculas, sem espaços nem acentos. A origem aparece no evento `visita` e nos relatórios de origem da ferramenta escolhida. Se o QR apontar para um link do Linktree em vez de direto para o Fliperama, a origem só é medida se o Linktree repassar o parâmetro; o jeito mais seguro é o QR apontar direto para o endereço acima.

## Atualizar o site

Troque o `index.html` no repositório (**Add file > Upload files** com o mesmo nome) e faça o commit. O endereço continua o mesmo.

## Antes de divulgar

- **Miniatura do link**: depois de publicar, cole o endereço no [Depurador de Compartilhamento da Meta](https://developers.facebook.com/tools/debug/) e clique em "Buscar novamente" para limpar o cache. Se alguém já compartilhou o link antes da imagem existir, o WhatsApp e o Instagram podem guardar a versão antiga por alguns dias.
- **Google**: no [Search Console](https://search.google.com/search-console), adicione a propriedade de domínio `ebat.com.br` (cobre o subdomínio `fliperama`) e envie o `sitemap.xml`.
- No site principal (`ebat.com.br`), vale colocar um link para `fliperama.ebat.com.br` com texto como "Jogue o Fliperama EBAT": ajuda o Google a ligar os dois.

- Leia a `privacidade.html` e ajuste se a ferramenta escolhida coletar algo além do descrito. Como o público inclui estudantes, vale uma conferência com quem cuida da LGPD na EBAT.
- Salvar e compartilhar cartas usa a folha de compartilhamento do celular. Teste em um Android e um iPhone.
