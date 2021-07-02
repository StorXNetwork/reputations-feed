import express from 'express';
import * as Feed from "../helpers/feed";


export const AddStaker = async (req: express.Request, res: express.Response): Promise<void> => {
  const { staker, reputation }: { staker: string, reputation: number } = req.body;
  const resp = await Feed.AddStaker(staker, reputation);
  if (!resp)
    throw new Error("error at controller AddStaker")
  res.status(200).json({ status: 200, message: "staker added" })
}

export const RemoveStaker = async (req: express.Request, res: express.Response): Promise<void> => {
  const { staker }: { staker: string } = req.body;
  const resp = await Feed.RemoveStaker(staker);
  if (!resp)
    throw new Error("error at controller RemoveStaker")
  res.status(200).json({ status: 200, message: "staker removed" })
}

export const UpdateReputation = async (req: express.Request, res: express.Response): Promise<void> => {
  const { staker, reputation }: { staker: string, reputation: number } = req.body;
  const resp = await Feed.UpdateAddresReputation(staker, reputation);
  if (!resp)
    throw new Error("error at controller UpdateReputation")
  res.status(200).json({ status: 200, message: "staker reputation updated" })
}