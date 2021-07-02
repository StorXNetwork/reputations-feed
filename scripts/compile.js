const solc = require("solc");
const fs = require("fs");
const path = require("path");

const CONTRACT_NAME = "ReputationFeed";
const FILE_NAME = "ReputationFeed.flat.sol";
const OUTPATH = path.join(__dirname, "../", `src/ABI`);
const OUT_FILE = `${CONTRACT_NAME}.json`;
if (!fs.existsSync(OUTPATH)) fs.mkdirSync(OUTPATH);
const PATH = path.join(__dirname, "../", `contracts/${FILE_NAME}`);

const contractCode = fs.readFileSync(PATH).toString();
const output = solc.compile(contractCode, 0);
const ABI = output.contracts[`:${CONTRACT_NAME}`].interface;

fs.writeFileSync(path.join(OUTPATH, OUT_FILE), ABI);

console.log("done");
