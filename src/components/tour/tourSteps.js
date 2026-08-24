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
    eyebrow: 'Parada 1 de 11',
    title: 'Um cliente escreve. E agora?',
    body: 'Vamos acompanhar juntos uma mensagem de cliente, do começo ao fim: ela chega no WhatsApp, o robô descobre do que se trata, alguém da equipe responde e o assunto se encerra. São 11 paradas, e você avança quando quiser.',
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
    eyebrow: 'Parada 2 de 11',
    title: 'Uma caixa de entrada só',
    body: 'Esta é a tela do dia a dia de quem atende. Repare que WhatsApp, Instagram e o chat do site chegam todos na mesma lista — ninguém precisa abrir três programas. A bolinha colorida ao lado da foto diz de onde veio cada conversa: verde é WhatsApp, rosa é Instagram, azul é o site.',
  },
  {
    id: 'tabs',
    target: 'inbox-tabs',
    place: 'right',
    eyebrow: 'Parada 3 de 11',
    title: 'Ativas, Pendentes, Finalizadas',
    body: 'Três abas, três momentos. Em Ativas ficam as conversas que já são suas. Em Pendentes, quem chegou agora e ainda espera alguém atender — é onde o atendente olha primeiro. Em Finalizadas fica o que já foi resolvido, guardado no histórico do cliente.',
  },
  {
    id: 'bot',
    target: 'chat-timeline',
    place: 'left',
    eyebrow: 'Parada 4 de 11',
    title: 'O bot atende primeiro',
    body: 'Antes de ocupar o tempo de alguém da equipe, o robô cumprimenta e pergunta do que a pessoa precisa. Ele aceita o número da opção, mas também entende quando o cliente escreve com as próprias palavras: quem digita "preciso da segunda via do boleto" já vai direto para o Financeiro.',
    before: ({ dispatch }) => dispatch({ type: 'SELECT_TICKET', ticketId: 'tk-4' }),
  },
  {
    id: 'queue',
    target: 'inbox-list',
    place: 'right',
    eyebrow: 'Parada 5 de 11',
    title: 'Da triagem para a fila',
    body: 'Assim que o cliente escolhe, a conversa entra na fila do setor certo e o relógio de espera começa a contar. Em Comercial e Suporte o sistema já entrega para quem está com menos conversas na mão. No Financeiro e no Jurídico alguém precisa clicar em Assumir — útil quando o assunto é delicado.',
    before: ({ dispatch }) => dispatch({ type: 'SELECT_TICKET', ticketId: 'tk-6' }),
  },
  {
    id: 'chat',
    target: 'composer',
    place: 'top',
    eyebrow: 'Parada 6 de 11',
    title: 'A conversa',
    body: 'Daqui a equipe responde: texto, foto, documento, emoji e frases prontas para não digitar sempre a mesma coisa. Os dois tiquinhos são os mesmos do WhatsApp — mostram quando a mensagem chegou e quando foi lida.',
    before: ({ dispatch }) => dispatch({ type: 'SELECT_TICKET', ticketId: 'tk-1' }),
  },
  {
    id: 'note',
    target: 'composer-note',
    place: 'top',
    eyebrow: 'Parada 7 de 11',
    title: 'Nota interna: o cliente nunca vê',
    body: 'Este é um detalhe que costuma resolver muita confusão. Clicando em Nota interna, o que você escrever aparece em amarelo só para a equipe — o cliente nunca vê. Serve para avisar um colega, registrar o que foi combinado por dentro ou deixar um alerta para quem pegar a conversa depois.',
  },
  {
    id: 'transfer',
    target: 'btn-transfer',
    place: 'bottom',
    eyebrow: 'Parada 8 de 11',
    title: 'Passando para outro setor',
    body: 'Quando o assunto é de outro setor, ninguém pede para o cliente "mandar mensagem no outro número". Escolhe o setor, se quiser a pessoa específica, e escreve o motivo. Tudo fica registrado na conversa: depois dá para saber quem passou o quê para quem, e por quê.',
  },
  {
    id: 'contact',
    target: 'contact-panel',
    place: 'left',
    eyebrow: 'Parada 9 de 11',
    title: 'Quem está do outro lado',
    body: 'Do lado direito fica a ficha de quem está do outro lado: telefone, e-mail, empresa e — o mais importante — todas as vezes que essa pessoa já falou com vocês. Ninguém precisa perguntar "o senhor já entrou em contato antes?". É só clicar e ler.',
  },
  {
    id: 'dashboard',
    target: 'kpi-row',
    place: 'bottom',
    eyebrow: 'Parada 10 de 11',
    title: 'A visão do gestor',
    body: 'Troquei para o acesso de quem gerencia. Aqui aparece o que o dono da empresa quer saber: quanto tempo as pessoas esperam, quantas estão na fila agora, quantas conversas cada atendente tem na mão e por qual canal o movimento está vindo.',
    before: ({ dispatch }) => {
      dispatch({ type: 'SET_CURRENT_USER', userId: 'u-sup' })
      dispatch({ type: 'SET_VIEW', view: 'supervisor' })
    },
  },
  {
    id: 'spy',
    target: 'live-board',
    place: 'top',
    eyebrow: 'Parada 11 de 11',
    title: 'Modo espião',
    body: 'Este botão é o preferido dos gestores. Espiar abre qualquer conversa em andamento sem aparecer para ninguém — nem para o cliente, nem para o atendente. Dali dá para deixar um recado por dentro orientando a equipe, passar o caso para outro setor ou assumir a conversa na hora, se for preciso.',
  },
  {
    id: 'connect',
    target: null,
    place: 'center',
    eyebrow: 'Para terminar',
    title: 'E na sua empresa?',
    body: 'Falta a pergunta mais importante: como fica na sua empresa? Existe um assistente com o passo a passo de cada canal — como ligar o número de WhatsApp, a conta do Instagram e o chat do seu próprio site. Quer que eu abra agora?',
    cta: 'Ver como conectar',
    before: ({ dispatch }) => {
      dispatch({ type: 'SET_CURRENT_USER', userId: 'u-sup' })
      dispatch({ type: 'SET_VIEW', view: 'team' })
    },
  },
]
