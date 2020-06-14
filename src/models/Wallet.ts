import { prop, getModelForClass, arrayProp, Ref } from '@typegoose/typegoose';
import { Account } from './Account';

export class Wallet {
  @prop({ required: true })
  publicKey!: string;

  @prop({ default: 0 })
  hdIndex!: number;

  @prop({ required: true })
  apiKey!: string;

  @arrayProp({ itemsRef: 'Account' })
  accounts!: Ref<Account>[];
}

const WalletModel = getModelForClass(Wallet);

export default WalletModel;
