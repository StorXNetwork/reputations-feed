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
import { ContractData } from "./models/contract-data";


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
    const stakers = (await Contact.find({ reputation: { $gt: minRep } }).sort({ reputation: 1 }).lean());

    const dbStakerAddress: string[] = [];
    const staker_address_map: { [key: string]: string } = {}

    const address_to_contact: { [key: string]: Contact } = {}

    const stakerLength = stakers.length;

    const contractData = await ContractData.findOne();

    for (let i = 0; i < stakerLength; i++) {
      const { _id } = stakers[i];
      const contactData = await Contact.findOne({ _id: _id }).sort({ lastSeen: -1 });

      let wallet;
      if (contactData && contactData.paymentAddress) {
        wallet = fromXdcAddress(contactData.paymentAddress).toLowerCase();
        if (contractData && contractData.stakeHolders[wallet]) {
          contractData.stakeHolders[wallet] = { ...contractData.stakeHolders[wallet], contact: _id }
        }
        global.logger.debug("SyncStakers: wallet - contact", wallet, `${i + 1} of ${stakerLength}`);

      } else {
        const data = await Mirror.findOne({ contact: _id }).sort({ created: -1 }).lean();

        if (data && data.contract && data.contract.payment_destination) {
          wallet = fromXdcAddress(data?.contract.payment_destination as string).toLowerCase();
          if (contractData && contractData.stakeHolders[wallet]) {
            contractData.stakeHolders[wallet] = { ...contractData.stakeHolders[wallet], contact: _id }

          }

          global.logger.debug("SyncStakers: wallet - mirror", wallet, `${i + 1} of ${stakerLength}`);
        }
        else continue

      }

      if (address_to_contact[wallet]) {

        const oldDate = new Date(address_to_contact[wallet].lastSeen);
        const currDate = new Date(contactData?.lastSeen as Date);

        if (currDate.getTime() > oldDate.getTime()) {
          // has better lastSeen, this will be considered as the latest contact for the wallet.
          address_to_contact[wallet] = { ...stakers[i] };
          staker_address_map[_id] = wallet;
        }

      } else {
        address_to_contact[wallet] = { ...stakers[i] };

        dbStakerAddress.push(wallet)
        staker_address_map[_id] = wallet;
      }
    }

    contractData && await contractData.markModified("stakeHolders");
    contractData && await contractData.save();

    const filteredStakers = Object.keys(address_to_contact).map((x: string): Contact => address_to_contact[x]).sort((a, b) => a.reputation - b.reputation);

    /**
     * 
     * staker: _id:xdc address mapping
     * 
     */


    // stakers.map(({ _id }) => utils.fromXdcAddress(FARMER_ADDRESS[_id]).toLowerCase());
    const existingStaker = await GetAllStaker();

    console.log("dbStakerAddress", dbStakerAddress.length);
    console.log("existingStaker", existingStaker.data.length);


    console.log("filteredStakers", filteredStakers.length);
    console.log("stakers", stakers.length);

    if (existingStaker.status === false) return false;
    existingStaker.data = existingStaker.data.map((x) => x.toLowerCase());

    const stakeHolders = contractData.stakeHolders as any;
    
    for (let staker of filteredStakers) {
      try {
        const { address, reputation, _id } = staker;
        const wallet = utils.fromXdcAddress(staker_address_map[_id]).toLowerCase();
        const stakedAmount = stakeHolders[wallet].stakedAmount as string;
        const exists = existingStaker.data.includes(wallet)
        global.logger.debug("checking sync for address", wallet, exists)

        if (parseFloat(stakedAmount) < 3000 && reputation < 2000) {
          global.logger.info("sync: ban", address, wallet, reputation, " rep. update to 0");
          const updated = await UpdateAddresReputation(
            wallet as string,
            0
          );
          if (updated === null) {
            global.logger.debug("error in sync stakers for staker", wallet, "while updated");
          };
          continue;
        }

        if (!exists) {
          global.logger.info("sync: adding", address, wallet);
          const added = await AddStaker(wallet as string, reputation);
          if (added === null) {
            global.logger.debug("error in sync stakers for staker", wallet, "while adding");
            continue;
          };
        } else {
          global.logger.info("sync: updating", address, wallet, reputation);
          const updated = await UpdateAddresReputation(
            wallet as string,
            reputation
          );
          if (updated === null) {
            global.logger.debug("error in sync stakers for staker", wallet, "while updated");
            continue;
          };
        }
      }
      catch (e) {
        global.logger.debug("error in sync stakers for staker", staker, e)
        continue;
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

/**
 *

    const parsedAddress: { [key: string]: Contact } = {};


    allstakers.reduce((acc: Contact[], cur: Contact): Contact[] => {
      if (cur.paymentAddress && parsedAddress[cur.paymentAddress]) {
        const currentLastSeen = new Date(cur.lastSeen);
        const oldLastSeen = new Date(parsedAddress[cur.paymentAddress].lastSeen);
        if (currentLastSeen.getTime() > oldLastSeen.getTime()) {
          parsedAddress[cur.paymentAddress] = cur;
        }
      }
      return acc;
    }, [])


 *
 *
 */



// Contact.find({ reputation: { $gt: 1 } }).sort({ reputation: 1 }).then(allstakers => {
//   const parsedAddress = allstakers.reduce((acc: { [key: string]: Contact }, cur: Contact): { [key: string]: Contact } => {
//     if (cur.paymentAddress && acc[cur.paymentAddress]) {
//       const currentLastSeen = new Date(cur.lastSeen);
//       const oldLastSeen = new Date(acc[cur.paymentAddress].lastSeen);
//       if (currentLastSeen.getTime() > oldLastSeen.getTime()) {
//         acc[cur.paymentAddress] = cur;
//       }
//     } else {
//       acc[cur.paymentAddress] = cur;
//     }
//     return acc;
//   }, {});

//   console.log("parsedAddress", parsedAddress);

// })


    // const parsedAddress: { [key: string]: Contact } = {};


    // allstakers.reduce((acc: Contact[], cur: Contact): Contact[] => {
    //   if (cur.paymentAddress && parsedAddress[cur.paymentAddress]) {
    //     const currentLastSeen = new Date(cur.lastSeen);
    //     const oldLastSeen = new Date(parsedAddress[cur.paymentAddress].lastSeen);
    //     if (currentLastSeen.getTime() > oldLastSeen.getTime()) {
    //       parsedAddress[cur.paymentAddress] = cur;
    //     }
    //   }
    //   return acc;
    // }, [])
