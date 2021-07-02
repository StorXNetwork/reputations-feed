import winston from 'winston';

declare global {
  namespace NodeJS {
    interface Global {
      logger: winston.Logger
    }
  }
}
export default global;