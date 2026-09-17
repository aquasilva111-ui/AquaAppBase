# AQUA — guia de fork do Bluesky `social-app`

Fonte: [bluesky-social/social-app](https://github.com/bluesky-social/social-app) (MIT no código; **não** MIT em marca, ícones e ilustrações).

Isto não é um redesign em cima de maquete. AQUA no dia 1 é um **cliente** do AT Protocol: login com conta Bluesky, feed/post/chat reais. PDS próprio é fase 2. Books / Wiki / Marketplace **não** entram na tab bar.

Mantra: *Aqua stores relationships, not possessions.*  
Regra de agente: **não recrie o app. não refactor. não mocks no lugar do que já funciona. uma tarefa só.**

---

## 0. O que este guia não é

A prévia de cápsulas de vidro noutro workspace é estudo visual. **Não** é o produto. Não portes o feed em glass card. Feed denso como o Bluesky; acento oceano no **shell**.

---

## 1. Subir o app real (só então pintar)

Requisitos atuais do repo (main): **Node >= 24.19.0**, **pnpm 11.23.0**, Expo ~57.

```bash
git clone --depth 1 https://github.com/bluesky-social/social-app.git aqua-app
cd aqua-app
git remote rename origin upstream
git remote add origin git@github.com:<TUAorg>/aqua-app.git   # quando existir

pnpm install
cp .env.example .env
pnpm web
```

Se o browser abrir o Bluesky local, o fork está vivo. Só então mudas nome, ícones, paleta.

Manter o upstream:

```bash
git fetch upstream
git merge upstream/main
```

Lê **antes de qualquer PR de assets:**

- `README.md` — secção Forking guidelines
- `ASSETS.md` — o que **não** é MIT
- `NOTICE.md` — atribuições que tens de manter
- `docs/build.md` — web / iOS / Android
- `LICENSE`

---

## 2. Obrigatório (eles exigem — não é estética)

### 2.1 Identidade nativa — `app.config.js`

Hoje o ficheiro diz:

| Campo | Valor Bluesky | AQUA (proposta) |
|---|---|---|
| `name` | `Bluesky` | `AQUA` |
| `slug` | `bluesky` | `aqua` |
| `scheme` | `bluesky` | `aqua` |
| `ios.bundleIdentifier` | `xyz.blueskyweb.app` | o teu, ex. `app.aqua.ios` |
| `android.package` | `xyz.blueskyweb.app` | o teu, ex. `app.aqua.android` |
| `updates.url` | `https://updates.bsky.app/manifest` | o teu EAS ou remove |
| `extra.eas.projectId` | projeto EAS deles | o teu, ou tira EAS até teres conta |
| App extensions | `xyz.blueskyweb.app.Share-with-Bluesky`, `…BlueskyNSE`, `…AppClip` | ids teus, ou desactiva as extensions no 1º PR |
| Splash background | `#006AFF` / `#002861` | canvas branco / deep tide `#0C3D5C` |

Ícones e splash apontados no config (todos marca Bluesky — **substituir**):

- `assets/app-icons/ios_icon_default_next.png`
- `assets/app-icons/ios_icon_default.icon`
- `assets/app-icons/ios_icon_testflight.icon`
- `assets/app-icons/android_icon_default_next.png`
- `assets/splash/splash.png`
- `assets/splash/splash-dark.png`
- `assets/splash/android-splash-logo-white.png`

`package.json` → `"name": "bsky.app"` → `"aqua-app"` (ou similar). Não é o bundle id.

### 2.2 Licença — o que **não** podes reenviar

Do `ASSETS.md`. MIT cobre o TypeScript. **Não cobre:**

**Ilustrações (encomenda exclusiva Bluesky)** — substituir ou apagar:

- `assets/illustrations/` (landing: `illustration-mobile.png`, `illustration-mobile-dark.png`)

**Glyph set de terceiros** — **não uses** `assets/icons/` no AQUA. Fonte os teus (Lucide, Phosphor, ou set próprio). O código em `src/components/icons/*.tsx` é MIT, mas vários apontam para esse glyph set / marcas.

**Marca Bluesky** — substituir:

- `assets/app-icons/`
- `assets/favicon.png`, `assets/logo.png`, `assets/default-avatar.png`
- `assets/icon-android-*.png`
- `assets/splash/*`
- `assets/icons/logomark.svg`, `newskie.svg`, `verifiedCheck.svg`, `verifierCheck.svg`, `starterPack.svg`, `starterPack_stroke2_corner0_rounded.svg`
- `src/view/icons/Logo.tsx`, `Logomark.tsx`, `LogomarkWithType.tsx`, `Logotype.tsx` (paths SVG inline)
- `src/components/icons/Logo.tsx`, `Newskie.tsx`, `VerifiedCheck.tsx`, `VerifierCheck.tsx`, `StarterPack.tsx`
- `bskyweb/static/favicon*.png`, `apple-touch-icon.png`, `social-card-default*.png`
- `bskyembed/assets/logo.svg`, `logo_full_name.svg`
- `modules/BlueskyClip/Images.xcassets/AppIcon.appiconset/`

**Podes manter (com NOTICE):**

- `assets/fonts/inter/` — Inter, OFL 1.1
- `assets/icons/flags/` — MIT (`LICENSE` na pasta)

**Trata como não redistribuível:** `assets/images/`, `assets/kawaii.png`, `assets/kawaii_smol.png`, logos Apple/Android e community marks.

### 2.3 Telemetria deles — tira no PR de config

Senão os crashes do AQUA caem no Sentry/bitdrift do Bluesky.

| O quê | Onde |
|---|---|
| Plugin Sentry (só entra se `SENTRY_AUTH_TOKEN` existir) | `app.config.js` → `@sentry/react-native/expo` |
| Plugin bitdrift | `app.config.js` → `@bitdrift/react-native` |
| DSN / key | `.env.example` → `EXPO_PUBLIC_SENTRY_DSN`, `EXPO_PUBLIC_BITDRIFT_API_KEY` |
| Setup Sentry | `src/logger/sentry/setup/index.ts` |
| Transport Sentry | `src/logger/transports/sentry.ts` |
| Growthbook / metrics | `.env.example` → `EXPO_PUBLIC_GROWTHBOOK_*`, `EXPO_PUBLIC_METRICS_API_HOST` |

No dia 1: deixa as keys **vazias** e não copies tokens do Bluesky. Não implementes Sentry “para parecer produção”. Logger de consola (`src/logger/transports/console.ts`) chega.

### 2.4 Links de suporte — `src/lib/constants.ts`

Troca para os teus (mesmo que temporários). Hoje:

- `HELP_DESK_URL` → `https://blueskyweb.zendesk.com/hc/…`
- `webLinks.tos` → `https://bsky.social/about/support/tos`
- `webLinks.privacy` → `…/privacy-policy`
- `webLinks.community` → `…/community-guidelines`
- `STATUS_PAGE_URL` → `https://status.bsky.app/`
- `BSKY_DOWNLOAD_URL` → `https://bsky.app/download`
- `EMBED_SERVICE` → `https://embed.bsky.app`

Serviços de **rede** no dia 1 **ficam** (AQUA é cliente):

- `BSKY_SERVICE` = `https://bsky.social`
- `PUBLIC_APPVIEW` = `https://api.bsky.app`
- `PUBLIC_BSKY_SERVICE` = `https://public.api.bsky.app`
- `CHAT_SERVICE` = `https://api.bsky.chat`
- `VIDEO_SERVICE` = `https://video.bsky.app`

Não apontes isto para um servidor inventado. PDS próprio = fase 2.

---

## 3. Onde se muda a cara (ficheiros certos)

### 3.1 Paleta — `src/alf/`

ALF = Application Layout Framework (tipo Tailwind com `_`).

| Ficheiro | Função |
|---|---|
| `src/alf/themes.ts` | light / dark / dim via `createThemes` de `@bsky.app/alf` |
| `src/alf/tokens.ts` | gradientes `primary` (`#054CFF` → `#1085FE` → `#59B9FF`) — **aqui o oceano** |
| `src/alf/atoms.ts` | espaçamento, layout |
| `src/alf/fonts.ts` | type |
| `src/alf/index.tsx` | `useTheme()`, `atoms` |
| `src/alf/README.md` | contrato |

AQUA:

- canvas claro, **não** página azul
- acento `#1A7AB3` (ocean), deep `#0C3D5C`
- **não** glass em cada post
- splash / scheme / botões primários / focus ring — sim

Pacote `@bsky.app/alf` (tokens compilados): se o primary viver lá, ou forkas o pacote ou sobrescreves em `themes.ts`. Não espalhes hex no JSX.

### 3.2 Chrome — `src/view/shell/`

| Ficheiro | Função |
|---|---|
| `index.tsx` | shell nativo: Drawer + Composer |
| `index.web.tsx` | shell web |
| `Drawer.tsx` | drawer de **conta** (perfil, settings) — não é o App Drawer AQUA |
| `Composer.tsx` / `Composer.web.tsx` / `Composer.ios.tsx` | composer global |
| `bottom-bar/BottomBar.tsx` | tabs nativas |
| `bottom-bar/BottomBarWeb.tsx` | tabs web |
| `bottom-bar/BottomBarStyles.tsx` | estilos |
| `desktop/LeftNav.tsx` | nav desktop (Home, Explore, Notifications, Chat, Profile, Feeds, Settings + compose) |
| `desktop/RightNav.tsx` | rail direito |
| `desktop/Feeds.tsx`, `Search.tsx`, `SidebarTrendingTopics.tsx` | desktop extras |

Tabs **hoje** no Bluesky: Home · Search · Notifications · Messages · Profile.  
Compose **não** está na tab bar; está no `Composer` + botão na `LeftNav`.

Tabs **AQUA**: Home · Search · **+** · Chat · Profile.

Notifications saem da tab e ficam no sino do header (`HomeHeader*.tsx`). Não apagues o ecrã `src/screens/Notifications`.

### 3.3 Textos — Lingui

| Ficheiro | Função |
|---|---|
| `src/locale/i18n.ts`, `i18n.web.ts`, `i18nProvider.tsx` | runtime |
| `src/locale/languages.ts` | lista de línguas |
| `src/locale/locales/en/messages.po` | fonte (e o resto das pastas) |
| `lingui.config.js` (raiz) | extração |
| `package.json` → `pnpm intl` / `intl:build` | regenerar |

Não edites `.po` à mão como primeiro reflexo. Muda o `msgid` no TSX (`<Trans>Bluesky</Trans>` / `_(msg\`…\`)`) e corre `pnpm intl:build`.

A UI tem de dizer **AQUA**, não Bluesky — splash, login, settings, search placeholder, partilha. Exemplos reais:

- `src/view/com/auth/SplashScreen.tsx` + `SplashScreen.web.tsx`
- `src/screens/Login/LoginForm.tsx` (“Hosting provider: Bluesky”, “New to Bluesky?”)
- `src/screens/Search/Shell.tsx` (“Find posts, users, and feeds on Bluesky”)
- `src/components/dialogs/Signin.tsx`

**Não** reescrevas copy de moderação/TOS do Bluesky AppView enquanto fores cliente da rede deles. Distingue produto (AQUA) de rede (Atmosphere / Bluesky Social como host).

### 3.4 Sessão / rede — não tocar no dia 1

| Pasta | Função |
|---|---|
| `src/state/session/` | login, refresh, agentes |
| `src/screens/Login/`, `src/screens/Signup/` | fluxos |
| `src/screens/Home/`, `src/view/com/home/` | feed |
| `src/screens/PostThread/` | thread |
| `src/screens/Messages/` | chat |
| `src/screens/Search/` | search + explore |
| `src/Navigation.tsx` | grafo de rotas |

Login com conta Bluesky. Default host `bsky.social`. Não mocks. Não substituas o feed por Zustand.

---

## 4. Rede no dia 1 vs fase 2

```
Fase 1 — AQUA cliente
  identidade  → conta Bluesky (handle .bsky.social ou próprio já federado)
  AppView     → api.bsky.app
  chat        → api.bsky.chat
  vídeo       → video.bsky.app

Fase 2 — PDS AQUA (opcional)
  o utilizador pode apontar o host no ServerInput já existente
  src/components/dialogs/ServerInput.tsx
  não inventes um segundo login
```

`.env` no dia 1: copia `.env.example`, **não** preenchas Sentry/bitdrift/Growthbook com keys deles. `EXPO_PUBLIC_ENV=development` chega para `pnpm web`.

---

## 5. Módulos do Documento Mestre

Não entram na tab bar. Tab bar = **Home · Search · + · Chat · Profile**.

O drawer de conta (`Drawer.tsx`) já existe. O **AQUA App Drawer** (Books, Wiki, Marketplace, Studio…) é **outro** sítio: pastas novas, atalho no chrome (ícone grelha na `LeftNav` / header), **não** 40 ícones permanentes.

```
src/aqua/
  drawer/
    AquaAppDrawer.tsx          # launcher, pin de módulos
    modules.ts                 # catálogo: ready | direction
  books/                       # placeholder honesto até haver backend
  wiki/
  marketplace/
  studio/
  README.md                    # o que é hipótese vs o que está ligado ao AT Proto
```

Cada módulo `direction` diz o que falta (PDS, commerce provider, etc.). Não fingir Shopify, não fingir Wattpad, não fingir certificação científica.

Rotas: acrescenta em `src/Navigation.tsx` **sem** as meter no `BottomBar`. Um PR por módulo.

Ordem de maturidade (Documento Mestre §72): Foundation (este fork) → Social (já vem do Bluesky) → Publishing (Books) → Commerce → Creator → Intelligence → Distributed.

---

## 6. Um PR de cada vez

| # | PR | Ficheiros | Definição de pronto |
|---|---|---|---|
| 1 | **config** | `app.config.js`, `package.json` name, `.env.example` (keys vazias), desligar plugins Sentry/bitdrift | App abre, já não se chama Bluesky no springboard; sem telemetria deles |
| 2 | **assets** | ícones, splash, favicon, `src/view/icons/*`, **não** copies `assets/icons/` nem `assets/illustrations/` | `ASSETS.md` cumprido; landing sem ilustração encomendada |
| 3 | **strings** | splash, login, search, settings; `pnpm intl:build` | UI diz AQUA; TOS/privacy apontam para os teus URLs ou “ainda não” |
| 4 | **paleta** | `src/alf/tokens.ts`, `themes.ts`, splash hex, scheme | canvas claro + oceano no chrome; **feed inalterado** |
| 5 | **tab + drawer** | `BottomBar.tsx`, `BottomBarWeb.tsx`, `LeftNav.tsx`, `src/aqua/drawer/` | tabs = Home Search + Chat Profile; Notifications no header; App Drawer com placeholders |
| 6 | **Books** | `src/aqua/books/`, rota nova | ecrã honesto (estrutura BOOK→CHAPTER→BLOCK) **sem** fingir persistência AT Proto até haver lexicons |

Depois: Wiki, Marketplace (origem no produto, carrinho multilojas **sem** checkout único inventado).

---

## 7. Mapa rápido (não abras o repo inteiro)

```
app.config.js                         # nome, scheme, bundle, plugins
package.json                          # name, scripts (web = expo start --web)
.env.example                          # Sentry/bitdrift/Growthbook
ASSETS.md  NOTICE.md  README.md

src/alf/                              # cara
src/view/shell/                       # chrome
src/view/icons/                       # wordmark (marca — substitui)
src/view/com/auth/SplashScreen*.tsx
src/view/com/home/HomeHeader*.tsx
src/locale/                           # Lingui
src/lib/constants.ts                  # URLs
src/logger/sentry/  transports/sentry.ts
src/Navigation.tsx                    # rotas
src/state/session/                    # NÃO no dia 1
src/screens/{Home,Search,Messages,Login,Profile,PostThread}

src/aqua/                             # SÓ AQUA — criar, não misturar no feed
```

---

## 7b. Books — motor OSS, grafo AQUA

Livros **não** são “depois, se sobrar”. São o módulo que o Bluesky não tem. Tab bar **não** ganha ícone de livro.

Não clonar Wattpad. Não engolir Readest / Kavita / Stump (produtos; Readest é AGPL).

| Camada | OSS | Porquê |
|---|---|---|
| Motor de leitura | foliate-js ou epub.js / react-reader | EPUB, progresso, TOC, highlight |
| App leitor inteiro | Readest, Kavita, Stump | Não. São produtos |
| “Wattpad OSS” | Xplore, FICTBASE | Stack errada |
| Prateleira social | BookWyrm | Inspiração de relações, não o reader |

Dois modos, um perfil:

1. **Nativo AQUA** — source of truth = blocos. `BOOK → CHAPTER → BLOCK`. Comentário no bloco, resume no bloco.
2. **Importado EPUB/PDF** — source of truth = o ficheiro no Media Storage. O motor devolve CFI. AQUA guarda `user ↔ book_id ↔ location ↔ updated_at`. Não duplicar o binário.

No fork:

```
src/aqua/books/
  library.tsx    /books  /books/library
  book.tsx       /book/:id
  reader.tsx     /read/:bookId/:chapterId
  writer/        studio — outro PR
```

Ordem: tronco social → reader com epub.js + um EPUB → modelo nativo de blocos → `/feed/books` ranqueia por resume, não por like.

Frase: *Puxamos o motor open source. O AQUA fica com quem leu o quê até onde, comentário no bloco, e o livro no perfil.*

---

## 8. Prompt para colar no Cursor / Qwen / Codex

```
Estás no fork AQUA do bluesky-social/social-app.

Não recrie o app. Não faças refactor. Não substituas feed, sessão, composer ou chat por mocks. Não copies assets/icons/ nem assets/illustrations/ (não são MIT). Lê ASSETS.md e README (Forking guidelines) antes de tocar em imagem.

AQUA no dia 1 é um cliente Bluesky/AT Protocol. PDS próprio é fase 2. Tab bar: Home · Search · + · Chat · Profile. Books/Wiki/Marketplace só em src/aqua/ e no App Drawer, placeholders honestos até haver backend.

Visual: canvas branco, acento oceano no shell. Feed continua denso — sem glass em cada post.

Uma tarefa só. O PR actual é: <COLA AQUI: config | assets | strings | paleta | drawer | Books>.
Não alargues o diff. Se precisares de um ficheiro fora do âmbito, pára e pergunta.
```

---

## 9. Quando o repo estiver no GitHub

Publica o fork (sem assets Bluesky no primeiro push se fores redistribuir). Manda o URL. A partir daí o trabalho é **patch no código real**, não maquete.

Checklist do push:

- [ ] `upstream` aponta para `bluesky-social/social-app`
- [ ] `origin` é o teu GitHub
- [ ] `app.config.js` já não usa `xyz.blueskyweb.app` nem `updates.bsky.app`
- [ ] nenhum ficheiro de `ASSETS.md` “do not redistribute” no histórico público, **ou** o repo é privado até o PR de assets
- [ ] `.env` não está committed
- [ ] `pnpm web` mostra login AQUA contra `bsky.social`
