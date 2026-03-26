# 🔗 Encurtador de URLs - Teddy

Sistema de encurtamento de URLs desenvolvido com Node.js, Fastify, TypeScript e PostgreSQL.

## 📋 Funcionalidades

- [ X ] Cadastro de usuários
- [ X ] Autenticação JWT
- [ X ] Encurtamento de URLs (até 6 caracteres)
- [ X ] Listagem de URLs do usuário
- [ X ] Edição de URLs encurtadas
- [ X ] Contagem de acessos
- [ X ] Soft delete (inativação) de URLs
- [ X ] Redirecionamento de URLs encurtadas

## 🛠️ Tecnologias

- **Backend**: Node.js 22.19.0, Fastify, TypeScript
- **Banco de Dados**: PostgreSQL 15
- **ORM**: Prisma
- **Autenticação**: JWT
- **Testes**: Vitest
- **Containerização**: Docker & Docker Compose

## 🚀 Como Rodar o Projeto

### 📋 Pré-requisitos

**Para todos os sistemas:**
- Node.js 22.19.0
- PostgreSQL (para execução local)
- Docker e Docker Compose (para execução automatizada)
- Git

### 🐳 Execução Automatizada com Docker (Recomendado)

Esta é a forma mais simples de rodar o projeto, pois configura automaticamente o banco de dados e a aplicação.

!!! ATENÇÃO !!!

Antes de rodar o comando de ```docker-compose up``` garanta que as portas necessárias a aplicação estejam liberadas

5432 para o banco

3333 para a API

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd encurta
```

3. **Execute com Docker Compose**
```bash
# Inicia todos os serviços (PostgreSQL + API)
docker-compose up -d

# Para ver os logs em tempo real
docker-compose logs -f

# Para parar os serviços
docker-compose down
```
4. **Para rodar local**
- Garanta que a verão do node está correta (NODE v22.19.0)
- Execute o docker-compose que se encontra dentro da pasta docker-local para subir uma versão do banco postgres
- Execute os scrips no terminal dentro da pasta teddy
```bash
# Para instalar dependencias
npm i

# Para executar a criação do banco
npx prisma migrate dev

# Para subir a API
npm run dev
```
6. **Acesse a aplicação**
- Documentação Swagger: http://localhost:3333/docs


### OBS

- Os testes automatizados, não tive tempo de fazer mais, pois foi uma semana corrida de meus compromissos pessoais, para rodar os teste ou ver o coverage de testes no codigo use os comandos

```bash
# Para executar os testes
npm run test

# Para ver o coverage

npm run test:coverage

#A pasta criada com o coverage tem um html para melhor vizualização
```

- O enpoint que recebe o alias (/urls/{alias}) não responde bem ao swagger devido a limitações de redirect do próprio swagger, basta pegar a URL encurtada e colar no navegardor ou postman para que possa ser redirecionado e contabilizar o acesso no banco

- Se for rodar local, apos rodar o automatizado lembre-se de dar stop nos containers criados automaticamente, para não haver concorrencia de portas, ou altere as portas e o nome do container no docker-compose.yml que ira usar.

- Adicionei uma exportação da colection do insomia caso queria testar por lá
