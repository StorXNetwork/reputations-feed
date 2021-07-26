import mongoose from 'mongoose';
import { connection_storx } from './connections';

interface MirrorDoc extends mongoose.Document {
  created: Date,
  shardHash: string,
  contact: string,
  contract: any,
  token: string,
  isEstablished: boolean,
}

const mirroeSchema = new mongoose.Schema<MirrorDoc, mongoose.Model<MirrorDoc>>({
  name: { type: String, required: true },
  block: { type: Number, required: true },
  tx_hash: { type: String, required: true, unique: true },
  associated_address: { type: String },
  data: { type: Object, },
});

mirroeSchema.index({ contact: 1 })

const Mirror = connection_storx.model<MirrorDoc, mongoose.Model<MirrorDoc>>('Mirror', mirroeSchema);

export { Mirror }