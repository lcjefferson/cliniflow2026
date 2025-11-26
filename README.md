# Sistema de Gestão para Clínicas Odontológicas - DentalCare

Sistema completo e moderno para gestão de clínicas odontológicas, desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

## 🚀 Funcionalidades

### Módulos Principais

- **Dashboard Completo**: Visão geral com métricas, gráficos e atividades recentes
- **Calendário de Agendamentos**: Gerenciamento completo de consultas com filtros inteligentes
- **Gestão de Pacientes**: Cadastro completo com histórico, tratamentos, anamnese e documentos
- **Leads**: Captura e conversão de leads com pipeline visual
- **Omnichannel**: Integração com WhatsApp e Instagram para atendimento unificado
- **Follow-Up**: Mensagens automatizadas (aniversários, pós-consulta, leads inativos)
- **Profissionais**: Gerenciamento de dentistas e equipe
- **Serviços**: Cadastro de procedimentos com preços e durações
- **Faturamento**: Controle de receitas e despesas com filtros avançados
- **Relatórios**: Geração de relatórios financeiros e operacionais
- **Usuários**: Gerenciamento de acessos e permissões
- **Configurações**: Personalização da clínica e integrações

## 🛠️ Tecnologias

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS com design system customizado
- **UI Components**: Componentes customizados com Radix UI
- **Database**: Prisma ORM (PostgreSQL recomendado)
- **Autenticação**: NextAuth.js
- **Estado**: Zustand
- **Validação**: Zod + React Hook Form
- **Datas**: date-fns
- **Gráficos**: Recharts
- **Calendário**: FullCalendar
- **PDF**: React-PDF

## 📦 Instalação

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL (ou outro banco compatível com Prisma)
- npm ou yarn

### Passos

1. Clone o repositório ou navegue até a pasta do projeto:

\`\`\`bash
cd dental-clinic-platform
\`\`\`

2. Instale as dependências:

\`\`\`bash
npm install
\`\`\`

3. Configure as variáveis de ambiente:

\`\`\`bash
cp .env.example .env
\`\`\`

Edite o arquivo \`.env\` com suas configurações:

\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/dental_clinic"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="sua-chave-secreta"
# ... outras variáveis
\`\`\`

4. Configure o banco de dados:

\`\`\`bash
npx prisma generate
npx prisma db push
\`\`\`

5. (Opcional) Popule o banco com dados de exemplo:

\`\`\`bash
npx prisma db seed
\`\`\`

6. Inicie o servidor de desenvolvimento:

\`\`\`bash
npm run dev
\`\`\`

7. Acesse http://localhost:3000

## 🎨 Design System

O sistema utiliza um design premium com:

- **Tema Dark**: Interface moderna com glassmorphism
- **Paleta de Cores**: Tons de teal/turquesa para tema médico
- **Animações**: Transições suaves e micro-interações
- **Responsivo**: Adaptado para desktop, tablet e mobile
- **Acessibilidade**: Componentes acessíveis com Radix UI

## 📱 Integrações

### WhatsApp Business API

1. Crie uma conta no WhatsApp Business
2. Configure o webhook em Configurações > Integrações
3. Adicione o token de acesso e ID do número

### Instagram Business API

1. Conecte sua conta Instagram Business
2. Gere um token de acesso no Facebook Developers
3. Configure em Configurações > Integrações

## 🔐 Autenticação e Permissões

O sistema possui 4 níveis de acesso:

- **Admin**: Acesso total ao sistema
- **Dentista**: Acesso a pacientes, agendamentos e tratamentos
- **Recepcionista**: Acesso a agendamentos, leads e omnichannel
- **Assistente**: Visualização de agendamentos e pacientes

## 📊 Estrutura do Projeto

\`\`\`
dental-clinic-platform/
├── app/                      # Páginas e rotas (App Router)
│   ├── dashboard/           # Módulos do dashboard
│   │   ├── page.tsx        # Dashboard principal
│   │   ├── calendar/       # Calendário
│   │   ├── patients/       # Pacientes
│   │   ├── leads/          # Leads
│   │   ├── omnichannel/    # Omnichannel
│   │   ├── follow-up/      # Follow-up
│   │   ├── professionals/  # Profissionais
│   │   ├── services/       # Serviços
│   │   ├── billing/        # Faturamento
│   │   ├── reports/        # Relatórios
│   │   ├── users/          # Usuários
│   │   └── settings/       # Configurações
│   ├── layout.tsx          # Layout raiz
│   └── globals.css         # Estilos globais
├── components/              # Componentes reutilizáveis
│   ├── ui/                 # Componentes UI base
│   └── layout/             # Componentes de layout
├── lib/                     # Utilitários e helpers
│   ├── prisma.ts           # Cliente Prisma
│   ├── utils.ts            # Funções utilitárias
│   └── validations.ts      # Schemas de validação
├── prisma/                  # Schema do banco de dados
│   └── schema.prisma
└── public/                  # Arquivos estáticos
\`\`\`

## 🚀 Deploy

### Vercel (Recomendado)

1. Faça push do código para GitHub
2. Importe o projeto no Vercel
3. Configure as variáveis de ambiente
4. Deploy automático!

### Outras Plataformas

O projeto é compatível com qualquer plataforma que suporte Next.js:
- AWS Amplify
- Netlify
- Railway
- DigitalOcean App Platform

## 📝 Scripts Disponíveis

\`\`\`bash
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Cria build de produção
npm run start        # Inicia servidor de produção
npm run lint         # Executa linter
\`\`\`

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit suas mudanças (\`git commit -m 'Add some AmazingFeature'\`)
4. Push para a branch (\`git push origin feature/AmazingFeature\`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.

## 💬 Suporte

Para suporte, envie um email para suporte@dentalcare.com ou abra uma issue no GitHub.

## 🎯 Roadmap

- [ ] Aplicativo mobile (React Native)
- [ ] Integração com sistemas de pagamento
- [ ] Telemedicina / Consultas online
- [ ] Prontuário eletrônico completo
- [ ] Integração com laboratórios
- [ ] Sistema de fidelidade para pacientes

---

Desenvolvido com ❤️ para clínicas odontológicas
