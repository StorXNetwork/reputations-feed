import {
    Inactivation
  } from "./helpers/feed";
  import { toXdcAddress } from 'xdc3-utils';
  import { ContractData } from "./models/contract-data";
  
  export async function ClaimEarned() {
    const data = await ContractData.findOne({})
    const stakeHolders = Object.keys(data.stakeHolders);
    let sortedStakeHolders = [];
    for(let j = 0; j < stakeHolders.length; j++) {
        let rep = Number(data.stakeHolders[stakeHolders[j]].reputation);
        let stake = Number(data.stakeHolders[stakeHolders[j]].stake.stakedAmount)/1000000000000000000;
        if (rep == 0 && stake > 1000){
            sortedStakeHolders.push(stakeHolders[j])
        }
    }
    
    for(let i = 0; i < sortedStakeHolders.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 8000));
        console.log(toXdcAddress(sortedStakeHolders[i]));
        Inactivation(toXdcAddress(sortedStakeHolders[i]));
    }
  }
  