import express from "express"
import { config } from "dotenv"
import 'express-async-errors';
import { json } from 'body-parser';
import cors from "cors"
import path from "path"

import "./helpers/logger"

import commonRoutes from "./routes/common-routes"
// import storxRoutes from "./routes/storx-routes"
import { InactivationTest } from "./controllers/common-controller";

import { errorHandler } from './middlewares/error-handler';



import { FEED_INTERVAL, CLAIM_INTERVAL } from './config';
import { NotFoundError } from './helpers/errors';

config();


import "./engine/contract-sync"


const app: express.Application = express();
const port = process.env.PORT || 3000

app.set('trust proxy', true);
app.use(json());
app.use(cors())

app.use(commonRoutes)
// app.use(storxRoutes)

app.use(express.static(path.join(__dirname,"../", "docs")))
app.use("/assets", express.static(path.join(__dirname,"../", "assets")))


app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.listen(port, () => console.log("listening on port", port))

app.use(errorHandler);
import { SyncStakers } from "./reputation";
import { UpdateContractData } from "./engine/contract-sync";
import { ClaimEarned } from "./claimEarned";


// setInterval(() => {
//   run();
// }, FEED_INTERVAL);

setInterval(() => {
  ClaimEarned();
}, CLAIM_INTERVAL);

// const run = async () =>
//   SyncStakers()
//     .then((status) => global.logger.info("sync status", status))
//     .finally(UpdateContractData)
//     // .then(() => console.log("updated contract config"))
//     .catch(console.log);

setTimeout(ClaimEarned, 5000);
// setTimeout(run, 5000)
