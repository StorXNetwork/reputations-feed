import mongoose from 'mongoose';
import { connection_storx } from './connections';

const userSchema = new mongoose.Schema<any, mongoose.Model<any>>({
  _id: String
});

const User = connection_storx.model<any, mongoose.Model<any>>('User', userSchema);

export { User }