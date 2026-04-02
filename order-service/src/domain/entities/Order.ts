import { AppError } from "../errors";

export enum OrderStatus {
    Created = "Created",
    Accepted = "Accepted",
    Rejected = "Rejected",
    Processing = "Processing",
    Shipped = "Shipped",
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.Created]: [OrderStatus.Accepted, OrderStatus.Rejected],
    [OrderStatus.Accepted]: [OrderStatus.Processing],
    [OrderStatus.Rejected]: [],
    [OrderStatus.Processing]: [OrderStatus.Shipped],
    [OrderStatus.Shipped]: [],
};

export interface OrderProps {
    orderId: string;
    price: number;
    quantity: number;
    productId: string;
    customerId: string;
    sellerId: string;
    status: OrderStatus;
    createdAt: Date;
    updatedAt: Date;
}

export class Order {
    private _status: OrderStatus;
    private _updatedAt: Date;

    constructor(public readonly props: OrderProps) {
        this._status = props.status;
        this._updatedAt = props.updatedAt;
    }

    get status() { return this._status; }
    get updatedAt() { return this._updatedAt; }

    transitionTo(newStatus: OrderStatus): void {
        if (!VALID_TRANSITIONS[this._status].includes(newStatus)) {
            throw new AppError(`Invalid transition: ${this._status} → ${newStatus}`, 422);
        }
        this._status = newStatus;
        this._updatedAt = new Date();
    }

    toObject(): OrderProps {
        return { ...this.props, status: this._status, updatedAt: this._updatedAt };
    }
}