import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../helpers/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof CustomError) {
    console.log(err);
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  global.logger.error(err);

  res.status(400).send({
    errors: [{ message: 'Something went wrong' }]
  });
};
