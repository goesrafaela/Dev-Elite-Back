# API - Plataforma de Eventos

API desenvolvida para uma plataforma de gerenciamento e venda de ingressos para eventos.

O projeto permite criar eventos, cadastrar locais e assentos, realizar reservas, simular pagamentos, gerar ingressos com QR Code e validar a entrada dos participantes na portaria.

Também foi integrada a API da Ticketmaster para consulta de eventos externos.

---

## Tecnologias utilizadas

- Node.js
- TypeScript
- Express
- Prisma ORM
- PostgreSQL
- JWT
- Zod
- bcrypt
- QR Code
- Ticketmaster Discovery API

---

## Funcionalidades

### Autenticação

- Login de usuários
- Autenticação utilizando JWT
- Controle de acesso por perfil
- Senha armazenada com hash utilizando bcrypt

Existem três perfis principais:

- `CLIENT` - usuário que compra ingressos
- `ORGANIZER` - usuário responsável pela criação e gerenciamento de eventos
- `GATE` - usuário responsável pela validação dos ingressos na entrada

---

### Eventos

Os organizadores podem:

- Criar eventos
- Definir local
- Definir data e horário
- Definir tipo do evento
- Publicar eventos
- Cancelar eventos

Os eventos possuem estados como:

- `DRAFT`
- `PUBLISHED`
- `CANCELLED`
- `FINISHED`

---

### Locais e assentos

É possível cadastrar:

- Locais
- Endereço
- Capacidade
- Assentos
- Fileira
- Número
- Seção

Os assentos são vinculados ao local e depois disponibilizados para os eventos.

---

### Reservas

Clientes podem realizar reservas para eventos publicados.

O sistema controla a disponibilidade dos assentos e evita que o mesmo assento seja reservado por mais de uma pessoa.

As reservas possuem prazo de expiração e estados como:

- `PENDING`
- `CONFIRMED`
- `EXPIRED`
- `CANCELLED`

---

### Pagamento

O pagamento foi implementado inicialmente de forma simulada.

Quando o pagamento é aprovado:

1. A reserva é confirmada.
2. Os assentos são marcados como vendidos.
3. Os ingressos são gerados automaticamente.
4. Cada ingresso recebe um código único.
5. Cada ingresso recebe um token de compartilhamento.

Também existe o fluxo de pagamento recusado.

---

### Ingressos

Cada ingresso possui:

- Código único
- Token de compartilhamento
- Evento
- Assento
- Tipo do ingresso
- Status

Os ingressos podem ser consultados pelo usuário e também possuem um QR Code.

O QR Code é gerado a partir do código do ingresso.

---

### Check-in

O perfil `GATE` pode validar os ingressos na entrada do evento.

Durante a validação o sistema verifica:

- Se o ingresso existe
- Se o ingresso foi cancelado
- Se o ingresso já foi utilizado
- Se o ingresso está válido

Depois da validação, o ingresso passa de:

`VALID`

para:

`USED`

Também é registrado o check-in com a data, horário e usuário responsável pela validação.

---

### Ticketmaster

A API possui integração com a Ticketmaster Discovery API.

É possível:

- Buscar eventos
- Filtrar por palavra-chave
- Filtrar por cidade
- Filtrar por estado
- Consultar detalhes de um evento específico

Exemplos:

### Eventos

GET /ticketmaster/events
GET /ticketmaster/events?keyword=rock
GET /ticketmaster/events?city=Sao Paulo
GET /ticketmaster/events/:id

---

## A chave do Ticketmaster fica no .env que esta armazenado no gitignore

# Executando o projeto

1. Pré-requisitos

É necessário ter instalado:

Node.js
PostgreSQL
npm

2. Instalar as dependências

Dentro da pasta da API: npm install

3. Configurando o .env

## Exemplo

DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/eventos?schema=public"

PORT=3000

JWT_SECRET="uma-chave-secreta-de-desenvolvimento"
JWT_EXPIRES_IN="1d"

TICKETMASTER_API_KEY="SUA_API_KEY"
TICKETMASTER_BASE_URL="https://app.ticketmaster.com/discovery/v2"

- TICKETMASTER_API_KEY é obtida através do portal de desenvolvedores da Ticketmaster

4. Configuração do banco
   Depois de deixar rodando o PostgreSQL execute:
   npx prisma generate

## Migrations

npx prisma migrate dev

## Vizualizar banco

npx prisma studio

5. Iniciando a API
   npm run dev

   ## API disponível em http://localhost:3000

### PARA FACILITAR CRIEI 3 USUÁRIOS

# Usuários para teste

Para facilitar a avaliação do projeto, já existem usuários de teste para os três principais perfis da plataforma.

## Organizador

Perfil:

## Organizer

"email": "ana@email.com",
"password": "1234567",

## Client

"email": "lucas@email.com",
"password": "1234567",

## Gate

"email": "Pedro@email.com",
"password": "1234567",
