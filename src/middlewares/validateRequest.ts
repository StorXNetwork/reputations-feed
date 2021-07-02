import { Request, Response, NextFunction } from 'express';
const { validationResult } = require("express-validator");
const { RequestValidationError } = require("../helpers/errors");

export const ValidateRequest = (checks: any) => {
  return async function (req: Request, res: Response, next: NextFunction) {
    for (let check of checks) {
      await check.run(req);
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    } else {
      next();
    }
  };
};
