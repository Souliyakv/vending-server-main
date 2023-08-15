import axios from "axios";
import { EPIN_FindQRScan, EPIN_QRScan, IENMessage, LAAB_CoinTransfer, translateSUToU, translateUToSU } from "../../../../services/laab.service";
import { IVendingWalletType } from "../../../models/base.model";
import { dbConnection, epinshortcodeEntity, vendingWallet } from "../../../../entities";
import { Op, Transaction } from "sequelize";

// if scan epin qr success vending wallet will transfer to merchant
export class CounterCashout_CashValidationFunc {

    private transaction: Transaction;

    private phonenumber: string;
    private destination: string;
    private coinname: string;

    private creator: string;
    private sender: string;
    private ownerUuid: string;


    private connection: any = {} as any;
    private bill: any = {} as any;
    private passkeys: string;
    private response: any = {} as any;

    constructor() {}

    public Init(params: any): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            this.transaction = await dbConnection.transaction();
            try {

                console.log(`counter cash out cash validation`, 1);

                this.InitParams(params);

                console.log(`counter cash out cash validation`, 2);

                const ValidateParams = this.ValidateParams();
                if (ValidateParams != IENMessage.success) throw new Error(ValidateParams);

                console.log(`counter cash out cash validation`, 3);

                const FindEPINShortCode = await this.FindEPINShortCode();
                if (FindEPINShortCode != IENMessage.success) throw new Error(FindEPINShortCode);

                const FindVendingWallet = await this.FindVendingWallet();
                if (FindVendingWallet != IENMessage.success) throw new Error(FindVendingWallet);

                console.log(`counter cash out cash validation`, 4);

                const FindMerchant = await this.FindMerchant();
                if (FindMerchant != IENMessage.success) throw new Error(FindMerchant);

                console.log(`counter cash out cash validation`, 5);

                const FindEPIN = await this.FindEPIN();
                if (FindEPIN != IENMessage.success) throw new Error(FindEPIN);

                console.log(`counter cash out cash validation`, 6);

                const ScanEPIN = await this.ScanEPIN();
                if (ScanEPIN != IENMessage.success) throw new Error(ScanEPIN);

                console.log(`counter cash out cash validation`, 7);

                const UpdateEPINShortCode = await this.UpdateEPINShortCode();
                if (UpdateEPINShortCode != IENMessage.success) throw new Error(UpdateEPINShortCode);

                console.log(`counter cash out cash validation`, 8);

                console.log(`counter cash out cash validation`, 9);

                await this.transaction.commit();
                resolve(this.response);
                
            } catch (error) {

                await this.transaction.rollback();
                resolve(error.message);
            }
        });
    }

    private InitParams(params: any) {
        this.phonenumber = params.phonenumber;
        this.destination = params.destination;
        this.coinname = params.coinname;
    }

    private ValidateParams(): string {
        if (!(this.phonenumber && this.destination && this.coinname)) return IENMessage.parametersEmpty;

        return IENMessage.success;
    }

    private FindEPINShortCode(): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            try {
                
                const condition = {
                    where: {
                        phonenumber: this.phonenumber,
                        SMC: {[Op.ne]: {}},
                        EPIN: {
                            destination: this.destination,
                            coinname: this.coinname
                        },
                        counter: {
                            cash: {
                                hash: '',
                                info: ''
                            }
                        }
                    }
                }
                const run = await epinshortcodeEntity.findOne(condition);
                if (run == null) return resolve(IENMessage.notFoundEPINShortCode);
                this.creator = translateSUToU(run.creator);

                this.connection = run;
                resolve(IENMessage.success);

            } catch (error) {
                resolve(error.message);
            }
        });
    }


    private FindVendingWallet(): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            try {
                
                let run: any = await vendingWallet.findOne({ where: { uuid: this.creator, walletType: IVendingWalletType.vendingWallet } });
                if (run == null) return resolve(IENMessage.notFoundYourVendingWallet);
                this.ownerUuid = run.ownerUuid;
                resolve(IENMessage.success);

            } catch (error) {
                resolve(error.message);
            }
        });
    }

    private FindMerchant(): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            try {
                
                let run: any = await vendingWallet.findOne({ where: { ownerUuid: this.ownerUuid, walletType: IVendingWalletType.merchant } });
                if (run == null) return resolve(IENMessage.notFoundYourMerchant);
                this.sender = translateUToSU(run.uuid);
                this.passkeys = run.passkeys;
                resolve(IENMessage.success);

            } catch (error) {
                resolve(error.message);
            }
        });
    }

    private FindEPIN(): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            try {
                
                const params = {
                    qrcode: this.destination,

                    // access by passkey
                    phonenumber: this.sender,
                    passkeys: this.passkeys
                }

                const run = await axios.post(EPIN_FindQRScan, params);
                if (run.data.status != 1) return resolve(run.data.message);

                resolve(IENMessage.success);

            } catch (error) {
                resolve(error.message);
            }
        });
    }

    private ScanEPIN(): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            try {
                
                // receive laab by merchant account
                const params = {
                    qrcode: this.destination,

                    // access by passkey
                    phonenumber: this.sender,
                    passkeys: this.passkeys
                }

                const run = await axios.post(EPIN_QRScan, params);
                if (run.data.status != 1) return resolve(run.data.message);
                this.bill = run.data.info.bill;
                resolve(IENMessage.success);

            } catch (error) {
                resolve(error.message);
            }
        });
    }

    private UpdateEPINShortCode(): Promise<any> {
        return new Promise<any> (async (resolve, reject) => {
            try {
                
                this.connection.counter = {
                    isActive: false,
                    cash: {
                        hash: this.bill.hash,
                        info: this.bill.info
                    }
                }
                
                const run = await this.connection.save({ transaction: this.transaction });
                if (!run) return resolve(IENMessage.scanQREPINsuccessButSaveLogEPINShortCodeFail);
                
                this.response = {
                    message: IENMessage.success
                }
                resolve(IENMessage.success);

            } catch (error) {
                resolve(error.message);
            }
        });
    }

}
