/** Respostas rápidas (macros) disponíveis para o atendente. */
export const QUICK_REPLIES = [
  { id: 'qr1', title: 'Saudação', text: 'Olá! Meu nome é {{atendente}}, sou do setor {{setor}}. Como posso te ajudar hoje?' },
  { id: 'qr2', title: 'Aguarde', text: 'Só um instante, por favor — estou verificando essa informação no sistema. 🔎' },
  { id: 'qr3', title: 'Documentos', text: 'Para dar andamento, preciso dos seguintes documentos: RG, CPF e comprovante de residência atualizado.' },
  { id: 'qr4', title: 'Boleto 2ª via', text: 'Segue a 2ª via do seu boleto em anexo. O vencimento é ajustado automaticamente para hoje. 👍' },
  { id: 'qr5', title: 'Encerramento', text: 'Posso ajudar em mais alguma coisa? Se não, encerro o atendimento e permaneço à disposição. 🙂' },
]

/** Frases usadas pelo simulador para gerar mensagens de clientes. */
export const CUSTOMER_LINES = {
  'dep-comercial': [
    'Vocês atendem empresas do Simples Nacional?',
    'Qual o valor do plano mensal para 5 usuários?',
    'Consegue me mandar a proposta por e-mail também?',
    'E o prazo de implantação, quanto tempo leva?',
    'Tem desconto para pagamento anual?',
  ],
  'dep-suporte': [
    'O sistema está dando erro 500 quando eu tento salvar.',
    'Não consigo fazer login desde ontem à noite.',
    'Consegui reiniciar aqui, mas o erro voltou.',
    'Vou te mandar um print da tela.',
    'Agora funcionou! Muito obrigado. 🙏',
  ],
  'dep-financeiro': [
    'Preciso da 2ª via do boleto que venceu dia 10.',
    'O pagamento consta como pendente, mas já paguei.',
    'Segue o comprovante em anexo.',
    'Vocês emitem nota fiscal no mesmo dia?',
    'Consigo alterar o vencimento para dia 20?',
  ],
  'dep-juridico': [
    'Teve alguma movimentação no meu processo?',
    'A audiência ainda está marcada para o dia 12?',
    'Preciso assinar alguma procuração nova?',
    'Pode me explicar o que significa esse despacho?',
    'Entendi, obrigado pelo retorno.',
  ],
  default: ['Certo, obrigado!', 'Entendi.', 'Pode me confirmar isso, por favor?', 'Ok, aguardo.'],
}

export const FIRST_CONTACT_LINES = [
  'Oi, boa tarde! Preciso de uma informação.',
  'Olá, tudo bem? Vim pelo site de vocês.',
  'Bom dia! Alguém pode me atender?',
  'Oi! Vi o anúncio de vocês no Instagram.',
  'Olá, preciso resolver uma pendência urgente.',
]
