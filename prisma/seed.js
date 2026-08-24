import { PrismaClient } from '@prisma/client'
import crypto from 'node:crypto'

const prisma = new PrismaClient()
const hash = (s) => crypto.createHash('sha256').update(s).digest('hex')

const DEPARTMENTS = [
  { name: 'Comercial', slug: 'comercial', slaMinutes: 5, autoAssign: true },
  { name: 'Suporte', slug: 'suporte', slaMinutes: 3, autoAssign: true },
  { name: 'Financeiro', slug: 'financeiro', slaMinutes: 10, autoAssign: false },
  { name: 'Jurídico', slug: 'juridico', slaMinutes: 15, autoAssign: false },
]

const USERS = [
  { name: 'Ana Beatriz Rocha', email: 'ana@empresa.com.br', role: 'AGENT', depts: ['comercial', 'suporte'] },
  { name: 'Carlos Menezes', email: 'carlos@empresa.com.br', role: 'AGENT', depts: ['suporte'] },
  { name: 'Júlia Ferraz', email: 'julia@empresa.com.br', role: 'AGENT', depts: ['financeiro'] },
  { name: 'Rafael Lima', email: 'rafael@empresa.com.br', role: 'AGENT', depts: ['juridico'] },
  { name: 'Marina Duarte', email: 'marina@empresa.com.br', role: 'SUPERVISOR', depts: ['comercial', 'suporte', 'financeiro', 'juridico'] },
]

const CHANNELS = [
  { name: 'WhatsApp Oficial', type: 'WHATSAPP', provider: 'WHATSAPP_CLOUD', identifier: '5511400289220', config: { phoneNumberId: '123456789012345' } },
  { name: 'WhatsApp Comercial', type: 'WHATSAPP', provider: 'EVOLUTION', identifier: '5511988771200', config: { instance: 'atendimento' } },
  { name: '@suaempresa', type: 'INSTAGRAM', provider: 'INSTAGRAM_GRAPH', identifier: '17841400000000', config: { igId: '17841400000000' } },
  { name: 'Chat do Site', type: 'WEBCHAT', provider: 'WEBCHAT', identifier: 'suaempresa.com.br', config: {} },
]

const BOT_MENU = [
  { key: '1', label: 'Contratar / Orçamento', slug: 'comercial', subject: 'Solicitação de orçamento', order: 1 },
  { key: '2', label: 'Suporte técnico', slug: 'suporte', subject: 'Suporte técnico', order: 2 },
  { key: '3', label: '2ª via de boleto / Financeiro', slug: 'financeiro', subject: 'Assunto financeiro', order: 3 },
  { key: '4', label: 'Assuntos jurídicos / Processos', slug: 'juridico', subject: 'Consulta jurídica', order: 4 },
  { key: '0', label: 'Falar com um atendente', slug: 'comercial', subject: 'Atendimento geral', order: 5 },
]

async function main() {
  const depts = {}
  for (const d of DEPARTMENTS) {
    depts[d.slug] = await prisma.department.upsert({ where: { slug: d.slug }, update: d, create: d })
  }

  for (const u of USERS) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role },
      create: { name: u.name, email: u.email, role: u.role, passwordHash: hash('123456'), status: 'ONLINE' },
    })
    for (const slug of u.depts) {
      await prisma.departmentMember.upsert({
        where: { userId_departmentId: { userId: user.id, departmentId: depts[slug].id } },
        update: {},
        create: { userId: user.id, departmentId: depts[slug].id },
      })
    }
  }

  for (const c of CHANNELS) {
    await prisma.channel.upsert({
      where: { provider_identifier: { provider: c.provider, identifier: c.identifier } },
      update: c,
      create: c,
    })
  }

  for (const o of BOT_MENU) {
    const { slug, ...rest } = o
    await prisma.botMenuOption.upsert({
      where: { key: o.key },
      update: { ...rest, departmentId: depts[slug].id },
      create: { ...rest, departmentId: depts[slug].id },
    })
  }

  console.log('Seed concluído. Senha padrão dos usuários: 123456')
}

main().finally(() => prisma.$disconnect())
