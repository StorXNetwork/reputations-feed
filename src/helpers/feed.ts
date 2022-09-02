import Xdc3 from "xdc3";
import web3 from "web3";

import { AbiItem, toHex, hexToNumber } from "xdc3-utils";
import { TransactionReceipt } from "xdc3-core";
import utils from "xdc3-utils";

import ABI from "../ABI/ReputationFeed.json"
import { NETWORK, REPUTATION_CONTRACT_ADDRESS, ACCOUNT } from '../config';
import { ReconnectableXdc3 } from '../classes/ReconnectableEvent';


const XdcObject = new ReconnectableXdc3(NETWORK.ws);

// setTimeout(() => {
//   XdcObject.disconnect()
// }, 10000)
let sleep = (time:any) => new Promise((resolve) => setTimeout(resolve, time))


// function sleep(milliseconds: any) {
//   const date = Date.now();
//   let currentDate = null;
//   do {
//     currentDate = Date.now();
//   } while (currentDate - date < milliseconds);
//   console.log("Sleep 2 Seconds Before Each Transaction")
// }

setInterval(async () => {
  const status = await XdcObject.status;
  global.logger.debug("status-xdc3:feed::", status);
}, 15000)

export const GeneralContractMethodView = (
  method: string,
  params: (string | number)[] = []
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const xdc3 = new Xdc3(new Xdc3.providers.HttpProvider(NETWORK.rpc));
    const contract = new xdc3.eth.Contract(
      ABI as AbiItem[],
      REPUTATION_CONTRACT_ADDRESS
    );
    try {
      const data = await contract.methods[method](...params).call();
      resolve(data);
    } catch (e) {
      console.trace(e);
      reject(e);
    }
  });
};

export const GeneralContractMethod = (
  method: string,
  params: (string | number)[] = [],
  nonceCount:number
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const xdc3 = new Xdc3(new Xdc3.providers.HttpProvider(NETWORK.rpc));
    const contract = new xdc3.eth.Contract(
      ABI as AbiItem[],
      REPUTATION_CONTRACT_ADDRESS
    );
    try {
      console.log("method, params", method, params);

 
      const data = contract.methods[method](...params).encodeABI();
      const tx: any = {
        data,
        to: REPUTATION_CONTRACT_ADDRESS,
        from: ACCOUNT.address,
      };
      let nonceCount = await xdc3.eth.getTransactionCount(ACCOUNT.address,"pending");
      // const gasLimit = await xdc3.eth.estimateGas(tx);
      const gasLimit = '40000000'
      tx["gasLimit"] = toHex(gasLimit);
      tx["nonce"] = "0x" + nonceCount.toString(16)
      console.log(`GeneralContractMethod Current Address ${ACCOUNT.address} and Nonce ${nonceCount}`)
      await send(tx)
      resolve(true)

      //   const signed = await xdc3.eth.accounts.signTransaction(
      //     tx,
      //     ACCOUNT.privateKey
      //   );

      //   xdc3.eth
      //     .sendSignedTransaction(signed.rawTransaction as string)
      //     .once("receipt", (receipt) => resolve(receipt))
      //     .catch((e) => {
      //       // console.trace(e);
      //       reject(e);
      //     });
      // } catch (e) {
      //   // console.trace(e);
      //   reject(e);
      // }
    } catch (err) {
      console.log(err);
    };
  });
};

export const GeneralContractMethod11 = async (
  method: string,
  params: (string | number)[] = [],
  nonceCount:string
  ): Promise<void> => {
  // return new Promise(async (resolve, reject) => {
    try {
      console.log("method, params", method, params);

      const xdc3 = new Xdc3(new Xdc3.providers.HttpProvider(NETWORK.rpc));
      const contract = new xdc3.eth.Contract(
        ABI as AbiItem[],
        REPUTATION_CONTRACT_ADDRESS
      );
      const data = contract.methods[method](...params).encodeABI();
      const tx: any = {
        data,
        to: REPUTATION_CONTRACT_ADDRESS,
        from: ACCOUNT.address,
      };
      // let nonceCount = await xdc3.eth.getTransactionCount(ACCOUNT.address,"pending");
      // const gasLimit = "98558363"
      const gasLimit = await xdc3.eth.estimateGas(tx);
      tx["gasLimit"] = toHex(gasLimit);
      tx["nonce"] =   nonceCount
      console.log(`GeneralContractMethod Current Address ${ACCOUNT.address} and Nonce ${nonceCount}`)
      // await sleep(4000)
      await send(tx)
      nonceCount =nonceCount+1
      // const signed = await xdc3.eth.accounts.signTransaction(
      //   tx,
      //   ACCOUNT.privateKey
      // );

      // nonceCount =nonceCount+1

      //     send(tx).finally().catch((e) => {
      //       // console.trace(e);

      //       reject(e);
      //     });
      // } catch (e) {
      //   // console.trace(e);
      //   reject(e);
      // }
      // nonceCount =nonceCount+1
    // return txhash;

    //   xdc3.eth
    //     .sendSignedTransaction(signed.rawTransaction as string)
    //     .once("receipt", (receipt) => resolve(receipt))
    //     .catch((e) => {
    //       // console.trace(e);
    //       reject(e);
    //     });
    // } catch (e) {
    //   // console.trace(e);
    //   reject(e);
    // }
  // });
} catch (e) {
  console.trace(e);
}
};

export const GetAddressReputation = async (
  address: string
): Promise<number> => {
  const xdc3 = new Xdc3(new Xdc3.providers.HttpProvider(NETWORK.rpc));
  const contract = new xdc3.eth.Contract(ABI as AbiItem[], REPUTATION_CONTRACT_ADDRESS);
  return await contract.methods.getReputation(address).call();
};

export const send = function (obj:any)  {
  // console.log(obj,'obj')
  
  const xdc3 = new web3(new web3.providers.HttpProvider(NETWORK.rpc));
  const account = xdc3.eth.accounts.privateKeyToAccount(ACCOUNT.privateKey)
  xdc3.eth.accounts.wallet.add(ACCOUNT)
  xdc3.eth.defaultAccount = '0xe50d5fc9bcbce037a19c860ba4105548d42517a0'
  return new Promise((resolve, reject) => {
    xdc3.eth.sendTransaction({
          nonce: obj.nonce,
          data:obj.data,
          from: obj.from,
          to: obj.to,
          value: obj.value,
          gasPrice: obj.gasPrice,
      }, function (err, hash) {
          if (err) {
              console.error(`Send error ${obj.to} nonce ${obj.nonce}`)
              console.error(String(err))
              console.error('Sleep 2 seconds and resend until done')
              // obj.nonce=obj.nonce+1;
              return sleep(2000).then(() => {
                xdc3.eth.getTransactionCount(ACCOUNT.address,"pending").then((nonceCount:any)=>{
                  console.log(`Nonce Error : Current :- ${obj.nonce} new Nonce :- ${nonceCount}`)
                  obj.nonce=nonceCount;
                  return resolve(send(obj))

                })
              })
          } else {
              console.info('Done %s %s %s %s', obj.to, hash, 'nonce', obj.nonce)
              return resolve('1')
              return false
          }
      }).catch(e => { console.error(e) })
  })
}
export const UpdateAddresReputation = async (
  filteredStakers: any
):Promise<boolean> =>  {
  let counterArr : any = [];
  let signTxH : any = [];
  const xdc3 = new Xdc3(new Xdc3.providers.HttpProvider(NETWORK.rpc));
  // const account = xdc3.eth.accounts.privateKeyToAccount(ACCOUNT.privateKey)
  // let coinbase = utils.fromXdcAddress(ACCOUNT.address)
  // console.log(coinbase,ACCOUNT.address,account,'accountaccountaccountaccount')
  // xdc3.eth.accounts.wallet.add(ACCOUNT)
  // xdc3.eth.defaultAccount = '0xe50d5fc9bcbce037a19c860ba4105548d42517a0'
  let nonceCount = await xdc3.eth.getTransactionCount(ACCOUNT.address,"pending");

  console.log(filteredStakers.length,'filteredStakers')
  for(let i=0;i<filteredStakers.length;i++){
  if (filteredStakers[i].paymentAddress){
    // const xdc3 = new Xdc3(new Xdc3.providers.HttpProvider(NETWORK.rpc));

    const contract = new xdc3.eth.Contract(ABI as AbiItem[], REPUTATION_CONTRACT_ADDRESS);
    let currentReputation = await contract.methods.getReputation(utils.fromXdcAddress(filteredStakers[i].paymentAddress)).call()
    global.logger.debug("reputation change for", utils.fromXdcAddress(filteredStakers[i].paymentAddress), "-> current:", currentReputation, "updated:", filteredStakers[i].reputation, "are equal:", currentReputation == filteredStakers[i].reputation);
    // console.log(currentReputation , filteredStakers[i].reputation,'currentReputation == filteredStakers[i].reputation ' )
    if (currentReputation == filteredStakers[i].reputation) {
      global.logger.debug("no change in reputation for", utils.fromXdcAddress(filteredStakers[i].paymentAddress), "skipping"); continue;
    }
    console.log(`Sr :- ${i}/${filteredStakers.length} Current Add :- ${filteredStakers[i].paymentAddress} Rep :- ${filteredStakers[i].reputation} `)
    let data = contract.methods.setReputation(utils.fromXdcAddress(filteredStakers[i].paymentAddress), filteredStakers[i].reputation).encodeABI();

    let tx: any = {
      data,
      to: REPUTATION_CONTRACT_ADDRESS,
      from: ACCOUNT.address,
    };

    // sleep(3000);
    let gasLimit = await xdc3.eth.estimateGas(tx);
    tx["gasLimit"] = toHex(gasLimit);
    tx["nonce"] = "0x" + nonceCount.toString(16);;
    await send(tx)
    nonceCount =nonceCount+1
    // counterArr.push(tx);
    // console.log(counterArr.length,'counterArr')

    // if(counterArr.length % 10 === 0){
      // counterArr.forEach(async (item: any) => {
              //   const signed = await xdc3.eth.accounts.signTransaction(
              //     tx,
              //     ACCOUNT.privateKey
              //   );
              //   signTxH.push(signed)
              //     // sleep(2000);

              //   let recipet = await xdc3.eth.sendSignedTransaction(signTxH[i].rawTransaction,(error, txHash)  =>{
              //     if (error) throw error;
              //     console.log(`txHash :- ${txHash}  `)

              // });
      // nonceCount = nonceCount+1
        // xdc3.eth.sendSignedTransaction(signed.rawTransaction as string);
      // })
      // counterArr = []
    // }
    }else{
      console.log('print value', filteredStakers[i])
    }
  }
  return true;
};

export const AddStaker = async (
  address: string,
  reputation: number,
  nonceCount:number
): Promise<boolean> => {
  try {
    await GeneralContractMethod("addStaker", [
      address,
      reputation
    ],nonceCount);
    // if (receipt === null) return false;
    return true;
  } catch (e) {
    // console.trace(e);
    return false;
  }
};


export const RemoveStaker = async (address: string,nonceCount:number): Promise<boolean> => {
  try {
     await GeneralContractMethod("removeStaker", [address],  nonceCount
    );
    // if (receipt === null) return false;
    return true;
  } catch (e) {
    // console.trace(e);
    return false;
  }
};

export const GetAllStaker = async (): Promise<{
  status: boolean;
  data: Array<string>;
}> => {
  try {
    const stakers = await GeneralContractMethodView("getAllStaker");
    if (stakers === null) return { status: false, data: [] };
    return { status: true, data: stakers };
  } catch (e) {
    console.trace(e);
    return { status: false, data: [] };
  }
};

export const IsStaker = async (
  address: string
): Promise<{
  status: boolean;
  data?: boolean;
}> => {
  try {
    const isStaker = await GeneralContractMethodView("isStaker", [address]);
    if (isStaker === null) return { status: false };
    return { status: true, data: isStaker };
  } catch (e) {
    // console.trace(e);
    return { status: false };
  }
};
