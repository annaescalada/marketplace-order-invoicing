import { OutboxRepository } from "../../application/ports/OutboxRepository";
import { RabbitMQOrderPublisher } from "./RabbitMQOrderPublisher";

const POLL_INTERVAL_MS = 5000;

export class OutboxWorker {
  private interval: NodeJS.Timeout | null = null;

  constructor(
    private readonly outboxRepository: OutboxRepository,
    private readonly publisher: RabbitMQOrderPublisher,
  ) { }

  start(): void {
    this.interval = setInterval(() => this.process(), POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.interval) clearInterval(this.interval);
  }

  private async process(): Promise<void> {
    const events = await this.outboxRepository.findPending();

    for (const event of events) {
      try {
        await this.publisher.publish({
          type: event.type,
          orderId: event.aggregateId
        });
        await this.outboxRepository.markAsPublished(event.id);
      } catch {
        await this.outboxRepository.incrementRetries(event.id);
        if (event.retries + 1 >= 3) {
          await this.outboxRepository.markAsFailed(event.id);
        }
      }
    }
  }
}