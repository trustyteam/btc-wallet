import { prop, getModelForClass, Ref } from '@typegoose/typegoose';
import { Wallet } from './Wallet';

export class Transaction {
  @prop({ required: true })
  hash!: string;

  @prop({ required: true })
  to!: string;

  @prop({ required: true })
  value!: string;

  @prop()
  blockNumber!: number | null;

  @prop()
  blockHash!: string | null;

  @prop({ default: 0 })
  confimations!: number;

  @prop({ default: false })
  confirmed?: boolean;

  @prop({ required: true, ref: 'Wallet', default: null })
  wallet!: Ref<Wallet | null>;
}

const TransactionModel = getModelForClass(Transaction);
export default TransactionModel;
