import { Transaction } from "sequelize";
import axios from "axios";
import { EPIN_Generate, IENMessage, LAAB_CoinTransfer, LAAB_CreateCouponCoinWalletSMC, LAAB_FindMyCoinWallet, LAAB_FindMyWallet, LAAB_GenerateVendingOTP, LAAB_Register2, LAAB_ShowMyCoinWalletBalance, translateUToSU } from "../../../../services/laab.service";
import { IVendingWalletType } from "../../../models/base.model";
import { dbConnection, epinshortcodeEntity, vendingWallet } from "../../../../entities";

export class CreateEPINFunc {

    private transaction: Transaction;
    private machineId:string;
    private phonenumber: string;
    private detail: any = {} as any;

    private ownerUuid: string;
    private sender: string;
    private connection: any = {} as any;
    private coinName: string;
    private passkeys: string;
    private uuid: string;
    private response: any = {} as any;
    private errorsection: string = '';

    constructor(){}

    public Init(params: any): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            this.transaction = await dbConnection.transaction();
            try {

                console.log(`create epin -------------------------------`, 1);
                this.errorsection = '1';

                this.InitParams(params);

                console.log(`create epin`, 2);
                this.errorsection = '2';

                const ValidateParams = this.ValidateParams();
                if (ValidateParams != IENMessage.success) throw new Error(ValidateParams);

                console.log(`create epin`, 3);
                this.errorsection = '3';

                const FindVendingWallet = await this.FindVendingWallet();
                if (FindVendingWallet != IENMessage.success) throw new Error(FindVendingWallet);

                console.log(`create epin`, 4);
                this.errorsection = '4';

                const FindEPINShortCode = await this.FindEPINShortCode();
                if (FindEPINShortCode != IENMessage.success) throw new Error(FindEPINShortCode);

                console.log(`create epin`, 5);
                this.errorsection = '4';

                const UpdateEPINShortCode = await this.UpdateEPINShortCode();
                if (UpdateEPINShortCode != IENMessage.success) throw new Error(UpdateEPINShortCode);

                console.log(`create epin`, 6);
                this.errorsection = '5';

                const CreateEPINCoupon = await this.CreateEPINCoupon();
                if (CreateEPINCoupon != IENMessage.success) throw new Error(CreateEPINCoupon);

                console.log(`create epin`, 7);
                this.errorsection = '6';

                console.log(`create epin`, 8);
                this.errorsection = '7';

                await this.transaction.commit();
                resolve(this.response);

            } catch (error) {

                await this.transaction.rollback();
                resolve(`error ${this.errorsection} `+ error.message);
            }
        });
    }

    private InitParams(params: any) {
        this.machineId = params.machineId;
        this.phonenumber = params.phonenumber;
        this.detail = params.detail;
    }

    private ValidateParams(): string {
        if (!(this.machineId && this.phonenumber && this.detail)) return IENMessage.parametersEmpty;
        return IENMessage.success;
    }

    private FindVendingWallet(): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            try {
                
                let run: any = await vendingWallet.findOne({ where: { machineClientId: this.machineId, walletType: IVendingWalletType.vendingWallet } });
                if (run == null) return resolve(IENMessage.notFoundYourVendingWallet);
                this.ownerUuid = run.ownerUuid;
                this.sender = translateUToSU(run.uuid);
                this.coinName = run.coinName;
                this.passkeys = run.passkeys;
                resolve(IENMessage.success);

            } catch (error) {
                resolve(error.message);
            }
        });
    }

    private FindEPINShortCode(): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            try {
                
                const condition = {
                    where: {
                        ownerUuid: this.ownerUuid,
                        creator: this.sender,
                        phonenumber: this.phonenumber,
                        SMC: {
                            detail: {
                                link: this.detail.link
                            }
                        },
                        EPIN: {
                            destination: '',
                            coinname: '',
                            name: ''
                        }
                    }
                }
                const run = await epinshortcodeEntity.findOne(condition);
                if (run == null) return resolve(IENMessage.notFoundEPINShortCode);

                this.connection = run;
                resolve(IENMessage.success);

            } catch (error) {
                resolve(error.message);
            }
        });
    }

    private UpdateEPINShortCode(): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            try {
                
                this.connection.EPIN = {
                    destination: this.detail.items[0].qrcode[0],
                    coinname: this.coinName,
                    name: this.detail.sender
                }
                const run = await this.connection.save({ transaction: this.transaction });
                if (!run) return resolve(this.response);
                this.uuid = run.uuid;

                resolve(IENMessage.success);

            } catch (error) {
                resolve(error.message);
            }
        });
    }


    private CreateEPINCoupon(): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            try {

                const params = {
                    name: this.detail.name,
                    link: this.detail.link,
                    price: this.detail.price,
                    sender: this.detail.sender,
                    usecode: false,
                    items: this.detail.items,
                    
                    // access by passkey
                    phonenumber: this.sender,
                    passkeys: this.passkeys
                }

                console.log(`-->`, params);

                const run = await axios.post(EPIN_Generate, params);
                console.log(`response`, run.data);
                if (run.data.status != 1) return resolve(this.response);

                this.response = {
                    EPIN: {
                        uuid: this.uuid,
                        destination: this.detail.items[0].qrcode[0],
                        coinname: this.coinName,
                        name: this.detail.sender
                    },
                    message: IENMessage.success
                }
                resolve(IENMessage.success);

            } catch (error) {
                resolve(error.message);
            }
        });
    }

}