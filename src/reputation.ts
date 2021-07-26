import {
  AddStaker,
  GetAllStaker,
  UpdateAddresReputation,
  RemoveStaker,
} from "./helpers/feed";
import utils from "xdc3-utils";
import { Contact } from "./models/contact";
import { Mirror } from "./models/mirror"
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


    /**
     * 
     * Stakers Contact Method
     * 
     */
    const stakers = (await Contact.find({ reputation: { $gt: minRep } }));

    const dbStakerAddress: string[] = [];

    for (let i = 0; i < stakers.length; i++) {
      const { _id } = stakers[i];
      const data = await Mirror.findOne({ contact: _id }).sort({ created: -1 }).lean();
      dbStakerAddress.push(fromXdcAddress(data?.contract.payment_destination as string).toLowerCase())
    }

    /**
     * 
     * staker: _id:xdc address mapping
     * 
     */
    const staker_address_map = stakers.reduce((acc: { [key: string]: string }, cur, i) => {
      acc[cur._id as string] = dbStakerAddress[i] as string;
      return acc;
    }, {})


    // stakers.map(({ _id }) => utils.fromXdcAddress(FARMER_ADDRESS[_id]).toLowerCase());
    const existingStaker = await GetAllStaker();

    console.log("dbStakerAddress", dbStakerAddress.length);
    console.log("existingStaker", existingStaker.data.length);


    if (existingStaker.status === false) return false;
    existingStaker.data = existingStaker.data.map((x) => x.toLowerCase());
    for (let staker of stakers) {
      const { address, reputation, _id } = staker;
      const wallet = utils.fromXdcAddress(staker_address_map[_id]).toLowerCase();

      const exists = existingStaker.data.includes(wallet)

      global.logger.debug("checking sync for address", wallet, exists)

      if (!exists) {
        global.logger.info("sync: adding", address, wallet);
        const added = await AddStaker(wallet as string, reputation);
        if (added === null) return false;
      } else {
        global.logger.info("sync: updating", address);
        const updated = await UpdateAddresReputation(
          wallet as string,
          reputation
        );
        if (updated === null) return false;
      }
    }

    // const DEFAULT_REP = 200;

    // for (let staker of INITIAL_STAKERS) {
    //   if (!existingStaker.data.includes(fromXdcAddress(staker).toLowerCase())) {
    //     global.logger.info("adding initial-staker", staker);
    //     await AddStaker(staker as string, DEFAULT_REP);
    //   }
    // }

    for (let staker of existingStaker.data) {
      if (dbStakerAddress.includes(fromXdcAddress(staker).toLowerCase()) === false) {
        global.logger.info("sync: removing", staker);
        const removed = await RemoveStaker(staker);
        if (removed === null) return false;
      }
    }

    return true;
  } catch (e) {
    global.logger.error(e);
    console.trace(e);
    // logger.error(e)
    return false;
  }
}
