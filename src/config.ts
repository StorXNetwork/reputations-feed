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
  "7abda28bdd8d24122a1e4c469bcb002a182783cf": "xdcc9acb65482ff9f3e05df8e769ef1cfafd41692d2", // Rushab
  "b5206fda398c82dd3eae7768c12cc229942cad00": "xdcb1eceb19c7a471369d68d535446f736daddbfefa", // Murphy
  "6cd6b0e38620ec63ec5b2be21cb6c4b0ca545885": "xdccc54fe0c6cd249fd712df8c3fa7d03883a2546ba", // Hitesh
  "f17c125494f7db76646fbc88dcfded881fc4fb0a": "xdc3a55a9ce3310cd9897c33d38fae04a3d7112f38b", // Omkar
  "3a780a916012cf44054007c9c850981731cc9d1a": "xdc53270ffaf978bef84a8cd69035d0d5954ec319da", // Anil
  "da887bd587a9bbe4547fdad1539a793362471b22": "xdcd3a38758f937d48c963425b31af76dc3da8ebc9b", // Hrishi
  "884cca3ff98a903b190ce9e4344fc5e514a4c2f5": "xdcd3bf3a49d663cc41ac12486ade7b3063561435d9" // Shubham
}