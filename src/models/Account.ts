import { prop, arrayProp, Ref, getModelForClass } from '@typegoose/typegoose';
import { Transaction } from './Transaction';
import { Wallet } from './Wallet';

export class Account {
  @prop({ required: true })
  address!: string;

  @prop({ required: true })
  hdIndex!: number;

  @prop({ required: true, ref: 'Wallet' })
  wallet!: Ref<Wallet>;

  @arrayProp({
    ref: 'Transaction',
    foreignField: 'to',
    localField: 'address',
    justOne: false,
  })
  transactions?: Ref<Transaction>[];
}

const AccountModel = getModelForClass(Account);
export default AccountModel;
