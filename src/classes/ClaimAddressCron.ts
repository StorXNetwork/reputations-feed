import Xdc3 from "xdc3"
import { WebsocketProvider, TransactionReceipt } from 'xdc3-core';
import { CronJob } from "cron"

import { NETWORK, STAKING_CONTRACT_ADDRESS, ACCOUNT } from '../config';
import StakingABI from "../ABI/Staking.json"
import { AbiItem, toXdcAddress } from 'xdc3-utils';
import { ClaimCron } from "../models/claim-cron";
import { LimittedParallel } from './LimitedParallel';




export interface NetworkOption {
  ws: string;
}


interface Job {
  [key: string]: CronJob | null
}

export class ClaimAddressCron {

  xdc3: Xdc3;
  provider: WebsocketProvider;
  reconnInterval: any;
  jobs: Job = {};
  addresses: string[] = []
  limitedClaimRewardsFunc: LimittedParallel<[string, (receipt: TransactionReceipt | null) => void]>


  constructor(public connObj: NetworkOption) {
    this.provider = new Xdc3.providers.WebsocketProvider(connObj.ws)
    this.xdc3 = new Xdc3(this.provider);
    this.reconn()
    this._claimRewards = this._claimRewards.bind(this)
    this.limitedClaimRewardsFunc = new LimittedParallel<[string, (receipt: TransactionReceipt | null) => void]>(this._claimRewards, 1)
  }

  async addJob(address: string): Promise<void> {
    address = toXdcAddress(address) as string
    if (this.jobs[address]) {
      this.jobs[address]?.stop();
      this.jobs[address] = null;
    }
    const invocationDate: Date | null = await this.getInvocationDate(address);

    if (invocationDate === null) return

    const exists = await ClaimCron.find({ $and: [{ staker: toXdcAddress(address) as string }, { active: true }, { invocation_time: invocationDate }] })


    if (exists) {
      for (let entry of exists) {
        entry.active = false;
        await entry.save()
      }
    }

    this.setJob(address, invocationDate);
    this.jobs[address]?.start()
    const newClaim = ClaimCron.build({ receipt: null, status: false, staker: address, invocation_time: invocationDate });
    await newClaim.save()
    console.log("new job added");
  }

  async checkAndSync(address: string): Promise<void> {
    try {
      address = toXdcAddress(address) as string
      const exists = await ClaimCron.findOne({ $and: [{ staker: toXdcAddress(address) as string }, { active: true }] })
      const invocation_time = await this.getInvocationDate(address)
      if (exists) {
        console.log("job exists, skipping addition");
        this.setJob(address, invocation_time as Date)
      } else {
        this.addJob(address)
      }
    } catch (e) {

    }
  }

  setJob(address: string, invocation_time: Date) {
    address = toXdcAddress(address) as string
    let finalInvcationTime = invocation_time
    if (finalInvcationTime.getTime() < Date.now()) {
      global.logger.info("invocation date missed, retrying in 5 seconds for", address)
      finalInvcationTime = new Date(Date.now() + 5000)
    }
    this.jobs[address] = new CronJob(finalInvcationTime, async () => {

      global.logger.debug("executing job", address);

      this.claimRewards(address, async receipt => {
        try {

          global.logger.debug("job result", address, receipt);

          // const receipt = null
          const claim = await ClaimCron.findOne({ $and: [{ staker: toXdcAddress(address) as string }, { active: true }, { invocation_time: invocation_time }] });
          if (claim) {
            claim.active = false;
            claim.receipt = receipt;
            claim.status = receipt !== null;
            await claim.save();
          }


        } catch (e) {
          console.log(e);
          const claim = await ClaimCron.findOne({ $and: [{ staker: toXdcAddress(address) as string }, { active: true }, { invocation_time: invocation_time }] });
          if (claim) {
            claim.active = false;
            claim.receipt = null;
            claim.status = false;
            await claim.save();
          }
        }
        finally {
          global.logger.debug("job new adding", address);
          this.addJob(address)
        }
      })



    }, () => {
      this.jobs[address] = null;
    }, true)
  }

  async removeJob(address: string): Promise<void> {
    address = toXdcAddress(address) as string
    if (this.jobs[address]) {
      this.jobs[address]?.stop()
      this.jobs[address] = null;
    }
    const activeClaims = await ClaimCron.find({ $and: [{ active: true }, { staker: address }] });
    for (let claim of activeClaims) {
      claim.active = false;
      await claim.save()
    }
    console.log("removed job", address);

  }

  getStatus(address: string): boolean {
    address = toXdcAddress(address) as string
    const x = this.jobs[address]
    if (x === null) return false
    if (x === undefined) return false
    if (x instanceof CronJob)
      return x.running as boolean
    return false
  }

  getJob(address: string): CronJob | null {
    address = toXdcAddress(address) as string
    return this.jobs[address]
  }

  getAllJobs(): string[] {
    return Object.keys(this.jobs)
  }


  async syncJobs(): Promise<void> {
    try {
      const claims = await ClaimCron.find({ active: true })
      for (let claim of claims) {
        const { staker, invocation_time } = claim;
        this.setJob(staker, invocation_time)
      }
      console.log("claim jobs synced");
    }
    catch (e) {
      console.log(e);
    }
  }

  async getInvocationDate(address: string): Promise<Date | null> {
    try {
      address = toXdcAddress(address) as string
      const contract = new this.xdc3.eth.Contract(StakingABI as AbiItem[], STAKING_CONTRACT_ADDRESS);
      const stake = await contract.methods.stakes(address).call()
      if (!stake.exists || !stake.staked) return null
      const nextDrip = await contract.methods.nextDripAt(address).call()
      return new Date(parseFloat(nextDrip) * 1000)
    }
    catch (e) {
      console.log(e);
      return null
    }
  }

  claimRewards(address: string, cb: (receipt: TransactionReceipt | null) => void): void {
    this.limitedClaimRewardsFunc.add([address, cb.bind(this)])
  }

  async _claimRewards(address: string, cb: (receipt: TransactionReceipt | null) => void): Promise<void> {
    address = toXdcAddress(address) as string

    try {
      const contract = new this.xdc3.eth.Contract(StakingABI as AbiItem[], STAKING_CONTRACT_ADDRESS);
      const data = contract.methods.claimEarned(address).encodeABI()

      const tx: any = {
        to: STAKING_CONTRACT_ADDRESS,
        data: data,
        from: ACCOUNT.address
      }
      const gas = await this.xdc3.eth.estimateGas(tx)
      tx["gasLimit"] = gas
      const signed = await this.xdc3.eth.accounts.signTransaction(tx, ACCOUNT.privateKey)
      this.xdc3.eth.sendSignedTransaction(signed.rawTransaction as string).once('receipt', cb).catch(e => {
        global.logger.error(e)
        cb(null)
      })
    } catch (e) {
      console.log(e);
      global.logger.error(e);
      cb(null)
    }
  }

  reconn() {
    this.reconnInterval = setInterval(() => {
      this.xdc3.eth.net.isListening().then(x => {
        if (!x) this.reconnect()
      }).catch(() => {
        console.log("status", "error");
        this.reconnect()
      })
    }, 5000)
  }

  reconnect() {
    this.provider = new Xdc3.providers.WebsocketProvider(this.connObj.ws)
    this.xdc3 = new Xdc3(this.provider);
  }

  disconnect() {
    this.provider.disconnect(0, "test")
    console.log("disconnected");
  }

}


