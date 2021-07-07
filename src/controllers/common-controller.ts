import express from 'express';


import { ContractData } from "../models/contract-data"
import { Event } from "../models/events"
import { fromXdcAddress } from 'xdc3-utils';
import { GetRates } from '../helpers/price';

export const GetStakeHolder = (req: express.Request, res: express.Response): void => {
    res.json({ status: 200, data: [] })
}

export const GetContractData = async (req: express.Request, res: express.Response): Promise<void> => {
    const data = await ContractData.findOne({})
    res.json({ status: 200, data: data })
}

export const GetUserEvents = async (req: express.Request, res: express.Response): Promise<void> => {
    const data = await Event.find({ associated_address: fromXdcAddress(req.params.address) as string }).sort({ block: -1 })
    res.json({ status: 200, data: data })
}

export const GetAssetPrice = async (req: express.Request, res: express.Response): Promise<void> => {
    const rates = GetRates()
    res.json({ status: 200, data: rates })
}
