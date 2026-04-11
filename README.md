# marketplace-api — README (PT-BR)

Resumo
Aplicação de exemplo em arquitetura de microserviços para um marketplace. Contém um API Gateway (proxy com circuit breaker, retry, timeout e fallback), serviços como users/checkout/payments/products, integração com RabbitMQ para filas e métricas (Prometheus).

Estrutura do repositório (exemplo)

- api-gateway/ — gateway que expõe e encaminha requisições
  - src/proxy/service/proxy.service.ts
  - src/common/circuit-breaker/circuit-breaker.service.ts
- checkout-service/ — lógica de checkout e publicação em fila
  - src/events/payment-queue/payment-queue.service.ts
- users-service/, products-service/, payments-service/ — microserviços de domínio
- README.md — este arquivo

Requisitos

- Node.js >= 16 (recomendado >= 18)
- npm ou yarn
- RabbitMQ (se usar filas)
- Docker (opcional)

Instalação (macOS / terminal)

```bash
cd /Users/danielfernandes/Documents/Estudos/projetos/marketplace-api
npm install
# ou por serviço
cd api-gateway && npm install
```

Scripts úteis

- npm run start — iniciar
- npm run start:dev — modo desenvolvimento com watch
- npm run build — compilar TypeScript
- npm run test — testes unitários
- npm run test:e2e — testes end-to-end
- npm run test:cov — cobertura

Execução local (exemplo)

```bash
# rodar um serviço (ex.: api-gateway)
cd api-gateway
npm run start:dev
```

Configuração / variáveis de ambiente

- Cada serviço possui sua própria configuração em src/config (ex.: serviceConfig).
- Exemplos de variáveis:
  - PORT=3000
  - NODE_ENV=development
  - RABBITMQ_URI=amqp://guest:guest@localhost:5672

Como o Gateway funciona (visão rápida)

- ProxyService faz chamadas HTTP para serviços configurados em serviceConfig.
- Cabeçalhos do usuário são propagados: x-user-id, x-user-email, x-user-role.
- Usa @nestjs/axios + RxJS (firstValueFrom) para requests.
- Possui camadas: Circuit Breaker → Retry → Timeout → Execução → Fallback/Cache.

Boas práticas e observações importantes

- Ajuste timeouts e thresholds conforme os SLAs dos serviços downstream.
- Teste cenários de erro (timeouts, 5xx) para validar fallback e cache.
- Use logs e métricas para monitorar comportamento e saúde dos circuit breakers.

Problemas comuns e soluções rápidas

1. Erro TypeScript: "'error' is of type 'unknown'"

- Motivo: TypeScript tipa o catch como unknown. Não acesse propriedades diretamente.
- Solução: fazer narrowing antes de usar o erro. Exemplo (no ProxyService):

```ts
import axios from "axios";
import type { AxiosError } from "axios";

try {
  // ...
} catch (error: unknown) {
  if (axios.isAxiosError(error)) {
    // tratamento para AxiosError
    const status = error.response?.status ?? 502;
    throw new HttpException(error.response?.data ?? error.message, status);
  }
  if (error instanceof Error) {
    throw new InternalServerErrorException(error.message);
  }
  throw new InternalServerErrorException("Erro desconhecido");
}
```

2. Erro: "options.resetTimeout is possibly null or undefined"

- Motivo: opções podem não conter a propriedade.
- Solução: usar valores padrão / nullish coalescing. Exemplo (CircuitBreakerService):

```ts
const resetTimeout = options.resetTimeout ?? this.defaultOptions.resetTimeout!;
circuit.nextAttemptTime = Date.now() + resetTimeout;
```

- Outra opção: validar e lançar se faltar configuração.

3. Erro: "Object literal may only specify known properties, and 'metadata' does not exist in type 'PaymentOrderMessage'"

- Motivo: você adicionou `metadata` ao objeto, mas a interface não define essa propriedade.
- Solução: atualizar a interface PaymentOrderMessage para incluir metadata opcional. Exemplo:

```ts
// checkout-service/src/events/payment-queue/payment-queue.interface.ts
export interface PaymentOrderMessage {
  orderId: string;
  userId: string;
  amount: number;
  items: Array<{ productId: string; quantity: number }>;
  createdAt?: Date | string;
  metadata?: Record<string, any>;
}
```

Health checks e monitoramento

- Implemente endpoints /health nos serviços.
- Configure o gateway para checar saúde dos serviços downstream (timeout curto).
- Exporte métricas Prometheus (counts, latências, mensagens de fila).

Debug e desenvolvimento

- Use logs detalhados em desenvolvimento (logger.debug).
- Simule falhas (forçar 5xx ou timeout) para validar circuit breaker, retry e fallback.
- Para e2e tests, prefira mocks ou ambientes controlados dos serviços downstream.

Contribuição

- Abra issues para bugs/feature requests.
- Faça PRs com descrição clara e testes quando aplicável.
- Siga padrões TypeScript e trate sempre `unknown`/tipagens opcionais.

Licença

- MIT

Contato

- Projeto de estudos — adapte conforme necessário para
