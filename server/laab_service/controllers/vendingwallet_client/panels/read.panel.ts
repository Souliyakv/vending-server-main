import { CashVendingLimiterValidationFunc } from "../funcs/cashLimiterValidation.func";
import { Request, Response } from "express";
import { CashinValidationFunc } from "../funcs/cashinValidation.func";
import { ShowVendingWalletCoinBalanceFunc } from "../funcs/showVendingWalletCoinBalance.func";
import { PaidValidationFunc } from "../funcs/paidValidation.func";
import { TransferValidationFunc } from "../funcs/transferValidation.func";
import { CreateSMCFunc } from "../funcs/createSMC.func";
import { LoadSMCFunc } from "../funcs/loadSMC.func";
import { CreateEPINFunc } from "../funcs/createEPIN.func";
import { IENMessage, message, IStatus } from "../../../../services/laab.service";
import { CashVendingWalletValidationFunc } from "../funcs/cashVendingWalletValidation.func";
import { FindEPINShortCodeFunc } from "../funcs/findEPINShortcode.func";

export class ReadPanel {

    constructor() {}

    public ShowVendinWalletCoinBalance(req: Request, res: Response) {
        try {
            const func = new ShowVendingWalletCoinBalanceFunc();
            const data = req.body;
            func.Init(data).then(run => {
                if (run.message != IENMessage.success) {
                    message([], run, IStatus.unsuccess, res);
                } else {
                    delete run.message;
                    message(run, IENMessage.success, IStatus.success, res);
                }

            }).catch(error => message([], error.message, IStatus.unsuccess, res));

        } catch (error) {
            message([], error.message, IStatus.unsuccess, res);
        }
    }

    public CashVendingLimiterValidation(req: Request, res: Response) {
        try {
            const func = new CashVendingLimiterValidationFunc();
            const data = req.body;
            func.Init(data).then(run => {
                if (run.message != IENMessage.success) {
                    message([], run, IStatus.unsuccess, res);
                } else {
                    delete run.message;
                    message(run, IENMessage.success, IStatus.success, res);
                }

            }).catch(error => message([], error.message, IStatus.unsuccess, res));

        } catch (error) {
            message([], error.message, IStatus.unsuccess, res);
        }
    }

    public CashVendingWalletValidation(req: Request, res: Response) {
        try {
            const func = new CashVendingWalletValidationFunc();
            const data = req.body;
            func.Init(data).then(run => {
                if (run.message != IENMessage.success) {
                    message([], run, IStatus.unsuccess, res);
                } else {
                    delete run.message;
                    message(run, IENMessage.success, IStatus.success, res);
                }

            }).catch(error => message([], error.message, IStatus.unsuccess, res));

        } catch (error) {
            message([], error.message, IStatus.unsuccess, res);
        }
    }

    public CashinValidation(req: Request, res: Response) {
        try {
            const func = new CashinValidationFunc();
            const data = req.body;
            func.Init(data).then(run => {
                if (run.message != IENMessage.success) {
                    message([], run, IStatus.unsuccess, res);
                } else {
                    delete run.message;
                    message(run, IENMessage.success, IStatus.success, res);
                }

            }).catch(error => message([], error.message, IStatus.unsuccess, res));

        } catch (error) {
            message([], error.message, IStatus.unsuccess, res);
        }
    }

    public LoadSMC(req: Request, res: Response) {
        try {
            const func = new LoadSMCFunc();
            const data = req.body;
            func.Init(data).then(run => {
                if (run.message != IENMessage.success) {
                    message([], run, IStatus.unsuccess, res);
                } else {
                    delete run.message;
                    message(run, IENMessage.success, IStatus.success, res);
                }

            }).catch(error => message([], error.message, IStatus.unsuccess, res));

        } catch (error) {
            message([], error.message, IStatus.unsuccess, res);
        }
    }



    public TransferValidation(req: Request, res: Response) {
        try {
            const func = new TransferValidationFunc();
            const data = req.body;
            func.Init(data).then(run => {
                if (run.message != IENMessage.success) {
                    message([], run, IStatus.unsuccess, res);
                } else {
                    delete run.message;
                    message(run, IENMessage.success, IStatus.success, res);
                }

            }).catch(error => message([], error.message, IStatus.unsuccess, res));

        } catch (error) {
            message([], error.message, IStatus.unsuccess, res);
        }
    }

    public FindEPINShortcode(req: Request, res: Response) {
        try {
            const func = new FindEPINShortCodeFunc();
            const data = req.body;
            func.Init(data).then(run => {
                if (run.message != IENMessage.success) {
                    message([], run, IStatus.unsuccess, res);
                } else {
                    delete run.message;
                    message(run, IENMessage.success, IStatus.success, res);
                }

            }).catch(error => message([], error.message, IStatus.unsuccess, res));

        } catch (error) {
            message([], error.message, IStatus.unsuccess, res);
        }
    }
}