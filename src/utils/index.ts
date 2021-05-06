import { IRequest } from '../interface/IRequest';


// const debug = Debug('PL:Utils');

export const url = (req: IRequest) => {
  return `${req.protocol}://${req.get('host')}`;
};

export const toObjectId = (value: string): string => {
  return value;
};