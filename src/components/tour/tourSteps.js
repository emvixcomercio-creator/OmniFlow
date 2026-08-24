/**
 * Roteiro do tour guiado.
 * Cada passo aponta para um elemento real da interface via [data-tour="..."]
 * e pode preparar o estado do app antes de aparecer (before).
 */
export const TOUR_STEPS = [
  {
    id: 'intro',
    target: null,
    place: 'center',
    eyebrow: 'Passo 1 de 11',
    title: 'Um cliente escreve. E agora?',
    body: 'Vou percorrer com você o caminho completo de um atendimento: da mensagem que chega no WhatsApp até o chamado finalizado. São 11 paradas rápidas — a simulação fica pausada enquanto isso.',
    before: ({ dispatch }) => {
      dispatch({ type: 'SET_SIMULATION', value: false })
      dispatch({ type: 'SET_CURRENT_USER', userId: 'u-ana' })
      dispatch({ type: 'SET_VIEW', view: 'inbox' })
      dispatch({ type: 'RESET_FILTERS' })
    },
  },
  {
    id: 'inbox',
    target: 'inbox-list',
    place: 'right',
    eyebrow: 'Passo 2 de 11',
    title: 'Uma caixa de entrada só',
    body: 'WhatsApp, Instagram e chat do site chegam na mesma lista. O selo colorido no canto do avatar diz de onde veio cada conversa — verde é WhatsApp, rosa é Instagram, azul é o site.',
  },
  {
    id: 'tabs',
    target: 'inbox-tabs',
    place: 'right',
    eyebrow: 'Passo 3 de 11',
    title: 'Ativas, Pendentes, Finalizadas',
    body: 'Ativas são as suas. Pendentes é quem ainda está no bot ou esperando na fila do setor — é a aba que o atendente vigia. Finalizadas viram histórico do contato.',
  },
  {
    id: 'bot',
    target: 'chat-timeline',
    place: 'left',
    eyebrow: 'Passo 4 de 11',
    title: 'O bot atende primeiro',
    body: 'Antes de qualquer pessoa, o robô cumprimenta e oferece o menu numérico. Ele também entende texto solto: quem escreve "preciso da 2ª via do boleto" vai para o Financeiro sem digitar 3.',
    before: ({ dispatch }) => dispatch({ type: 'SELECT_TICKET', ticketId: 'tk-4' }),
  },
  {
    id: 'queue',
    target: 'inbox-list',
    place: 'right',
    eyebrow: 'Passo 5 de 11',
    title: 'Da triagem para a fila',
    body: 'Escolhida a opção, o chamado entra na fila daquele setor e o cronômetro de espera começa. Comercial e Suporte distribuem sozinhos para quem tem menos conversas abertas; Financeiro e Jurídico esperam alguém clicar em Assumir.',
    before: ({ dispatch }) => dispatch({ type: 'SELECT_TICKET', ticketId: 'tk-6' }),
  },
  {
    id: 'chat',
    target: 'composer',
    place: 'top',
    eyebrow: 'Passo 6 de 11',
    title: 'A conversa',
    body: 'Texto, anexos, emoji e respostas prontas. Enter envia, Shift+Enter quebra linha. Os ✓✓ mostram entrega e leitura, iguais aos do WhatsApp.',
    before: ({ dispatch }) => dispatch({ type: 'SELECT_TICKET', ticketId: 'tk-1' }),
  },
  {
    id: 'note',
    target: 'composer-note',
    place: 'top',
    eyebrow: 'Passo 7 de 11',
    title: 'Nota interna: o cliente nunca vê',
    body: 'Troque para Nota interna e o recado fica só para a equipe, em amarelo na conversa. É onde o supervisor orienta e onde fica o histórico do que não pode ser dito ao cliente.',
  },
  {
    id: 'transfer',
    target: 'btn-transfer',
    place: 'bottom',
    eyebrow: 'Passo 8 de 11',
    title: 'Passando para outro setor',
    body: 'Escolhe o departamento, opcionalmente o atendente, a prioridade e o motivo. A transferência fica registrada na conversa — dá para auditar quem passou o quê para quem.',
  },
  {
    id: 'contact',
    target: 'contact-panel',
    place: 'left',
    eyebrow: 'Passo 9 de 11',
    title: 'Quem está do outro lado',
    body: 'Ficha do contato, protocolo, tempo de espera, notas e o histórico de todos os atendimentos anteriores dele — clicável. Ninguém precisa perguntar "já falou com a gente antes?".',
  },
  {
    id: 'dashboard',
    target: 'kpi-row',
    place: 'bottom',
    eyebrow: 'Passo 10 de 11',
    title: 'A visão do gestor',
    body: 'Entrei como supervisora. Tempo médio de espera, fila, SLA por setor, volume por canal e a carga de cada atendente — tudo atualizando sozinho.',
    before: ({ dispatch }) => {
      dispatch({ type: 'SET_CURRENT_USER', userId: 'u-sup' })
      dispatch({ type: 'SET_VIEW', view: 'supervisor' })
    },
  },
  {
    id: 'spy',
    target: 'live-board',
    place: 'top',
    eyebrow: 'Passo 11 de 11',
    title: 'Modo espião',
    body: 'O botão Espiar abre qualquer conversa ao vivo sem aparecer para o cliente nem para o atendente. Dali o supervisor orienta por nota, redireciona o chamado ou assume na hora.',
  },
  {
    id: 'connect',
    target: null,
    place: 'center',
    eyebrow: 'Para terminar',
    title: 'E na sua empresa?',
    body: 'Em Equipe → Canais conectados existe um assistente com o passo a passo de cada canal: número do WhatsApp, conta do Instagram e o trecho de código do chat para colar no seu site. Abro para você?',
    cta: 'Ver como conectar',
    before: ({ dispatch }) => {
      dispatch({ type: 'SET_CURRENT_USER', userId: 'u-sup' })
      dispatch({ type: 'SET_VIEW', view: 'team' })
    },
  },
]
