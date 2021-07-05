export const ACCOUNT = {
  address: "",
  privateKey: ""
}

export const NETWORK = {
  rpc: "https://rpc.xinfin.network",
  ws: "wss://ws.xinfin.network",
  wslive: "wss://ws.xinfin.network"
}

export const REPUTATION_CONTRACT_ADDRESS = process.env.REPUTATION_CONTRACT_ADDRESS || "xdc5db64839828174d2d29b419e5581c16c67d62046"
export const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS || "xdc02fe7b136f5dbff8d00546cb5af45afd1e1d350c"
export const SRX_TOKEN = process.env.SRX_TOKEN || "xdc5d5f074837f5d4618b3916ba74de1bf9662a3fed"

export const STORX_DB_URI = ""
export const FEED_DB_URI = ""


export const FEED_INTERVAL = 10 * 60 * 1000 // in ms

export const INITIAL_BLOCK = 30000000

export const INITIAL_STAKERS = []

export const FARMER_ADDRESS: { [s: string]: string } = {
  "173.212.195.20": "xdcc9acb65482ff9f3e05df8e769ef1cfafd41692d2", // Rushab
  "87.117.239.115": "xdcd3bf3a49d663cc41ac12486ade7b3063561435d9", // Shubham
}