// ...existing code...

# marketplace-api —

<p align="center">
  <a href="https://nestjs.com/"><img src="https://nestjs.com/img/logo-small.svg" width="100" alt="NestJS" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js->=18-339933?logo=node.js&logoColor=white" alt="Node" /></a>
  <img src="https://img.shields.io/badge/TypeScript-4.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Docker-optional-2496ED?logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/RabbitMQ-required-FF6600?logo=rabbitmq&logoColor=white" alt="RabbitMQ" />
  <img src="https://img.shields.io/badge/Prometheus-metrics-FE7F2D?logo=prometheus&logoColor=white" alt="Prometheus" />
  <img src="https://img.shields.io/github/actions/workflow/status/owner/repo/ci.yml?label=CI&logo=github" alt="CI" />
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License" />
</p>

Descrição

- Projeto de exemplo em arquitetura de microserviços para um marketplace.
- Componentes principais: API Gateway (proxy + circuit breaker + retry + timeout + fallback/cache), serviços de domínio (users, products, checkout, payments), integração com RabbitMQ e métricas Prometheus.

Badges e Tecnologias

- 🟢 NestJS — framework core
- 🟣 TypeScript — tipagem e segurança
- 🔵 Node.js — runtime
- 🐳 Docker — execução em container (opcional)
- 🐰 RabbitMQ — filas/eventos
- 📈 Prometheus — métricas
- 🔁 RxJS & Axios — chamadas HTTP reativas e cliente HTTP

Como executar (rápido)

```bash
# instalar dependências no nível do monorepo
cd /Users/danielfernandes/Documents/Estudos/projetos/marketplace-api
npm install

# executar serviço exemplo (api-gateway)
cd api-gateway
npm run start:dev
```

Passo a passo de construção (Como foi construído)

1. Planejamento e arquitetura
   - Definiu-se um API Gateway para concentrar autenticação, roteamento e políticas resilientes.
   - Serviços pequenos e desacoplados (users, products, checkout, payments).

2. Escolha de tecnologias
   - NestJS: estrutura modular e integração fácil com interceptors/middlewares.
   - TypeScript: evitar regressões e melhorar refactor.
   - @nestjs/axios + RxJS: chamadas HTTP controladas com firstValueFrom.
   - RabbitMQ para fluxo de eventos (checkout → pagamentos).

3. Implementação do Gateway
   - ProxyService: camada principal que aplica:
     - Circuit Breaker (falhas agrupadas por serviço)
     - Retry com backoff exponencial
     - Timeout customizável por serviço
     - Fallbacks (cache ou mensagem de erro)
   - Tratamento cuidadoso de erros em TypeScript (narrowing de unknown).

4. Resiliência e observabilidade
   - CircuitBreakerService: estados CLOSED/HALF_OPEN/OPEN, thresholds configuráveis.
   - MetricsService: expondo métricas Prometheus (contadores/timers).
   - Logs bem definidos (info/warn/error/debug).

5. Integração de filas
   - PaymentQueueService: valida e publica mensagens em RabbitMQ.
   - Mensagens tipadas; adicionar metadata opcional na interface para rastreabilidade.

6. Testes e CI
   - Unit tests por serviço (Jest).
   - E2E isolados; para integração usar ambientes docker-compose ou mocks.
   - Pipeline CI executa build + testes.

Configuração e variáveis

- Cada serviço tem arquivo de config em src/config.
- Exemplos:
  - PORT=3000
  - NODE_ENV=development
  - RABBITMQ_URI=amqp://guest:guest@localhost:5672

Boas práticas aplicadas

- Tratar `catch(error: unknown)` com narrowing (axios.isAxiosError / instanceof Error).
- Usar nullish coalescing quando ler options (ex.: options.resetTimeout ?? default).
- Tipar mensagens de fila e permitir campos opcionais (metadata?: Record<string, any>).
- Definir timeouts e thresholds alinhados ao SLA dos serviços downstream.

Troubleshooting rápido

- "'error' is of type 'unknown'": fazer narrowing antes de usar propriedades.
- "options.resetTimeout is possibly null or undefined": usar valores padrão via ??.
- "metadata does not exist in type 'PaymentOrderMessage'": adicionar metadata opcional na interface.

Contribuição

- Fork → branch com feature/bugfix → PR com descrição e testes.
- Mantenha padrões de lint e tipagem TypeScript.

Licença

- MIT

Contato

- Projeto de estudos — adaptar conforme necessidade.
