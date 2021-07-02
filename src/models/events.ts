import mongoose from 'mongoose';
import { EventData } from "xdc3-eth-contract"

import { connection_feed } from './connections';


interface EventModel extends mongoose.Model<EventDoc> {
  build(attrs: EventData): EventDoc;
}

interface EventDoc extends mongoose.Document {
  name: string;
  tx_hash: string;
  associated_address: string;
  block: number;
  data: any;
}



const eventSchema = new mongoose.Schema<EventDoc, EventModel>({
  name: { type: String, required: true },
  block: { type: Number, required: true },
  tx_hash: { type: String, required: true, unique: true },
  associated_address: { type: String },
  data: { type: Object, },
});

eventSchema.statics.build = (event: EventData) => {
  return new Event({
    name: event.event,
    block: event.blockNumber,
    data: event.returnValues,
    tx_hash: event.transactionHash,
    associated_address: getAssociatedAddress(event),
  });
};



function getAssociatedAddress(event: EventData) {
  switch (event.event) {
    case 'Staked':
    case 'Unstaked':
    case 'WithdrewStake':
    case 'ClaimedRewards':
    case 'MissedRewards': return event.returnValues.staker;
    default: return ""
  }
}



const Event = connection_feed.model<EventDoc, EventModel>('Event', eventSchema);

export { Event }



