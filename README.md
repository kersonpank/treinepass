# TreinePass

Plataforma de acesso a academias e centros esportivos.

## Tecnologias Utilizadas

- Backend: NestJS + TypeScript
- Frontend: Next.js + TypeScript + TailwindCSS
- Database: PostgreSQL
- Cache: Redis
- Container: Docker + Docker Swarm
- CI/CD: GitHub Actions
- CDN/DNS: Cloudflare

## Estrutura do Projeto

```
treinepass/
├── backend/         # API NestJS
├── frontend/        # Aplicação Next.js
├── docker/          # Configurações Docker
└── docs/           # Documentação
```

## Configuração Inicial

1. Clone o repositório
2. Copie `.env.example` para `.env` e configure as variáveis
3. Execute `docker-compose up -d` para iniciar os serviços
4. Execute `npm install` nas pastas backend e frontend
5. Inicie o desenvolvimento com `npm run dev`

## Documentação

A documentação da API está disponível em `/api/docs` após iniciar o servidor.

## Desenvolvimento

Para iniciar o ambiente de desenvolvimento:

```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend
npm run dev
```

## Produção

O deploy é automatizado via GitHub Actions quando um push é feito para a branch main.

## Licença

MIT
