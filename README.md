# marketplace-order-invoicing

Event-driven marketplace backend with two decoupled microservices (Order Service and Invoice Service) communicating asynchronously via RabbitMQ.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client                                  │
└──────────────────┬──────────────────────────┬───────────────────┘
                   │                          │
                   ▼                          ▼
   ┌───────────────────────┐    ┌───────────────────────┐
   │    Order Service      │    │   Invoice Service     │
   │       :3001           │    │       :3002           │
   │                       │    │                       │
   │  Express + Auth       │    │  Express + Auth       │
   │  Use Cases            │    │  Use Cases            │
   │  Domain (Order)       │    │  Domain (Invoice)     │
   │  MongoDB (orders)     │    │  MongoDB (invoices)   │
   │                       │    │                       │
   │  ┌─────────────────┐  │    │  ┌─────────────────┐  │
   │  │  Outbox Worker  │  │    │  │  Event Consumer │  │
   │  └────────┬────────┘  │    │  └────────▲────────┘  │
   └───────────┼───────────┘    └───────────┼───────────┘
               │                            │
               └────────► RabbitMQ ─────────┘
                        order.events
```

## Tech Stack

- **Runtime** — Node.js 24 + TypeScript 5
- **HTTP** — Express
- **Database** — MongoDB (one DB per service)
- **Messaging** — RabbitMQ
- **Validation** — Zod
- **Testing** — Jest
- **Infrastructure** — Docker + Docker Compose
- **CI** — GitHub Actions

## Services

### Order Service — port 3001

Manages the full order lifecycle with state machine transitions:

```
Created → Accepted → Processing → Shipped
Created → Rejected
```

| Method | Path               | Role             | Description   |
|--------|--------------------|------------------|---------------|
| POST   | /orders            | customer         | Create order  |
| GET    | /orders.           | seller           | List orders.  |
| GET    | /orders/:id.       | seller, customer | Get order.    |
| PATCH  | /orders/:id/status | seller.          | Update status |

### Invoice Service — port 3002

Handles PDF invoice uploads and tracks delivery.

| Method | Path               | Role   | Description        |
|--------|--------------------|--------|--------------------|
| POST   | /invoices          | seller | Upload PDF invoice |
| GET    | /invoices/:orderId | seller | Get invoice        |

## Event Flow

When an order reaches `Shipped` status:

```
1. Order updated to Shipped
2. Outbox event saved (same DB operation — atomic)
3. Worker polls outbox every 5s → publishes to RabbitMQ order.events
4. Invoice Service consumer receives event
5. If invoice exists → sentAt is set
6. If no invoice yet → event is silently ignored
```

## Auth

Simulates an external identity provider (Auth0, Cognito). Each service only verifies JWTs — never issues them. Tokens carry `sub` (user ID) and `role`.

## Local Development

### Prerequisites
- Docker + Docker Compose
- Node.js 24

### Start infrastructure only
```bash
docker compose up mongodb rabbitmq -d
```

### Run services locally
```bash
cd order-service && npm run dev   # terminal 1
cd invoice-service && npm run dev # terminal 2
```

### Run all with Docker
```bash
docker compose up -d --build
```

### Tests
```bash
cd order-service && npm test
cd invoice-service && npm test
```

## Business Decisions

### Single role per token
A user has a single role per token — `seller` or `customer`. A person can hold both roles but not simultaneously. The token represents the context in which the user operates in that session. This simplifies authorization logic and reflects real marketplace which separate buyer and seller modes explicitly.

### Role-based order filtering
`GET /orders` is accessible to both sellers and customers. Filters are derived from the JWT token — a seller sees only their orders, a customer sees only their own. The filter map is role-keyed and extensible: adding a new role (e.g. `admin` with no filter to see all orders) requires a single entry with no changes to the use case or domain.

## Architecture Decisions

### Hexagonal architecture
Domain and application layers have zero knowledge of Express, MongoDB, or RabbitMQ. Only infrastructure depends on external frameworks. Swapping the database or broker requires no changes to business logic.

### Zod schemas as DTOs
Validation schemas live in the use case files and are exported. Controllers import the schema to validate HTTP input and the inferred type as the use case DTO. Single source of truth, no duplication between schema and interface.

### Database per service
Each service owns its MongoDB database. Services never share a database. Data that crosses service boundaries (e.g. `sellerId` on Invoice) is intentionally duplicated as a standard NoSQL pattern that avoids cross-service queries.

### Outbox pattern
Order updates and outbox events are persisted in the same MongoDB operation. A worker publishes events to RabbitMQ asynchronously. Guarantees no events are lost if RabbitMQ is temporarily unavailable.

The current `OutboxEvent` tracks `publishedAt`, `failedAt`, and `retries`. In production we would add `claimedAt` to prevent double-processing when running multiple worker instances.

### Single queue with typed events
All order domain events go to `order.events` with a `type` field. The consumer dispatches to the appropriate handler. Keeps RabbitMQ connections lean and scales naturally as new event types are added instead of multiplying queues per event.

### Consumer idempotency
If `markAsPublished` fails after a successful RabbitMQ publish, the worker may publish the same event twice. The Invoice Service consumer is idempotent (marking an already-sent invoice as sent again has no effect).

### Monorepo structure
Both services live in the same repository but are fully independent (separate `package.json`, `node_modules`, `Dockerfile`, and test suite). No shared code between services. Duplications like `OrderEventType` or auth middleware are intentional — in a larger project with more shared contracts we would introduce npm workspaces with a `shared` package.

## Production Considerations

### Outbox worker
Currently runs inside the Order Service process. In production it would run as a separate process or Lambda for independent scaling.

### Failed outbox events
The outbox worker retries failed events up to 3 times. After that, `failedAt` is set and the event is no longer retried. In production, replace fixed retries with exponential backoff and route failed events to a dead letter queue for manual inspection or reprocessing.

### Atomic transactions
The outbox pattern requires atomicity between the order update and the outbox event save. This requires MongoDB in replica set mode. Currently not enabled locally so the two operations are sequential. In production, wrap both in a MongoDB session transaction.

### Optimistic locking
The `findById` + `update` flow is vulnerable to lost updates under concurrent requests. In production, add a `version` field to the Order entity and verify it on update.

### File storage
PDFs are currently saved to local disk. In production, upload to S3 or GCS and store the URL instead of a file path.

### Auth service
In production, token issuance would be a dedicated Auth Service or delegated to an identity provider. Each microservice verifies tokens using the shared secret or public key.

### Pagination
`GET /orders` currently returns all orders with no limit. In production, add cursor-based or offset pagination to avoid loading unbounded result sets as the order volume grows.

### Cross-service validation
The Invoice Service does not verify that the `orderId` exists in the Order Service before creating an invoice. In production this would be validated either via a synchronous API call or by consuming an `order.created` event.

### Invoice uploaded after order is shipped
If a seller uploads an invoice after the order is already in `Shipped` status, `sentAt` will never be set — the `order.shipped` event was already consumed. In production, `UploadInvoice` would check the current order status and mark the invoice as sent immediately if the order is already shipped.

### Failed event handling
Currently the Invoice Service consumer `nack`s failed messages immediately with `requeue: false`. In production, two layers of resilience would be added: consumer-level retry logic, requeue with backoff up to N times before routing to a Dead Letter Exchange; and a reconciliation job that periodically cross-references outbox events with `publishedAt` set against invoices with `sentAt` null — re-publishing the event to RabbitMQ.

### Health checks
Both `/health` endpoints currently return `{ status: "ok" }` unconditionally. In production they should verify MongoDB and RabbitMQ connectivity before responding — otherwise load balancers and orchestrators like Kubernetes cannot detect a degraded service and will continue routing traffic to it.

### CI/CD
CI runs lint and tests on every push via GitHub Actions. CD would push Docker images to ECR and deploy to ECS or Kubernetes, with a staging → production promotion flow.