import { Schema, model, connect } from "mongoose";
import { ACCOUNT, INITIAL_STAKERS, FARMER_ADDRESS } from './config';
import {
  IsStaker,
  AddStaker,
  GetAllStaker,
  UpdateAddresReputation,
  RemoveStaker,
} from "./helpers/feed";
import utils from "xdc3-utils";
import { Contact } from "./models/contact";
import { fromXdcAddress } from 'xdc3-utils';


interface Reputation {
  address: string;
  reputation: number;
}


export async function GetReputation(minRep: number = 0): Promise<Reputation[]> {
  const resp = await Contact.find({ reputation: { $gte: minRep } });
  return resp;
}

export async function SyncStakers(minRep: number = 0): Promise<boolean> {
  try {
    const stakers = (await Contact.find({ reputation: { $gt: minRep } })).filter(({ _id }) => Object.keys(FARMER_ADDRESS).includes(_id));

    const dbStakerAddress = stakers.map(({ _id }) => utils.fromXdcAddress(FARMER_ADDRESS[_id]).toLowerCase());
    const existingStaker = await GetAllStaker();

    console.log("dbStakerAddress", dbStakerAddress);
    console.log("existingStaker", existingStaker);


    INITIAL_STAKERS.forEach(staker => {
      dbStakerAddress.push(utils.fromXdcAddress(staker).toLowerCase())
    })


    if (existingStaker.status === false) return false;
    existingStaker.data = existingStaker.data.map((x) => x.toLowerCase());
    for (let staker of stakers) {
      const { address, reputation, _id } = staker;
      const wallet = utils.fromXdcAddress(FARMER_ADDRESS[_id]).toLowerCase();

      if (!existingStaker.data.includes(wallet)) {
        console.log("sync: adding", address);
        const added = await AddStaker(wallet as string, reputation);
        if (added === null) return false;
      } else {
        console.log("sync: updating", address);
        const updated = await UpdateAddresReputation(
          wallet as string,
          reputation
        );
        if (updated === null) return false;
      }
    }

    const DEFAULT_REP = 200;

    for (let staker of INITIAL_STAKERS) {
      if (!existingStaker.data.includes(fromXdcAddress(staker).toLowerCase())) {
        console.log("adding initial-staker", staker);
        await AddStaker(staker as string, DEFAULT_REP);
      }
    }

    for (let staker of existingStaker.data) {
      if (dbStakerAddress.includes(fromXdcAddress(staker).toLowerCase()) === false) {
        console.log("sync: removing", staker);
        const removed = await RemoveStaker(staker);
        if (removed === null) return false;
      }
    }

    return true;
  } catch (e) {
    console.trace(e);
    // logger.error(e)
    return false;
  }
}
