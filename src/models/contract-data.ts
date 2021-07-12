import mongoose from 'mongoose';
import { connection_feed } from './connections';

export interface StakeHolder {
  address: string;
  stakedAmount:string;
  reputation: number;
  data:any;
}

interface ContractDataAttr {
  stakeHolders: StakeHolder[];
  token: string;
  iRepF: string;
  reputationThreshold: number;
  hostingCompensation: number;
  totalStaked: number;
  minStakeAmount: number;
  maxStakeAmount: number;
  coolOff: number;
  interest: number;
  totalRedeemed: number;
  redeemInterval: number;
  maxEarningsCap: number;
}

interface ContractDataDoc extends mongoose.Document {
  stakeHolders: StakeHolder[];
  token: string;
  iRepF: string;
  reputationThreshold: number;
  hostingCompensation: number;
  totalStaked: number;
  minStakeAmount: number;
  maxStakeAmount: number;
  coolOff: number;
  interest: number;
  totalRedeemed: number;
  redeemInterval: number;
  maxEarningsCap: number;
}


interface ContractDataModel extends mongoose.Model<ContractDataDoc> {
  build(attrs: ContractDataAttr): ContractDataDoc;
}

const contractDataSchema = new mongoose.Schema<ContractDataDoc, ContractDataModel>({
  stakeHolders: { type: Object, required: true },
  token: { type: String, required: true },
  iRepF: { type: String, required: true },
  reputationThreshold: { type: Number, required: true },
  hostingCompensation: { type: Number, required: true },
  totalStaked: { type: Number, required: true },
  minStakeAmount: { type: Number, required: true },
  maxStakeAmount: { type: Number, required: true },
  coolOff: { type: Number, required: true },
  interest: { type: Number, required: true },
  totalRedeemed: { type: Number, required: true },
  redeemInterval: { type: Number, required: true },
  maxEarningsCap: { type: Number, required: true },
  interestPrecision: { type: Number, required: true },
})

contractDataSchema.statics.build = (contractData: ContractDataAttr) => {
  return new ContractData(contractData)
}

contractDataSchema.pre('save', async function (next) {
  if (this.isNew) {
    const exists = await ContractData.findOne({})
    if (exists) throw new Error("ContractData can only have one instance")
  }
  next()
})

const ContractData = connection_feed.model<ContractDataDoc, ContractDataModel>('ContractData', contractDataSchema);

export { ContractData }
