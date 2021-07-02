import mongoose from "mongoose"
import { connection_feed } from "./connections"
import { TransactionReceipt } from 'xdc3-core';
import { toXdcAddress } from 'xdc3-utils';

interface ClaimCronAttr {
  staker: string;
  invocation_time: Date;
  receipt: TransactionReceipt | null;
  status: boolean;
}

interface ClaimCronDocument extends mongoose.Document {
  staker: string;
  invocation_time: Date;
  receipt: TransactionReceipt | null;
  status: boolean;
  active: boolean;
}

interface ClaimCronModel extends mongoose.Model<ClaimCronDocument> {
  build(attr: ClaimCronAttr): ClaimCronDocument
}

const claimAddressSchema = new mongoose.Schema<ClaimCronDocument, ClaimCronModel>({
  staker: { type: String, required: true },
  invocation_time: { type: Date, required: true }, 
  status: { type: Boolean, required: true },
  receipt: { type: Object },
  active: { type: Boolean, required: true },
})

claimAddressSchema.statics.build = (attr: ClaimCronAttr) => {
  return new ClaimCron({
    staker: toXdcAddress(attr.staker), 
    invocation_time: attr.invocation_time,
    status: attr.status,
    receipt: attr.receipt,
    active: true
  })
}

const ClaimCron = connection_feed.model<ClaimCronDocument, ClaimCronModel>('ClaimCron', claimAddressSchema)

export { ClaimCron }
