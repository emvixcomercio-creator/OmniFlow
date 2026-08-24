/**
 * Apresentação do dia a dia: o sistema já montado, mostrando cada parte da tela.
 * Mesma estrutura das paradas do primeiro dia — a engine é a mesma.
 */
import * as seed from '../../data/seed'

const patch = (dispatch, p) => dispatch({ type: 'SET_DEMO_STATE', patch: p })

export const PARADAS_FLUXO = [
  {
    titulo: 'Como é o dia a dia',
    texto: 'Vamos passear pelo sistema de uma empresa que já está rodando: conversas em andamento, equipe atendendo e o gestor acompanhando. Você avança no seu ritmo e pode clicar na tela normalmente enquanto lê.',
    act: ({ dispatch }) => patch(dispatch, {
      users: seed.users, departments: seed.departments, channels: seed.channels,
      contacts: seed.contacts, tickets: seed.tickets,
      currentUserId: 'u-ana', view: 'inbox', selectedTicketId: 'tk-1', simulation: false,
    }),
  },
  {
    titulo: 'Uma caixa de entrada só',
    texto: 'Esta é a tela de quem atende. WhatsApp, Instagram e o chat do site chegam todos na mesma lista — ninguém precisa abrir três programas. A bolinha colorida ao lado da foto diz de onde veio cada conversa.',
    alvo: 'inbox-list',
  },
  {
    titulo: 'Três abas, três momentos',
    texto: 'Em Ativas ficam as conversas que já são suas. Em Pendentes, quem chegou agora e ainda espera alguém — é onde o atendente olha primeiro. Em Finalizadas fica o que já foi resolvido.',
    alvo: 'inbox-tabs',
  },
  {
    titulo: 'O robô atende antes de todo mundo',
    texto: 'Antes de ocupar o tempo da equipe, o robô pergunta do que a pessoa precisa. Aceita o número da opção, mas também entende quando o cliente escreve com as próprias palavras.',
    alvo: 'chat-timeline',
    act: ({ dispatch }) => dispatch({ type: 'SELECT_TICKET', ticketId: 'tk-4' }),
  },
  {
    titulo: 'A fila do setor',
    texto: 'Escolhido o assunto, a conversa entra na fila certa e o relógio de espera começa. Comercial e Suporte entregam sozinhos para quem tem menos conversas na mão; Financeiro e Jurídico esperam alguém assumir.',
    alvo: 'inbox-list',
    act: ({ dispatch }) => dispatch({ type: 'SELECT_TICKET', ticketId: 'tk-6' }),
  },
  {
    titulo: 'Respondendo',
    texto: 'Texto, foto, documento, emoji e frases prontas para não digitar sempre a mesma coisa. Os dois tiquinhos são os mesmos do WhatsApp: mostram quando chegou e quando foi lida.',
    alvo: 'composer',
    act: ({ dispatch }) => dispatch({ type: 'SELECT_TICKET', ticketId: 'tk-1' }),
  },
  {
    titulo: 'O recado que o cliente não vê',
    texto: 'Clicando em Nota interna, o que você escrever aparece em amarelo só para a equipe. Serve para avisar um colega, registrar o que foi combinado por dentro ou deixar um alerta para quem pegar a conversa depois.',
    alvo: 'composer-note',
  },
  {
    titulo: 'Passando para outro setor',
    texto: 'Ninguém pede para o cliente mandar mensagem em outro número. Escolhe o setor, se quiser a pessoa, e escreve o motivo. Fica tudo registrado: depois dá para saber quem passou o quê para quem.',
    alvo: 'btn-transfer',
  },
  {
    titulo: 'Quem está do outro lado',
    texto: 'À direita fica a ficha do cliente e todas as vezes que essa pessoa já falou com vocês. Ninguém precisa perguntar "o senhor já entrou em contato antes?" — é só clicar e ler.',
    alvo: 'contact-panel',
  },
  {
    titulo: 'A visão de quem gerencia',
    texto: 'Trocando para o acesso do gestor: quanto tempo as pessoas esperam, quantas estão na fila, quantas conversas cada atendente tem e por qual canal o movimento está vindo.',
    alvo: 'kpi-row',
    aba: 'supervisor',
    act: ({ dispatch }) => patch(dispatch, { currentUserId: 'u-sup', view: 'supervisor' }),
  },
  {
    titulo: 'Acompanhar sem aparecer',
    texto: 'O botão Espiar abre qualquer conversa em andamento sem o cliente nem o atendente saberem. Dali dá para orientar a equipe por dentro, redirecionar o caso ou assumir a conversa na hora.',
    alvo: 'live-board',
    aba: 'supervisor',
  },
  {
    titulo: 'E na sua empresa?',
    texto: 'Em Equipe existe um assistente com o passo a passo de cada canal: como ligar o número de WhatsApp, a conta do Instagram e o chat do seu próprio site.',
    aba: 'team',
    act: ({ dispatch }) => patch(dispatch, { view: 'team' }),
  },
]
