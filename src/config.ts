export const ACCOUNT = {
  address: "",
  privateKey: ""
}

export const NETWORK = {
  rpc: "https://rpc.xinfin.network",
  ws: "wss://ws.xinfin.network",
  wslive: "wss://ws.xinfin.network"
}

export const REPUTATION_CONTRACT_ADDRESS = process.env.REPUTATION_CONTRACT_ADDRESS || "xdc03eb22ba299f7902a6f65966649d62c05a61cb8f"
export const STAKING_CONTRACT_ADDRESS = process.env.STAKING_CONTRACT_ADDRESS || "xdcca47a4a497a2547407aa250c40d71d3454a82835"
export const SRX_TOKEN = process.env.SRX_TOKEN || "xdcf45ab647946e9f0800bc1194a73a52cf109a4313"

export const STORX_DB_URI = ""
export const FEED_DB_URI = ""


export const FEED_INTERVAL = 60 * 60 * 1000 // in ms

export const INITIAL_BLOCK = 20000000

export const INITIAL_STAKERS = ["0x0449cb09dec1c34f1067e00a83e5dd5af070ede8", "xdca13e001e70cf282fcaa645a22dd836c114ce6770", "xdc0ecdb47c40903f86e416b23ac0118028e6b08beb", "xdcf4435e1f5f7871b7fa349698dd407798759f051c"]

export const FARMER_ADDRESS: { [s: string]: string } = {
  "62.171.133.138": "xdcf08c219c227d64d0aff8b5bef4da09f7214a574b",
  "164.68.108.56": "xdceb440a9e84d81c76490ee031333aa25f7b7f03e5",
  "62.171.160.82": "xdc19eb67dfbfb6c50d7ad33596014c32d5d833816c"
}