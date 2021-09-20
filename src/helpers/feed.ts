import Xdc3 from "xdc3";
import { AbiItem, toHex, hexToNumber } from "xdc3-utils";
import { TransactionReceipt } from "xdc3-core";

import ABI from "../ABI/ReputationFeed.json"
import { NETWORK, REPUTATION_CONTRACT_ADDRESS, ACCOUNT } from '../config';
import { ReconnectableXdc3 } from '../classes/ReconnectableEvent';


const XdcObject = new ReconnectableXdc3(NETWORK.ws);
const xdc3_rpc = new Xdc3(new Xdc3.providers.HttpProvider(NETWORK.rpc));

// setTimeout(() => {
//   XdcObject.disconnect()
// }, 10000)

setInterval(async () => {
  const status = await XdcObject.status;
  global.logger.debug("status-xdc3:feed::", status);
}, 15000)

export const GeneralContractMethodView = (
  method: string,
  params: (string | number)[] = []
): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const xdc3 = xdc3_rpc;
      const contract = new xdc3.eth.Contract(
        ABI as AbiItem[],
        REPUTATION_CONTRACT_ADDRESS
      );
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
  params: (string | number)[] = []
): Promise<TransactionReceipt> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("method, params", method, params);

      const xdc3 = xdc3_rpc;
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

      const gasLimit = await xdc3.eth.estimateGas(tx);
      tx["gasLimit"] = toHex(gasLimit);

      const signed = await xdc3.eth.accounts.signTransaction(
        tx,
        ACCOUNT.privateKey
      );

      xdc3.eth
        .sendSignedTransaction(signed.rawTransaction as string)
        .once("receipt", (receipt) => resolve(receipt))
        .catch((e) => {
          // console.trace(e);
          reject(e);
        });
    } catch (e) {
      // console.trace(e);
      reject(e);
    }
  });
};

export const GetAddressReputation = async (
  address: string
): Promise<number> => {
  const xdc3 = xdc3_rpc;
  const contract = new xdc3.eth.Contract(ABI as AbiItem[], REPUTATION_CONTRACT_ADDRESS);
  return await contract.methods.getReputation(address).call();
};

export const UpdateAddresReputation = async (
  address: string,
  reputation: number
): Promise<boolean> => {
  const xdc3 = xdc3_rpc;
  const contract = new xdc3.eth.Contract(ABI as AbiItem[], REPUTATION_CONTRACT_ADDRESS);
  const currentReputation = await contract.methods.getReputation(address).call()
  global.logger.debug("reputation change for", address, "-> current:", currentReputation, "updated:", reputation, "are equal:", currentReputation == reputation);
  if (currentReputation == reputation) {
    global.logger.debug("no change in reputation for", address, "skipping"); return true
  }
  const data = contract.methods.setReputation(address, reputation).encodeABI();
  const tx: any = {
    data,
    to: REPUTATION_CONTRACT_ADDRESS,
    from: ACCOUNT.address,
  };

  const gasLimit = await xdc3.eth.estimateGas(tx);
  tx["gasLimit"] = toHex(gasLimit);

  const signed = await xdc3.eth.accounts.signTransaction(
    tx,
    ACCOUNT.privateKey
  );

  await xdc3.eth.sendSignedTransaction(signed.rawTransaction as string);
  return true;
};

export const AddStaker = async (
  address: string,
  reputation: number
): Promise<boolean> => {
  try {
    const receipt = await GeneralContractMethod("addStaker", [
      address,
      reputation,
    ]);
    if (receipt === null) return false;
    return true;
  } catch (e) {
    // console.trace(e);
    return false;
  }
};

export const RemoveStaker = async (address: string): Promise<boolean> => {
  try {
    const receipt = await GeneralContractMethod("removeStaker", [address]);
    if (receipt === null) return false;
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
