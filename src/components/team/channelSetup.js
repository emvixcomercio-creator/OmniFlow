/**
 * Passo a passo de conexão de cada provedor, exibido no assistente.
 * {{URL}} é trocado pelo domínio que o cliente informar no topo do assistente.
 */
export const SETUP_GUIDES = {
  WHATSAPP_CLOUD: {
    label: 'WhatsApp Cloud API (oficial da Meta)',
    summary: 'Número oficial, com selo de conta comercial e sem risco de bloqueio. Cobrança por conversa iniciada.',
    needs: ['CNPJ ativo', 'Um número que não esteja em uso no app WhatsApp', 'Conta no Meta for Developers'],
    steps: [
      { title: 'Criar o app na Meta', text: 'Em developers.facebook.com, crie um app do tipo Empresa e adicione o produto WhatsApp.' },
      { title: 'Cadastrar o número', text: 'Adicione o número da empresa e confirme o código recebido por SMS ou ligação. Se o número já usa o WhatsApp comum, é preciso apagar a conta antiga primeiro.' },
      { title: 'Copiar as credenciais', text: 'Guarde o Phone Number ID e gere um token permanente pelo Usuário do Sistema no Gerenciador de Negócios.', code: 'WHATSAPP_PHONE_NUMBER_ID="123456789012345"\nWHATSAPP_TOKEN="EAAG..."' },
      { title: 'Apontar o webhook', text: 'Em WhatsApp → Configuração, cole a URL de retorno e o token de verificação. A Meta faz uma chamada de teste na hora.', code: '{{URL}}/webhooks/whatsapp' },
      { title: 'Assinar as mensagens', text: 'Marque o campo messages na lista de webhooks. Sem isso o app conecta mas nada chega.' },
    ],
  },
  EVOLUTION: {
    label: 'WhatsApp via Evolution API',
    summary: 'Usa o número que a empresa já tem, lendo um QR Code. Sobe rápido e não tem custo por mensagem, mas é uma conexão não oficial.',
    needs: ['Um servidor (VPS) para a Evolution', 'O celular da empresa por perto para ler o QR', 'Um número dedicado ao atendimento'],
    steps: [
      { title: 'Subir a Evolution', text: 'Um contêiner Docker no seu servidor já resolve.', code: 'docker run -d --name evolution -p 8080:8080 \\\n  -e AUTHENTICATION_API_KEY="sua-chave" \\\n  atendai/evolution-api:latest' },
      { title: 'Criar a instância', text: 'Uma instância por número de WhatsApp que a empresa for usar.', code: 'POST /instance/create\n{ "instanceName": "atendimento", "qrcode": true }' },
      { title: 'Ler o QR Code', text: 'No celular: WhatsApp → Aparelhos conectados → Conectar aparelho. O número fica pareado como um WhatsApp Web.' },
      { title: 'Apontar o webhook', text: 'Configure a URL e marque os eventos de mensagem.', code: '{{URL}}/webhooks/evolution\neventos: MESSAGES_UPSERT, MESSAGES_UPDATE' },
      { title: 'Manter o celular online', text: 'Como é uma sessão espelhada, o aparelho precisa ter internet. Se cair, a instância reconecta sozinha ao voltar.' },
    ],
  },
  INSTAGRAM_GRAPH: {
    label: 'Instagram Direct',
    summary: 'Traz o Direct, as respostas a stories e os comentários por mensagem para dentro do painel.',
    needs: ['Perfil comercial ou de criador', 'Página do Facebook vinculada ao perfil', 'Ser administrador da Página'],
    steps: [
      { title: 'Vincular à Página', text: 'No app do Instagram: Configurações → Conta → Ferramentas de negócios → conectar a Página do Facebook da empresa.' },
      { title: 'Liberar o acesso', text: 'Ainda no Instagram: Configurações → Mensagens → ative "Permitir acesso a mensagens" para aplicativos de terceiros.' },
      { title: 'Adicionar o produto', text: 'No mesmo app da Meta, adicione o produto Instagram e conceda as permissões instagram_manage_messages e pages_manage_metadata.' },
      { title: 'Apontar o webhook', text: 'Cole a URL de retorno e assine os campos de mensagem.', code: '{{URL}}/webhooks/instagram\ncampos: messages, messaging_postbacks' },
      { title: 'Gerar o token da Página', text: 'O token é o da Página vinculada, não o do perfil do Instagram.', code: 'INSTAGRAM_PAGE_TOKEN="EAAG..."\nINSTAGRAM_IG_ID="17841400000000"' },
    ],
  },
  WEBCHAT: {
    label: 'Chat no site da empresa',
    summary: 'O balãozinho de conversa no canto do site. É o canal mais simples: um trecho de código e pronto.',
    needs: ['Acesso ao código do site ou ao gerenciador de tags'],
    steps: [
      { title: 'Copiar o código', text: 'Cole antes do fechamento da tag body, em todas as páginas onde o chat deve aparecer.', code: '<script\n  src="{{URL}}/widget.js"\n  data-empresa="minha-empresa"\n  data-cor="#2547eb"\n  defer></script>' },
      { title: 'Publicar o site', text: 'Assim que a página subir, o balão aparece no canto inferior direito.' },
      { title: 'Conferir', text: 'Mande uma mensagem de teste pelo site: ela cai na aba Pendentes do painel em poucos segundos.' },
    ],
  },
}
