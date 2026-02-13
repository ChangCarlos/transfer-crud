# Transfer CRUD - API de Transferências de Carteira

[![Testes](https://img.shields.io/badge/testes-23%20passando-brightgreen)](.) [![Cobertura](https://img.shields.io/badge/cobertura-98.34%25-brightgreen)](.)

Uma API robusta de transferências de carteira construída com TypeScript, com idempotência, bloqueio otimista e contabilidade de dupla entrada.

[🇺🇸 English Version](./README.md)

## 🚀 Funcionalidades

- **Gerenciamento de Carteiras**: Criar carteiras e consultar saldos
- **Transferências Seguras**: Transferir fundos entre carteiras com idempotência
- **Contabilidade de Dupla Entrada**: Entradas de razão imutáveis para todas as transações
- **Bloqueio Otimista**: Proteção contra condições de corrida usando controle de versão
- **Idempotência**: Previne operações duplicadas com cache de chaves de 24 horas
- **Testes Abrangentes**: 98,34% de cobertura de código com 23 testes
- **Pronto para Produção**: Tratamento de erros, validação e cabeçalhos de segurança

## ⚠️ Aviso Importante

**Este é um projeto de aprendizado/portfólio** projetado para demonstrar padrões profissionais em sistemas de carteira:
- ✅ Idempotência e proteção contra condições de corrida
- ✅ Contabilidade de dupla entrada e integridade transacional
- ✅ Testes abrangentes e documentação
- ❌ **Sem autenticação/autorização** (intencionalmente omitido para focar nos padrões principais)

**Para uso em produção**, você precisaria adicionar:
- Autenticação JWT/OAuth
- Validação de propriedade de usuário (garantir que usuários acessem apenas suas próprias carteiras)
- Rate limiting por usuário
- Logging de auditoria com IDs de usuário
- RBAC (Controle de Acesso Baseado em Funções)

**Perfeito para**: Portfólio, aprendizado, entrevistas técnicas, ou como template inicial.

## 🏗️ Stack Tecnológica

- **Runtime**: Node.js + TypeScript
- **Framework**: Express 5.x
- **Banco de Dados**: PostgreSQL 15 + Prisma ORM 7.x
- **Cache**: Redis 7
- **Testes**: Jest + Supertest
- **Validação**: Zod
- **Segurança**: Helmet + CORS

## 📋 Pré-requisitos

- Node.js >= 18
- pnpm >= 8
- Docker & Docker Compose (para os bancos de dados)

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-seu-repo>
cd transfer-crud
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

4. **Inicie os bancos de dados com Docker**
```bash
pnpm docker:up
```

5. **Execute as migrações**
```bash
pnpm prisma:migrate
```

6. **Popule o banco de dados (opcional)**
```bash
pnpm prisma:seed
```

## 🎯 Executando o Projeto

### Modo Desenvolvimento
```bash
pnpm dev
```
Servidor rodando em `http://localhost:3000`

### Build de Produção
```bash
pnpm build
pnpm start
```

### Testes
```bash
# Executar todos os testes
pnpm test

# Modo watch
pnpm test:watch
```

### Gerenciamento do Banco de Dados
```bash
# Prisma Studio
pnpm prisma:studio

# Gerar Prisma Client
pnpm prisma:generate

# Criar migração
pnpm prisma:migrate
```

## 📡 Endpoints da API

### Health Check
```http
GET /health
```
**Resposta**: `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-02-13T10:30:00.000Z"
}
```

### Criar Carteira
```http
POST /wallet
Content-Type: application/json

{
  "ownerId": "user-123"
}
```
**Resposta**: `201 Created`
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "ownerId": "user-123",
  "version": 1,
  "createdAt": "2026-02-13T10:30:00.000Z",
  "updatedAt": "2026-02-13T10:30:00.000Z"
}
```

### Consultar Saldo da Carteira
```http
GET /wallet/:id/balance
```
**Resposta**: `200 OK`
```json
{
  "balance": 1000.50
}
```

### Transferir Fundos
```http
POST /transfer
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "fromWalletId": "550e8400-e29b-41d4-a716-446655440000",
  "toWalletId": "660e8400-e29b-41d4-a716-446655440001",
  "amount": 100
}
```
**Resposta**: `200 OK`
```json
{
  "success": true,
  "transactionId": "770e8400-e29b-41d4-a716-446655440002"
}
```

**Importante**: O cabeçalho `Idempotency-Key` é obrigatório e deve ser um UUID v4 válido. Isso previne transferências duplicadas se a requisição for reprocessada.

## 🛡️ Recursos de Segurança

### Idempotência
- Chaves UUID v4 geradas pelo cliente
- Cache Redis de 24 horas
- Previne operações duplicadas em caso de retry

### Bloqueio Otimista
- Controle de concorrência baseado em versão
- Bloqueio de carteiras remetente e destinatária
- Previne condições de corrida e gasto duplo

### Contabilidade de Dupla Entrada
- Entradas de razão imutáveis
- Trilha de auditoria para todas as transações
- Valores negativos para débitos, positivos para créditos

### Validação de Entrada
- Validação de esquema com Zod
- Verificação de formato UUID
- Validações de valor e campos

## 🧪 Testes

O projeto inclui testes abrangentes cobrindo:

- **API de Carteira** (9 testes)
  - Operações CRUD
  - Regras de validação
  - Cálculos de saldo
  
- **API de Transferência** (12 testes)
  - Transferências bem-sucedidas
  - Verificações de idempotência
  - Saldo insuficiente
  - Carteiras inexistentes
  - Transferências concorrentes
  - Integridade de dupla entrada
  
- **Tratamento de Erros** (2 testes)
  - Erros genéricos
  - Erros do Prisma

**Cobertura**: 98,34% statements, 88,88% branches, 100% functions

## 📁 Estrutura do Projeto

```
transfer-crud/
├── prisma/
│   ├── migrations/          # Migrações do banco de dados
│   ├── schema.prisma        # Schema do banco de dados
│   └── seed.ts             # Script de seed
├── src/
│   ├── modules/
│   │   ├── transfer/       # Lógica de transferência
│   │   └── wallet/         # Lógica de carteira
│   ├── shared/
│   │   ├── cache/          # Client Redis
│   │   ├── database/       # Client Prisma
│   │   ├── errors/         # Erros customizados
│   │   ├── logger/         # Logging
│   │   └── middlewares/    # Middlewares Express
│   ├── app.ts              # App Express
│   └── server.ts           # Entry point do servidor
├── tests/                  # Arquivos de teste
├── docker-compose.yml      # Containers de banco de dados
└── tsconfig.json          # Configuração TypeScript
```

## 🔍 Decisões de Arquitetura

### Por que Contabilidade de Dupla Entrada?
Cria uma trilha de auditoria imutável. Cada transferência gera duas entradas de razão (débito e crédito), facilitando o rastreamento de todas as transações e garantindo a integridade do saldo.

### Por que Bloqueio Otimista?
Previne condições de corrida sem bloqueios. Números de versão garantem que atualizações concorrentes falhem rapidamente, protegendo contra gasto duplo enquanto mantém alto throughput.

### Por que Redis para Idempotência?
Verificações em memória rápidas previnem processamento duplicado. TTL de 24 horas equilibra segurança e uso de memória.

### Por que o Padrão de Adapter do Prisma 7.x?
O Prisma 7.x requer adaptadores de banco de dados explícitos. Usar `@prisma/adapter-pg` com `pg` Pool fornece melhor gerenciamento de conexões e type safety.

## 🐛 Códigos de Erro

| Status | Descrição |
|--------|-----------|
| 400 | Bad Request - Erro de validação |
| 404 | Not Found - Carteira não existe |
| 409 | Conflict - Constraint única ou falha de bloqueio otimista |
| 500 | Internal Server Error |

## 📝 Licença

ISC

## 👤 Autor

Construído como um projeto prático para aprender padrões profissionais em aplicações CRUD.

---

**Nota**: Este projeto demonstra padrões profissionais incluindo idempotência, bloqueio otimista, contabilidade de dupla entrada, testes abrangentes e melhores práticas de segurança.
