import { Listener, NotFoundError, Subjects, ExpirationCompleteEvent, OrderStatus } from "@ticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/order";
import { Ticket } from "../../models/ticket";
import { OrderCancelledPublsher as OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { queueGroupName } from "./queue-group-name";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
    queueGroupName: string = queueGroupName;
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;

    async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
        const order = await Order.findById(data.orderId).populate('ticket');

        if(!order){
            throw new Error("Order not found");
        }

        if(order.status === OrderStatus.Complete){
            return msg.ack();
        }

        order.set({status: OrderStatus.Cancelled})
        await order.save();
        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })
        msg.ack();
    }

    
}