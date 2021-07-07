import express from "express"
import { param } from "express-validator";
import * as utils from "xdc3-utils"


const router = express.Router();

import * as CommonController from "../controllers/common-controller"
import { ValidateRequest } from '../middlewares/validateRequest';

router.get("/get-stakeholders", CommonController.GetStakeHolder);
router.get("/get-contract-data", CommonController.GetContractData);
router.get('/get-user-events/:address', ValidateRequest([param('address').custom(x => utils.isAddress(x))]), CommonController.GetUserEvents)
router.get("/get-asset-price", CommonController.GetAssetPrice);



export default router