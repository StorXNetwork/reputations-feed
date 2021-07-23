import Xdc3 from "xdc3"
import { AbiItem, toHex, hexToNumber, fromXdcAddress, toXdcAddress } from 'xdc3-utils';
import { EventData } from "xdc3-eth-contract"

import { Event } from "../models/events"

import ReputationFeedABI from "../ABI/ReputationFeed.json"
import StorxABI from "../ABI/Storx.json"

import StakingABI from "../ABI/Staking.json"
import { ContractData } from "../models/contract-data";
import { REPUTATION_CONTRACT_ADDRESS, STAKING_CONTRACT_ADDRESS, NETWORK, INITIAL_BLOCK } from '../config';


import { ConnectionObject, ReconnectableEvent, ReconnectableXdc3 } from '../classes/ReconnectableEvent';
import { ClaimAddressCron } from '../classes/ClaimAddressCron';
import { Contact } from "../models/contact";
import { Mirror } from "../models/mirror"
import { MailEvent } from "../helpers/mailer";

const jober = new ClaimAddressCron({ "ws": NETWORK.ws })

const XdcObject = new ReconnectableXdc3(NETWORK.ws);

// setTimeout(() => {
//   XdcObject.disconnect()
// }, 10000)

setInterval(async () => {
  const status = await XdcObject.status;
  global.logger.debug("status-xdc3:engine::", status);
}, 15000)


async function sync() {
  try {
    const xdc3 = XdcObject.get_xdc3
    const contract = new xdc3.eth.Contract(StakingABI as AbiItem[], STAKING_CONTRACT_ADDRESS)

    let lastSyncBlock = 0;
    const lastEvent = await Event.findOne({}).sort({ block: -1 });
    const latestBlock = await xdc3.eth.getBlock('latest');
    if (lastEvent) lastSyncBlock = lastEvent.block

    if (latestBlock.number > lastSyncBlock) {
      // sync any events in between
      const allEvents = await contract.getPastEvents("allEvents", {
        fromBlock: toHex(lastSyncBlock),
      })

      for (let curEvent of allEvents) {
        const exists = await Event.findOne({ $and: [{ name: curEvent.event }, { tx_hash: curEvent.transactionHash }] })
        if (!exists) {
          const eventModel = Event.build(curEvent);
          await eventModel.save()
        }

        await EventHandler(curEvent)
      }
    }

    console.log("events: sync completed");
  }
  catch (e) {
    console.log(e);

  }
}

async function watch() {
  try {

    let lastSyncBlock = 0;
    const lastEvent = await Event.findOne({}).sort({ block: -1 });

    if (lastEvent) lastSyncBlock = lastEvent.block

    const fromBlock = MaxOf(lastSyncBlock, INITIAL_BLOCK)

    global.logger.info(`watching from ${fromBlock}`)

    const opts: ConnectionObject = {
      ws: NETWORK.ws,
      abi: StakingABI as AbiItem[],
      address: STAKING_CONTRACT_ADDRESS,
      fromBlock: fromBlock
    }

    const handler = async (event: EventData) => {
      console.log("event", event.event);
      const exists = await Event.findOne({ $and: [{ tx_hash: event.transactionHash }, { name: event.event }] })
      if (exists) return

      const eventModel = Event.build(event);

      await eventModel.save();
      console.log("added new event");
      await updateContractData();
      await EventHandler(event)
    }

    const watcher: ReconnectableEvent = new ReconnectableEvent("allEvents", handler, opts)

    // setTimeout(() => watcher.disconnect(), 5000)

  }
  catch (e) {
    console.log(e);
  }
}

const ContractDataMethod = ['token', 'iRepF', 'reputationThreshold', 'hostingCompensation', 'totalStaked', 'minStakeAmount', 'maxStakeAmount', 'coolOff', 'interest', 'totalRedeemed', 'redeemInterval', 'maxEarningsCap', 'interestPrecision']

async function updateContractData() {
  try {
    const xdc3 = new Xdc3(new Xdc3.providers.HttpProvider(process.env.HTTP_RPC as string));
    const stakingContract = new xdc3.eth.Contract(StakingABI as AbiItem[], STAKING_CONTRACT_ADDRESS)
    const reputationContract = new xdc3.eth.Contract(ReputationFeedABI as AbiItem[], REPUTATION_CONTRACT_ADDRESS)

    const data = await Promise.all([...ContractDataMethod.map(x => stakingContract.methods[x].apply().call())]);

    let modelAttr: any = {};

    modelAttr.stakeHolders = await stakingContract.methods.getAllStakeHolder().call()

    for (let i = 0; i < data.length; i++) {
      modelAttr[ContractDataMethod[i]] = data[i]
    }


    const stakeholderRep = await Promise.all(modelAttr.stakeHolders.map((x: string) => reputationContract.methods.reputations(fromXdcAddress(x)).call()))
    const stakeholderStake = await Promise.all(modelAttr.stakeHolders.map((x: string) => stakingContract.methods.stakes(fromXdcAddress(x)).call()))

    const stakeHolderData = await Promise.all(modelAttr.stakeHolders.map((x: string) => Mirror.findOne({ 'contract.payment_destination': { $regex: new RegExp(toXdcAddress(x) as string, "i") } })))
    modelAttr.stakeHolders = modelAttr.stakeHolders.reduce((acc: object, staker: string, i: number): object => {
      Object.assign(acc, { [staker]: { reputation: stakeholderRep[i], stake: stakeholderStake[i], data: stakeHolderData[i] } })
      return acc
    }, {})

    const exists = await ContractData.findOne({});
    if (exists) {
      Object.assign(exists, modelAttr);
      await exists.save()
    } else {
      await ContractData.build(modelAttr).save()
    }
    console.log("contract config updated");
  }
  catch (e) {
    global.logger.error(e);
    setTimeout(updateContractData, 5000);
  }
}

function MaxOf(a: number, b: number): number {
  return a > b ? a : b
}

async function EventHandler(event: EventData): Promise<void> {
  try {
    if (event.event === "Staked") {
      await jober.addJob(event.returnValues.staker)
    } else if (event.event === "Unstaked") {
      await jober.removeJob(event.returnValues.staker)
    }
    MailEvent({ event: event.event, hash: event.transactionHash, address: getAssociatedAddress(event), params: event.returnValues })
  }
  catch (e) {
    console.log(e);

  }
}

// const xdc3 = new Xdc3(new Xdc3.providers.WebsocketProvider(NETWORK.wslive as string));
// const storxContract = new xdc3.eth.Contract(StorxABI as AbiItem[], "xdc5d5f074837f5d4618b3916ba74de1bf9662a3fed")

// storxContract.events.allEvents({ fromBlock: 0 }).on('data', async (event: EventData) => {
//   console.log("event", event);
// })

// ** Executions Start  

sync()
watch()
updateContractData()

jober.syncJobs().then(() => {
  console.log(jober.getAllJobs());
})

export const UpdateContractData = updateContractData;


function getAssociatedAddress(event: EventData) {
  switch (event.event) {
    case 'Staked':
    case 'Unstaked':
    case 'WithdrewStake':
    case 'ClaimedRewards':
    case 'MaxEarningsCapReached':
    case 'MissedRewards': return event.returnValues.staker;

    case 'WithdrewTokens': return event.returnValues.beneficiary;
    case 'WithdrewXdc': return event.returnValues.beneficiary;

    default: return ""
  }
}


