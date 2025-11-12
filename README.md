# 💼 Gestor Órion – Plataforma Financeira com Supabase + React + IA

Aplicação web para **gestão financeira diária**, criada para organizar despesas, relatórios, comprovantes e entradas de caixa de forma simples e escalável.

O sistema integra **Supabase (PostgreSQL + Auth + Storage)**, **React + Vite + TypeScript**, e foi projetado para lidar com dados reais de operação.

---

## 🧠 **Objetivo do projeto**

Oferecer uma solução prática para centralizar informações financeiras, como:

- Despesas diárias  
- Relatórios de vendas  
- Comprovantes (upload e organização)  
- Gestão de períodos (semanas, meses, ciclos)  
- Controle por categorias e centros de custo  
- Automação para facilitar decisões e conferências  

O foco é substituir planilhas e processos manuais por um **sistema moderno, seguro e inteligente**.

---

## 🛠️ **Tecnologias Utilizadas**

### **Frontend**
- React + Vite  
- TypeScript  
- Tailwind CSS (ou CSS customizado, dependendo da versão)  

### **Backend / Banco de Dados**
- **Supabase**
  - PostgreSQL  
  - Policies (RLS)  
  - Autenticação (email/senha)  
  - Storage (comprovantes, relatórios)  

### **Infra / Deploy**
- Netlify  
- GitHub Actions (futuro opcional)

gestororion/
├── 📂 public/ # Assets estáticos
├── 📂 src/
│ ├── 📁 components/ # Componentes reutilizáveis
│ ├── 📁 pages/ # Telas principais
│ ├── 📁 services/ # Integração com Supabase, APIs e regras de negócio
│ ├── 📁 hooks/ # Hooks customizados
│ ├── 📁 styles/ # Estilos globais
│ └── 📁 utils/ # Funções auxiliares
│
├── 📄 schema.sql # Criação do banco no Supabase
├── 📄 package.json
├── 📄 tsconfig.json
└── 📄 README.md


---

## 🗄️ **Banco de Dados (Supabase)**

O arquivo **schema.sql** cria toda a estrutura:

- Tabela `expenses` (despesas diárias)  
- Tabela `payouts` (repasse/fechamento semanal)  
- Tabela `reports` (relatórios enviados)  
- Policies RLS para segurança  
- Índices e constraints  

### **Storage recomendado**
- `invoices` – comprovantes enviados  
- `pos_reports` – relatórios semanais  

---

## 🔐 **Autenticação**

Login via **email e senha**, com:

- RLS configurado  
- Sessão persistente  
- Permissões por usuário  
- Acesso ao banco isolado por projeto/empresa

---

## 📊 **Funcionalidades**

✔️ Cadastro e login  
✔️ Registro de despesas  
✔️ Dashboard financeiro  
✔️ Upload de comprovantes e relatórios  
✔️ Organização por data / semana / período  
✔️ Cálculo automático de totais  
✔️ Visualização simplificada para conferência  
✔️ Exportações e histórico (em construção)  
✔️ Futuro: análise com IA e insights automáticos  

---

## 🧪 **Como rodar o projeto**

### 1️⃣ Clonar o repositório  
git clone https://github.com/rafarisso/gestororion

cd gestororion


### 2️⃣ Instalar dependências  


npm install


### 3️⃣ Criar projeto no Supabase  
- Criar novo projeto  
- Abrir **SQL Editor**  
- Rodar `schema.sql`  
- Criar buckets: `invoices` e `pos_reports`  
- Ativar Auth por email/senha  

### 4️⃣ Criar arquivo `.env`  


VITE_SUPABASE_URL=xxxx
VITE_SUPABASE_ANON_KEY=xxxx


### 5️⃣ Rodar localmente  


npm run dev


---

## 🌐 **Deploy**

O projeto pode ser publicado facilmente no **Netlify**:  
- Build: `npm run build`  
- Pasta: `dist`  

---

## 📚 **Status Atual**

O sistema já funciona para uso interno e está em evolução para:

- Automação de fechamento semanal  
- Gráficos financeiros  
- Insights com IA (OpenAI / Gemini)  
- Módulo de auditoria e reconciliação  
- Multiusuários e multiempresa  

---

## 👨‍💻 **Autor**

**Rafael Risso**  
Engenharia de Dados | Python | SQL | Supabase | IA Generativa  
LinkedIn: https://www.linkedin.com/in/rafaeltrisso  
Portfólio: https://rrsolutions.netlify.app  
Email: risso_rafa@hotmail.com  


## 📦 **Arquitetura do Projeto**

