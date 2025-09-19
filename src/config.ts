export const ACCOUNT = {
  //address: "0xe50d5fc9bcbce037a19c860ba4105548d42517a0",
  //address: "0x37e500fc65eeec7aa5226c2934019be27d7a93f7",
  //privateKey: "1637a3827950e2b50b45a427d826cf4a36f099a42b825afeefb83ee99e0ee0e6"
  //privateKey: "83ed0975933d5516ee2cf2af09f58fbb878ff15be0eb5ad54fe042775d3e8722"
  address: "0xe493348d45ab2f5061540b57878f9aff6aef7a61",
  privateKey: "874ad9799204d9a9daf17fc44c737264e0d2b649e5667ffdda1f473554bfda2d"
}
export const NETWORK = {
 rpc: "https://rpc.xinfin.network ",
  ws: "wss://ws.xinfin.network",
  rpcRS:"https://arpc.xinfin.network",
// rpc:"https://xdcrpc.storx.io",
// ws:"wss://xdcws.storx.io",
  // wslive1: "wss://xdcws.storx.io",
 rpc1:"https://rpc.xinfin.network " ,
 ws1: "wss://ws.xinfin.network",
 erpc: "https://erpc.xinfin.network",
 wslive: "ws://localhost:8888"
}

//export const NETWORK = {
 // rpc: "https://mnrpc.xinfin.network",
 // ws: "wss://xws.xinfinscan.com",
//  wslive: "wss://xws.xinfinscan.com"
//}

export const REPUTATION_CONTRACT_ADDRESS = process.env.REPUTATION_CONTRACT_ADDRESS || "0x5db64839828174d2d29b419e5581c16c67d62046"
export const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS || "0x02fe7b136f5dbff8d00546cb5af45afd1e1d350c"
export const SRX_TOKEN = process.env.SRX_TOKEN || "xdc5d5f074837f5d4618b3916ba74de1bf9662a3fed"

//export const STORX_DB_URI = "mongodb+srv://SRXUserFeeds:qOgchwZ4fdNxlYOg@storxio.5hbpx.mongodb.net/__storj-bridge-development?retryWrites=true&w=majority"
// export const FEED_DB_URI = "mongodb://localhost:27017/reputation-feed"
// export const ACCOUNT = {
//   address: "0xe50d5fc9bcbce037a19c860ba4105548d42517a0",
//   //address: "0x37e500fc65eeec7aa5226c2934019be27d7a93f7",
//   privateKey: "1637a3827950e2b50b45a427d826cf4a36f099a42b825afeefb83ee99e0ee0e6"
//   //privateKey: "83ed0975933d5516ee2cf2af09f58fbb878ff15be0eb5ad54fe042775d3e8722"
// }
// export const NETWORK = {
//  rpc1: "https://observer-rpc.xinfin.network",
//   ws1: "wss://observer-ws.xinfin.network",
//   rpcRS:"https://arpc.xinfin.network",
// // rpc:"https://xdcrpc.storx.io",
// // ws:"wss://xdcws.storx.io",
//   // wslive1: "wss://xdcws.storx.io",
//  rpc:"https://xdcrpc.storx.io/" ,
//  ws: "wss://xdcws.storx.io/",
//  erpc: "https://erpc.xinfin.network",
//  wslive: "ws://localhost:8888"
// }

//export const NETWORK = {
 // rpc: "https://mnrpc.xinfin.network",
 // ws: "wss://xws.xinfinscan.com",
//  wslive: "wss://xws.xinfinscan.com"
//}

// export const REPUTATION_CONTRACT_ADDRESS = process.env.REPUTATION_CONTRACT_ADDRESS || "0x5db64839828174d2d29b419e5581c16c67d62046"
// export const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS || "0x02fe7b136f5dbff8d00546cb5af45afd1e1d350c"
// export const SRX_TOKEN = process.env.SRX_TOKEN || "xdc5d5f074837f5d4618b3916ba74de1bf9662a3fed"

//export const STORX_DB_URI = "mongodb+srv://SRXUserFeeds:qOgchwZ4fdNxlYOg@storxio.5hbpx.mongodb.net/__storj-bridge-development?retryWrites=true&w=>// export const FEED_DB_URI = "mongodb://localhost:27017/reputation-feed"
//export const FEED_DB_URI = "mongodb+srv://StorXDB:6G32qcFujWNtF2F@storxio.5hbpx.mongodb.net/reputation-feed?retryWrites=true&w=majority"
export const STORX_DB_URI = "mongodb://localhost:27017/__storj-bridge-development"
export const FEED_DB_URI = "mongodb://localhost:27017/reputation-feed"


export const FEED_INTERVAL = 5 * 60 * 1000 // in ms

export const CLAIM_INTERVAL = 24 * 60 * 60 * 1000 //seconds in a day

export const INITIAL_BLOCK = 30000000


export const INITIAL_STAKERS = ["0x33d2d082156cad8fa9093703b02984761bc2eb2c"]
