import mongoose from 'mongoose';
import { STORX_DB_URI, FEED_DB_URI } from '../config'

export const connection_storx = mongoose.createConnection(STORX_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export const connection_feed = mongoose.createConnection(FEED_DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});