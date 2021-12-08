import {
  AddStaker,
  GetAllStaker,
  UpdateAddresReputation,
  RemoveStaker,
} from "./helpers/feed";
import utils from "xdc3-utils";
import Xdc3 from "xdc3";
import { NETWORK, REPUTATION_CONTRACT_ADDRESS, ACCOUNT } from './config';

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

    // const stakerLength = stakers.length;
    const stakerLength = 50

    const contractData = await ContractData.findOne();
    console.log(`Current Stakers Length ${stakerLength}`)
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
console.log("end of first loop")
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

    let stakeHolders = {}
    if (contractData) {
      stakeHolders = (contractData).stakeHolders as any;
    }

    let counter = 0;
       // get txCount here 
       const xdc3 = new Xdc3(new Xdc3.providers.WebsocketProvider(NETWORK.ws));
       let nonceCount = await xdc3.eth.getTransactionCount(ACCOUNT.address);
       console.log(`Currennt Nonce ${nonceCount}`)
       const updated = await UpdateAddresReputation(
        filteredStakers
      );
    // for (let staker of filteredStakers) {
    //   try {
    //     const { address, reputation, _id } = staker;
    //     const wallet = utils.fromXdcAddress(staker_address_map[_id]).toLowerCase();
    //     const stakedAmount = utils.fromWei(stakeHolders[wallet].stake.stakedAmount as string);
    //     const exists = existingStaker.data.includes(wallet)
    //     global.logger.debug("checking sync for address", wallet, exists)

    //     // if (parseFloat(stakedAmount) < 3000 && reputation < 2000) {
    //     //   global.logger.info("sync: ban", address, wallet, reputation, " rep. update to 0");
    //     //   const updated = await UpdateAddresReputation(
    //     //     wallet as string,
    //     //     0
    //     //   );
    //     //   if (updated === null) {
    //     //     global.logger.debug("error in sync stakers for staker", wallet, "while updated");
    //     //   };
    //     //   continue;
    //     // }
    //     counter = counter + 1;
    //     if(counter >= 100){
    //       sleep(2000);
    //       counter = 0;
    //     }
    //     if (!exists) {
    //       global.logger.info("sync: adding", address, wallet);
    //       const added = await AddStaker(wallet as string, reputation);
    //       if (added === null) {
    //         global.logger.debug("error in sync stakers for staker", wallet, "while adding");
    //         continue;
    //       };
    //     } else {
    //       // counter = counter + 1;
    //       // if(counter >= 10){
    //       //   sleep(2000);
    //       //   counter = 0;
    //       // }
    //       global.logger.info("sync: updating", address, wallet, reputation,nonceCount);
    //       const updated = await UpdateAddresReputation(
    //         wallet as string,
    //         reputation,
    //         nonceCount
    //       );
    //       if (updated === null) {
    //         global.logger.debug("error in sync stakers for staker", wallet, "while updated");
    //         continue;
    //       };
    //     }
    //     nonceCount = nonceCount +1
    //     // plus one here
    //   }
    //   catch (e) {
    //     global.logger.debug("error in sync stakers for staker", staker, e)
    //     continue;
    //   }
    // }

    // const DEFAULT_REP = 200;

    // for (let staker of INITIAL_STAKERS) {
    //   if (!existingStaker.data.includes(fromXdcAddress(staker).toLowerCase())) {
    //     global.logger.info("adding initial-staker", staker);
    //     await AddStaker(staker as string, DEFAULT_REP);
    //   }
    // }

    // for (let staker of existingStaker.data) {
    //   if (dbStakerAddress.includes(fromXdcAddress(staker).toLowerCase()) === false) {
    //     global.logger.info("sync: removing", staker);
    //     const removed = await RemoveStaker(staker);
    //     if (removed === null) return false;
    //   }
    // }

    return true;
  } catch (e) {
    global.logger.error(e);
    console.trace(e);
    // logger.error(e)
    return false;
  }
}

function sleep(milliseconds: any) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
  console.log("Waited 2 Seconds")
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
