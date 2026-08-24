# OmniFlow — Atendimento Omnichannel

Plataforma de atendimento unificado (WhatsApp, Instagram e Chat do Site) para
escritórios e empresas: inbox único, filas por departamento, bot de triagem e
painel de supervisão em tempo real.

```
npm install
npm run dev        # interface em http://localhost:5173 (dados mockados, já operável)
npm run server     # API + webhooks em http://localhost:3333 (requer PostgreSQL)
```

O front funciona **sem banco e sem back-end**: os dados são mockados e um
simulador injeta mensagens, novos contatos e movimentação de fila a cada 4,5s
(botão **AO VIVO** na barra lateral pausa/retoma).

---

## 0. Entrada no sistema

`src/pages/LoginPage.jsx` — e-mail + senha, com atalhos para entrar direto como
atendente ou como supervisora. Na demonstração qualquer e-mail da equipe funciona
com a senha `123456`. A sessão fica no navegador (`omniflow.session`) e o botão
**Sair do painel** está no menu do avatar, no rodapé da barra lateral.

> A senha do seed é um SHA-256 simples, adequado só para demonstração.
> Troque por bcrypt ou argon2 e emita um JWT antes de qualquer uso real.

## 1. Painel do atendente (inbox unificado)

| Recurso | Onde está |
|---|---|
| Lista de conversas Ativas / Pendentes / Finalizadas | `src/components/inbox/ConversationList.jsx` |
| Ícone do canal de origem (WhatsApp, Instagram, Site) | `src/components/common/ChannelIcon.jsx` |
| Chat em tempo real, anexos, emojis, respostas rápidas | `src/components/inbox/Composer.jsx` |
| Notas internas (invisíveis ao cliente, em amarelo) | `src/components/inbox/MessageBubble.jsx` |
| Painel do contato, departamento e histórico | `src/components/inbox/ContactPanel.jsx` |

Enter envia, Shift+Enter quebra linha. Recibos de entrega (✓ / ✓✓) evoluem
sozinhos após o envio.

## 1b. Tour guiado e conexão de canais

- **Tour guiado** (`src/components/tour/`): abre sozinho no primeiro acesso e volta
  pelo botão **TOUR** na barra lateral. São 11 paradas que destacam o elemento real
  da tela, trocam de usuário e de aba sozinhas e pausam a simulação enquanto rodam.
  Setas ← → navegam, Esc encerra.
- **Assistente de conexão** (`src/components/team/ChannelSetupDialog.jsx`): em
  *Equipe → Conectar um canal*. Traz os pré-requisitos e o passo a passo de cada
  provedor, com as URLs de webhook já montadas a partir do domínio que a empresa
  informar. O conteúdo dos guias fica em `src/components/team/channelSetup.js`.

### Conexão pelas APIs oficiais

O cliente conecta as contas sem sair do painel — não precisa abrir o console de
desenvolvedor da Meta nem colar token à mão:

| Canal | Como conecta | Rota |
|---|---|---|
| WhatsApp Cloud | Embedded Signup: janela da Meta → `code` → token permanente da WABA | `POST /api/connect/whatsapp` |
| Instagram | Facebook Login for Business → escolhe o perfil → assina o webhook da Página | `GET /api/connect/instagram/start` e `/callback` |
| WhatsApp (Evolution) | QR Code renderizado dentro do painel | `POST /api/connect/evolution` |
| Chat do site | Trecho `<script>` para colar no site | — |

Implementação em `server/lib/meta.js` e `server/routes/connect.js`.
`GET /api/connect/status` diz se o servidor tem app da Meta configurado; sem isso
o painel entra em **modo demonstração** e apenas ilustra a sequência.

> **Dois pré-requisitos de negócio, não de código:** o app da Meta precisa estar
> como *Tech Provider*, com verificação de negócio concluída e as permissões
> `whatsapp_business_management`, `whatsapp_business_messaging` e
> `instagram_manage_messages` aprovadas em App Review. Até lá, só o caminho manual
> e a Evolution funcionam.

> O trecho `<script src=".../widget.js">` mostrado no guia do chat do site é o
> contrato pretendido — o arquivo `widget.js` ainda não existe neste repositório.

## 2. Departamentos, filas e bot de triagem

- Setores: **Comercial, Suporte, Financeiro e Jurídico**, cada um com SLA próprio
  e distribuição automática ou manual (`src/data/seed.js`).
- Transferência entre setores/atendentes com motivo registrado na timeline:
  `src/components/inbox/TransferDialog.jsx`.
- Bot de triagem (`src/lib/bot.js`): saúda, apresenta o menu numérico, aceita
  palavras-chave como fallback e entrega o ticket na fila do setor correto.
  Estados do ticket: `BOT → WAITING → OPEN → RESOLVED`.
- **Quem configura o bot:** o supervisor ou administrador, em
  *Equipe → Menu de triagem → Editar* (`src/components/team/BotEditor.jsx`).
  Dá para mudar saudação, opções, tecla, setor de destino, ordem, quantas
  tentativas antes de desistir e para onde vai quem erra — com prévia ao lado
  mostrando exatamente o que o cliente lê. O bot é dirigido por configuração
  (`state.botConfig`), não por código; no banco isso é o model `BotMenuOption`.

## 3. Painel de supervisão (modo gestor)

Troque de usuário pelo avatar no rodapé da barra lateral e entre como
**Marina Duarte (Supervisora)** para liberar as abas *Gestor* e *Equipe*.

- KPIs: tempo médio de espera, em atendimento, fila, SLA, TMA e CSAT.
- Volume por canal, filas por departamento (com alerta de SLA estourado) e
  conversas ativas por atendente com carga de trabalho.
- **Modo espião** (`SpyDrawer.jsx`): acompanha qualquer conversa ao vivo sem
  aparecer para o cliente, permite orientar por nota interna, redirecionar o
  chamado ou intervir assumindo o atendimento.
- Filtros por atendente, canal, departamento, situação e busca livre.

## 4. Arquitetura e back-end

```
prisma/schema.prisma      User, Role, Department, Contact, Channel, Ticket, Message, Note
                          + ContactChannel, TicketTransfer, BotSession, BotMenuOption
server/webhooks/          evolution.js · whatsappCloud.js · instagram.js · webchat.js
server/lib/ticketService  contato → ticket → mensagem → bot → fila (ponto único de entrada)
server/lib/outbound.js    envio para Evolution / WhatsApp Cloud / Instagram / webchat
server/routes/api.js      REST: tickets, mensagens, notas, transferência, métricas
server/lib/realtime.js    SSE (troque por Socket.IO mantendo `emit(event, payload)`)
```

### Subindo o back-end

```bash
cp .env.example .env          # preencha DATABASE_URL e as credenciais dos canais
npm run prisma:migrate
npm run prisma:seed           # setores, usuários, canais e menu do bot
npm run server
```

### URLs de webhook

| Canal | Endpoint |
|---|---|
| Evolution API (Baileys) | `POST /webhooks/evolution` — eventos `MESSAGES_UPSERT`, `MESSAGES_UPDATE` |
| WhatsApp Cloud API | `GET/POST /webhooks/whatsapp` — handshake `hub.verify_token` + assinatura `X-Hub-Signature-256` |
| Instagram Graph API | `GET/POST /webhooks/instagram` — campos `messages`, `messaging_postbacks` |
| Chat do site | `POST /webhooks/webchat` — `{ sessionId, name, text }` |

Todos convergem para `handleInbound()`, que resolve o contato (deduplicado por
`ContactChannel`), reaproveita o ticket aberto do canal, grava a mensagem com
idempotência por `externalId` e aciona o bot ou a fila.

### Ligando a UI ao back-end

O estado vive em `src/store/reducer.js` com ações que espelham os eventos do
servidor (`INBOUND_MESSAGE`, `TICKET_ASSIGNED`, `TRANSFER`…). Para trocar o
mock pelo real, substitua o `useSimulator` em `src/store/AppContext.jsx` por um
`EventSource('/events')` que despacha as mesmas ações, e troque as leituras
iniciais de `src/data/seed.js` por `GET /api/tickets`.

## Stack

React 18 · Vite 5 · Tailwind CSS 3 · lucide-react · Express · Prisma · PostgreSQL
