import { Schema } from "mongoose";
import { connection_feed } from "./connections";


interface MintInfo {
  address: string;
  mintAmount: number;
  date:Date;
}

const MintInfoSchema = new Schema<MintInfo>({
  address: {
    type: String,
    required: true,
  },
  mintAmount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
});

const MintInfo = connection_feed.model<MintInfo>("MintInfo", MintInfoSchema);


export { MintInfo }