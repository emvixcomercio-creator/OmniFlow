/**
 * As paradas da apresentação. Cada uma explica uma ideia e faz algo acontecer
 * na tela — quem assiste vê o sistema sendo montado e a conversa nascendo.
 */
import * as seed from '../../data/seed'
import { AUTHOR, TICKET_STATUS } from '../../lib/constants'
import { nowIso } from '../../lib/format'
import {
  ESTADO_ZERADO, PRIMEIRO_TICKET, CLIENTE, TICKET_ID, msg,
  CONFIG_BOT, greetingText, transferText,
} from '../../lib/demoScript'

const patch = (dispatch, p) => dispatch({ type: 'SET_DEMO_STATE', patch: p })
const dept = (id) => seed.departments.find((d) => d.id === id)

export const PARADAS_PRIMEIRO_DIA = [
  {
    titulo: 'O primeiro dia',
    texto: 'É assim que o sistema chega para a sua empresa: vazio. Nenhum canal ligado, nenhum setor, ninguém na equipe e nenhuma conversa. Vamos montar isso juntos e ver a primeira mensagem chegar.',
    aba: 'team',
    act: ({ dispatch }) => patch(dispatch, { ...ESTADO_ZERADO }),
  },
  {
    titulo: 'Ligar o WhatsApp',
    texto: 'O primeiro passo é conectar os canais que a empresa já usa. O número de WhatsApp, o Instagram e o chat do site entram aqui — e a partir desse momento tudo o que chegar por eles cai nesta tela.',
    aba: 'team',
    act: ({ dispatch }) => patch(dispatch, { channels: seed.channels }),
  },
  {
    titulo: 'Criar os setores',
    texto: 'Cada assunto tem um dono. Comercial, Suporte, Financeiro e Jurídico viram filas separadas, cada uma com o tempo que a empresa considera aceitável para alguém atender.',
    aba: 'team',
    act: ({ dispatch }) => patch(dispatch, { departments: seed.departments }),
  },
  {
    titulo: 'Chamar a equipe',
    texto: 'Agora as pessoas. Cada uma entra nos setores em que trabalha e com um limite de quantas conversas consegue tocar ao mesmo tempo — o sistema respeita isso na hora de distribuir.',
    aba: 'team',
    act: ({ dispatch }) => patch(dispatch, { users: seed.users }),
  },
  {
    titulo: 'Ensinar o robô',
    texto: 'Antes de ocupar o tempo de alguém, um robô pergunta do que o cliente precisa. Esse menu é escrito pelo gestor, em Editar — sem programador, sem chamar suporte.',
    aba: 'team',
    act: ({ dispatch }) => patch(dispatch, { botConfig: CONFIG_BOT }),
  },
  {
    titulo: 'A primeira mensagem',
    texto: 'Pronto: o sistema está no ar. Renata acabou de mandar uma mensagem no WhatsApp da empresa — e ela apareceu aqui em menos de um segundo, sem ninguém precisar abrir o celular.',
    aba: 'inbox',
    act: ({ dispatch }) => patch(dispatch, {
      contacts: [CLIENTE],
      tickets: [PRIMEIRO_TICKET()],
      selectedTicketId: TICKET_ID,
      currentUserId: 'u-ana',
      view: 'inbox',
    }),
  },
  {
    titulo: 'O robô atende primeiro',
    texto: 'Ninguém da equipe foi incomodado ainda. O robô cumprimenta pelo nome e oferece as opções. Se a Renata escrever com as próprias palavras, ele também entende.',
    act: ({ dispatch, state }) => dispatch({
      type: 'BOT_GREET',
      ticketId: TICKET_ID,
      body: greetingText(state.botConfig, CLIENTE.name),
    }),
  },
  {
    titulo: 'Ela escolhe o assunto',
    texto: 'Renata respondeu 2, que é Suporte. Nesse instante o robô já sabe para onde mandar: a conversa entra na fila do Suporte e o relógio de espera começa a contar.',
    act: ({ dispatch }) => dispatch({ type: 'BOT_CHOICE', ticketId: TICKET_ID, text: '2' }),
  },
  {
    titulo: 'Alguém assume',
    texto: 'A Ana está no Suporte e é quem tem menos conversas na mão, então o sistema entregou para ela. Repare que a conversa saiu de Pendentes e virou um atendimento com dono.',
    act: ({ dispatch }) => dispatch({ type: 'ASSIGN', ticketId: TICKET_ID, agentId: 'u-ana' }),
  },
  {
    titulo: 'A resposta chega',
    texto: 'A Ana já abre a conversa sabendo o nome da cliente, por qual canal ela veio e qual assunto o robô identificou. Não precisa perguntar nada de novo.',
    act: ({ dispatch }) => dispatch({
      type: 'SEND_MESSAGE',
      ticketId: TICKET_ID,
      authorId: 'u-ana',
      body: 'Oi Renata, boa tarde! Aqui é a Ana do Suporte. Já localizei sua compra aqui. Vou verificar por que a nota não está saindo — me dá um minutinho?',
    }),
  },
  {
    titulo: 'Um recado que a cliente não vê',
    texto: 'A Ana descobriu o problema, mas é assunto de cobrança. Antes de passar adiante, ela deixa uma nota interna em amarelo: só a equipe enxerga. É onde fica o combinado que não se diz ao cliente.',
    act: ({ dispatch }) => dispatch({
      type: 'ADD_NOTE',
      ticketId: TICKET_ID,
      authorId: 'u-ana',
      body: 'A nota está travada por uma pendência de pagamento de R$ 89,90. Passando para o Financeiro liberar. Cliente é boa pagadora, primeira vez que atrasa.',
    }),
  },
  {
    titulo: 'Passando para o setor certo',
    texto: 'Ninguém pede para a cliente "mandar mensagem no outro número". A conversa inteira vai para o Financeiro com o histórico junto — e fica registrado quem passou, para quem e por quê.',
    act: ({ dispatch }) => dispatch({
      type: 'TRANSFER',
      ticketId: TICKET_ID,
      departmentId: 'dep-financeiro',
      agentId: 'u-julia',
      byId: 'u-ana',
      reason: 'Pendência de pagamento travando a emissão da nota',
    }),
  },
  {
    titulo: 'Resolvido e encerrado',
    texto: 'A Júlia liberou, avisou a cliente e encerrou. O atendimento vira histórico com número de protocolo: se a Renata voltar daqui a seis meses, quem atender vê tudo isso em dois cliques.',
    act: ({ dispatch }) => {
      dispatch({
        type: 'SEND_MESSAGE',
        ticketId: TICKET_ID,
        authorId: 'u-julia',
        body: 'Renata, tudo certo! Liberei a pendência e sua nota já pode ser emitida. Qualquer coisa é só chamar. 🙂',
      })
      dispatch({ type: 'INBOUND_MESSAGE', ticketId: TICKET_ID, body: 'Funcionou! Muito obrigada pela rapidez 🙏' })
      dispatch({ type: 'RESOLVE', ticketId: TICKET_ID, byId: 'u-julia' })
    },
  },
  {
    titulo: 'Algumas semanas depois',
    texto: 'Vamos adiantar o relógio. Com a operação rodando há um tempo, o atendimento da Renata virou apenas mais um no meio de muitos — e aí aparece a visão de quem gerencia: quanto tempo as pessoas esperam, quantas estão na fila agora, quantas conversas cada atendente tem na mão e por qual canal o movimento está vindo.',
    aba: 'supervisor',
    act: ({ dispatch, state }) => patch(dispatch, {
      currentUserId: 'u-sup',
      view: 'supervisor',
      // mantém a conversa que acabamos de acompanhar, agora no meio das outras
      tickets: [...state.tickets, ...seed.tickets],
      contacts: [CLIENTE, ...seed.contacts],
    }),
  },
  {
    titulo: 'Acompanhar sem aparecer',
    texto: 'E o botão preferido dos gestores: Espiar abre qualquer conversa em andamento sem o cliente nem o atendente saberem. Dali dá para orientar por dentro, redirecionar ou assumir na hora.',
    aba: 'supervisor',
    alvo: 'live-board',
  },
  {
    titulo: 'É isso',
    texto: 'Em poucos minutos saímos de um sistema vazio para uma empresa atendendo três canais, com robô triando, fila organizada e o gestor enxergando tudo. Agora fique à vontade para mexer.',
  },
]
