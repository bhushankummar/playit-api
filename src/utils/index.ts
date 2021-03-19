import { IRequest } from '../interface/IRequest';
import { ObjectID } from 'mongodb'

// const debug = Debug('PL:Utils');

export const url = (req: IRequest) => {
  return `${req.protocol  }://${  req.get('host')}`;
};

export const toObjectId = (value: string | ObjectID): ObjectID => {
  return typeof value === 'string' ? new ObjectID(value) : value
}