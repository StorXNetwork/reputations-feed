import express from "express"
import { body } from 'express-validator';

const router = express.Router();

import * as StorxController from "../controllers/storx-controller"
import { ValidateRequest } from '../middlewares/validateRequest';

// router.post("/add-staker", ValidateRequest([body('staker').isString().notEmpty(), body('reputation').isNumeric()]), StorxController.AddStaker);
// router.post("/remove-staker", ValidateRequest([body('staker').isString().notEmpty()]), StorxController.RemoveStaker);
// router.post('/update-staker-reputation', ValidateRequest([body('staker').isString().notEmpty(), body('reputation').isNumeric()]), StorxController.UpdateReputation)

export default router