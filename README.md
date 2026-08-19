# Treino — Massa & Definição (PWA)

App pessoal de treino: plano A/B/C, registro de séries com cronômetro de descanso,
progresso (cargas + volume por grupo muscular + recordes), medidas corporais e fotos
de evolução. Migrado do protótipo em artifact do claude.ai pra um PWA instalável de
verdade — mesma UI, mesma lógica, mesmas cores, agora rodando offline, com dados
persistidos no aparelho e notificação real de cronômetro.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173/treino/` (o `base` do Vite já está configurado pra
`/treino/`, igual à URL de produção — ver "Deploy" abaixo).

```bash
npm run build     # gera dist/
npm run preview   # serve o build de produção localmente
```

## O que mudou em relação ao protótipo

| Área | Protótipo (artifact) | Agora |
|---|---|---|
| Persistência | `window.storage` (API do ambiente Claude) | IndexedDB real, via [`idb`](https://github.com/jakearchibald/idb) — funciona em qualquer navegador, offline, sem conta |
| Fotos | data URL em base64 | `Blob` num object store separado do IndexedDB (mais leve, sem overhead de base64) |
| Instalação | não instalável | `manifest.webmanifest` com ícones e `display: standalone` — abre em tela cheia, sem barra do Safari |
| Offline | não funciona | Service Worker (Workbox, estratégia `injectManifest`) cacheia o app shell |
| Cronômetro | só toca com a tela ligada/app aberto | Web Notification API + Service Worker; opcionalmente Web Push real (ver abaixo) |

A lógica de negócio (plano de treino, detecção de PR, cálculo de streak, volume por
grupo muscular etc.) é a mesma do protótipo — só foi reorganizada em módulos
(`src/lib`, `src/screens`, `src/components`) em vez de um arquivo único.

Um bug pré-existente do protótipo foi corrigido no caminho: sets vazios mostravam o
texto literal `NaN` ao lado do checkbox (`{isPR && <Trophy/>}` com `isPR = NaN` quando
o peso está vazio — no React, `NaN` é renderizado como texto, diferente de `false`).

## Notificação do cronômetro de descanso — o que é garantido e o que não é

Isso é o motivo central da migração, então vale ser direto sobre os limites reais.

1. **App aberto, tela ligada:** sempre funciona — beep + vibração tocam direto na
   página, como no protótipo.
2. **App em segundo plano ou tela apagada, mas ainda "vivo" (uso normal do dia a
   dia):** o Service Worker recebe um pedido da página (`postMessage`) pra chamar
   `showNotification()` depois de N segundos. Funciona na maioria dos casos reais,
   mas **não é garantido** — o iOS pode suspender o Service Worker antes da hora se
   decidir que o app está ocioso. Isso está implementado e ativo por padrão, sem
   nenhuma configuração extra.
3. **Tela bloqueada por vários minutos / app removido da memória:** só é confiável
   com **Web Push de verdade** — um servidor manda o push exatamente na hora certa, e
   é o sistema operacional (não o navegador) que acorda o Service Worker pra
   entregar. É pra isso que a Apple adicionou suporte a Web Push em PWAs instaladas
   no iOS 16.4+. Isso **não dá pra fazer só com arquivos estáticos** (GitHub Pages,
   Vercel/Netlify no plano estático) — precisa de um backend pra guardar a
   subscription e agendar o envio na hora certa. O código pra isso já está pronto em
   [`/server`](./server) (funções serverless + Upstash QStash pra agendar o delay +
   `web-push` pra mandar o push), mas **precisa ser implantado separadamente** com
   suas próprias chaves — ver a seção abaixo. Sem isso configurado, o app cai
   automaticamente no caminho 2 (melhor esforço).

O app tenta os três caminhos sempre que uma série é marcada como concluída — não
precisa escolher um ou outro.

### Ativando o Web Push real (opcional, pra notificação confiável com tela bloqueada)

1. Gere as chaves VAPID: `npx web-push generate-vapid-keys`.
2. Crie uma conta grátis na [Upstash](https://upstash.com): um banco **Redis** (guarda
   as subscriptions) e um **QStash** (agenda o envio no horário certo).
3. Implante a pasta [`/server`](./server) como um projeto Vercel separado (é só
   funções serverless, `vercel deploy` dentro de `server/` resolve). Configure as
   variáveis de ambiente do projeto Vercel com base em [`server/.env.example`](./server/.env.example).
4. No build do `treino-app`, defina `VITE_PUSH_SERVER_URL` (a URL do projeto Vercel
   do passo 3) e `VITE_VAPID_PUBLIC_KEY` (a chave pública gerada no passo 1) — ver
   [`.env.example`](./.env.example). Sem essas duas variáveis, o app não tenta usar
   push real e segue só no melhor esforço.
5. Rebuild e reimplante o `treino-app`.

## Persistência de dados

**Decisão: IndexedDB local, sem backend.** Como o uso hoje é num único iPhone e o
perfil pede o mínimo de complexidade possível, não faz sentido introduzir Supabase (ou
qualquer backend) só pra guardar dados que já vivem bem no aparelho — principalmente
as fotos, que são dado sensível e o pedido explícito foi "nunca em bucket público".
IndexedDB tem uma cota de storage muito maior que a API antiga (tipicamente
centenas de MB a alguns GB, dependendo do espaço livre do aparelho), então fotos em
qualidade melhor cabem numa boa.

Se um dia trocar de aparelho ou limpar o Safari for uma preocupação real, o próximo
passo natural é sync com Supabase (tabelas pra sessions/measurements, Storage bucket
**privado** com RLS pra fotos, auth simples por e-mail). Não foi implementado porque
adicionaria login, sincronização de conflitos e mais uma peça de infra pra manter — só
vale o custo se a perda de dados por troca de aparelho virar um problema de verdade.
Dá pra pedir esse próximo passo quando fizer sentido.

## Deploy

O workflow [`../.github/workflows/deploy-treino.yml`](../.github/workflows/deploy-treino.yml)
publica automaticamente em **`https://99drew.github.io/treino/`** a cada push em
`main` que toque em `treino-app/**` (reaproveita o GitHub Pages que já serve o
portfólio na raiz do mesmo repositório, sem mexer no workflow existente — usa
`destination_dir: treino` + `keep_files: true` pra só tocar nessa subpasta do branch
`gh-pages`). HTTPS já vem de graça do GitHub Pages, que é obrigatório pra
Service Worker e Notification API funcionarem.

Isso cobre instalação, offline e a notificação de melhor esforço (caminhos 1 e 2
acima) sem precisar de conta em nenhum serviço além do GitHub. Pra notificação
confiável com tela bloqueada, ver "Ativando o Web Push real" acima — isso exige um
projeto à parte na Vercel (ou outro host com serverless functions), porque GitHub
Pages é só arquivos estáticos.

### Instalando no iPhone

1. Abrir `https://99drew.github.io/treino/` no Safari.
2. Compartilhar → **Adicionar à Tela de Início**.
3. Abrir pelo ícone da Tela de Início (não pelo Safari) — só assim conta como PWA
   instalada e o `display: standalone` entra em vigor (tela cheia, sem barra do
   Safari).
4. Na primeira vez que marcar uma série como concluída, o iOS vai perguntar se pode
   mandar notificações — precisa aceitar pra qualquer um dos caminhos de notificação
   funcionar.

## Estrutura do projeto

```
src/
  lib/            plano padrão, tema, helpers, IndexedDB, notificações, push opcional
  components/     peças de UI reutilizadas entre telas (StatCard, BottomNav, etc.)
  screens/        uma tela por arquivo (Home, Log, History, Progress, Body, Edit)
  sw.js           Service Worker customizado (cache offline + notificações)
scripts/          geração dos ícones do PWA (SVG → PNG via sharp)
server/           funções serverless opcionais pro Web Push real (deploy separado)
```

## Limitações conhecidas / o que não deu pra validar nesta sessão

- Não há acesso a um iPhone físico nem a contas Vercel/Netlify/Supabase neste
  ambiente — o app foi validado com build de produção, testes automatizados em
  Chromium headless (fluxo completo: iniciar treino, marcar série, cronômetro,
  persistência entre reloads, upload de foto, todas as telas) e revisão manual do
  código do Service Worker, mas o comportamento exato de notificação com tela
  bloqueada no Safari iOS **precisa ser confirmado num iPhone real** depois do
  deploy — é justamente o tipo de comportamento que varia entre versões do iOS e não
  dá pra simular fora do aparelho.
- Splash screen customizada (imagem de carregamento antes do app abrir) não foi
  implementada — o iOS gera uma a partir do ícone/cor de fundo automaticamente, mas
  uma splash desenhada à mão (por tamanho de tela) é um possível próximo passo.
- O servidor de Web Push (`/server`) está com o código completo mas **não implantado**
  — precisa das suas próprias chaves/contas, ver "Ativando o Web Push real" acima.
