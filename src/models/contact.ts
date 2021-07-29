import { Schema } from "mongoose";
import { connection_storx } from "./connections";


interface Contact {
  address: string;
  reputation: number;
  port: number;
  protocol: string;
  ip: string;
  responseTime: number;
  paymentAddress:string;
}

const ContactSchema = new Schema<Contact>({
  _id: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  wallet: {
    type: String,
    required: false,
  },
  port: {
    type: Number,
    required: true,
  },
  lastSeen: {
    type: Date,
    required: true,
  },
  reputation: {
    type: Number,
    required: false,
  },
  ip: {
    type: String,
    required: false,
  },
  lastTimeout: {
    type: Date,
    required: false,
  },
  timeoutRate: {
    type: Number,
    required: false,
  },
  responseTime: {
    type: Number,
    required: false,
  },
  lastContractSent: {
    type: Number,
    required: false,
  },
  spaceAvailable: {
    type: Boolean,
    required: false,
  },
  protocol: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
    required: false,
  },
  paymentAddress: {
    type: String
  }
});

const Contact = connection_storx.model<Contact>("Contact", ContactSchema);


export { Contact }