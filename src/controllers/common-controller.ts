import express from 'express';
import geoIp from "geoip-lite"

import { ContractData, StakeHolder } from '../models/contract-data';
import { Event } from "../models/events"
import { fromXdcAddress, toXdcAddress } from 'xdc3-utils';
import { GetRates } from '../helpers/price';
import { Contact } from '../models/contact';
import { User } from '../models/user';
import { BadRequestError } from '../helpers/errors';


export const GetStakeHolder = (req: express.Request, res: express.Response): void => {
    res.json({ status: 200, data: [] })
}

export const GetContractData = async (req: express.Request, res: express.Response): Promise<void> => {
    const data = await ContractData.findOne({})
    res.json({ status: 200, data: data })
}

export const GetUserEvents = async (req: express.Request, res: express.Response): Promise<void> => {
    const data = await Event.find({ associated_address: new RegExp(`^${fromXdcAddress(req.params.address)}$`, 'i') }).sort({ block: -1 })
    res.json({ status: 200, data: data })
}

export const GetAssetPrice = async (req: express.Request, res: express.Response): Promise<void> => {
    const rates = GetRates()
    res.json({ status: 200, data: rates })
}

export const GetNodeCoordinates = async (req: express.Request, res: express.Response): Promise<void> => {
    const stakeHolders = (await ContractData.findOne({}))?.stakeHolders;
    const stakeId = Object.keys(stakeHolders as any).map<string>((x: string) => stakeHolders?.[x as any].contact as string);
    const contactToAddress = Object.keys(stakeHolders as any).reduce((acc: any, cur: any): any => {
        acc[stakeHolders?.[cur].contact as string] = cur;
        return acc;
    }, {})

    const addresses = (await Contact.find({ $or: [{ _id: { $in: stakeId } }, { paymentAddress: { $exists: true } }] }).lean());

    const ret_data = [];
    for (let address of addresses) {
        const geo_data = geoIp.lookup(address.ip.split(",")[0]);
        ret_data.push({
            repuation: address.reputation,
            xdc_address: address.paymentAddress ? address.paymentAddress : contactToAddress[address._id],
            coordinates: geo_data?.ll,
            geo_data,
        })
    }

    res.json({ status: 200, data: ret_data })
}

export const GetSingleNodeCoordinates = async (req: express.Request, res: express.Response): Promise<void> => {
    const xdcwallet = fromXdcAddress(req.params.xdcwallet).toLowerCase();
    const stakeHolders = (await ContractData.findOne({}).lean())?.stakeHolders;

    const reducedStakeholders = stakeHolders && Object.keys(stakeHolders).reduce<any>((acc, cur) => {
        acc[cur.toLowerCase()] = stakeHolders[cur];
        return acc;
    }, {});



    const stakeId = reducedStakeholders && reducedStakeholders[xdcwallet].data.contact
    console.log("reducedStakeholders", reducedStakeholders);


    const contact = await Contact.findOne({ _id: stakeId });

    if (!contact) throw new BadRequestError("address not found");
    const geo_data = geoIp.lookup(contact.ip.split(",")[0]);
    res.json({
        status: 200, data: {
            repuation: contact.reputation,
            xdc_address: toXdcAddress(xdcwallet),
            coordinates: geo_data?.ll,
            geo_data,
        }
    })
}

export const GetStats = async (req: express.Request, res: express.Response): Promise<void> => {
    const contract = (await ContractData.findOne({}));
    const stakeholder_count = Object.keys(contract?.stakeHolders as any).length;
    const staked_amount = contract?.totalStaked;
    const user_count = (await User.count({}));

    res.json({
        status: 200, data: {
            stakeholder_count,
            staked_amount,
            user_count
        }
    })
}

