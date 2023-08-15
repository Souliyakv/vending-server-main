import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
} from '@angular/core';
import { ApiService } from '../services/api.service';
import {
  EClientCommand,
  IBillProcess,
  IMachineClientID,
  IMachineId,
  IMMoneyQRRes,
  IStock,
  IVendingMachineBill,
  IVendingMachineSale,
} from '../services/syste.model';
import { ModalController, Platform } from '@ionic/angular';
// import { BarcodeScanner, BarcodeScannerOptions } from "@ionic-native/barcode-scanner/ngx";
import { QrpayPage } from '../qrpay/qrpay.page';
import qrlogo from 'qrcode-with-logos';
import { StocksalePage } from '../stocksale/stocksale.page';
import { IonicStorageService } from '../ionic-storage.service';
import { CachingService } from '../services/caching.service';
import { environment } from 'src/environments/environment';
import { ShowcartPage } from '../showcart/showcart.page';

import { VendingAPIService } from '../services/vending-api.service';
import { LoadVendingWalletCoinBalanceProcess } from './LAAB_processes/loadVendingWalletCoinBalance.process';
import { IENMessage } from '../models/base.model';
import { CashValidationProcess } from './LAAB_processes/cashValidation.process';
import { CashinValidationProcess } from './LAAB_processes/cashinValidation.process';
import { LaabGoPage } from './LAAB/laab-go/laab-go.page';
import { EpinCashOutPage } from './LAAB/epin-cash-out/epin-cash-out.page';
import * as cryptojs from 'crypto-js';

import { RemainingbillsPage } from '../remainingbills/remainingbills.page';
import * as QRCode from 'qrcode';
import { LaabCashinShowCodePage } from './LAAB/laab-cashin-show-code/laab-cashin-show-code.page';
import { LaabCashoutPage } from './LAAB/laab-cashout/laab-cashout.page';
import { WsapiService } from '../services/wsapi.service';
import { IMachineStatus } from '../services/service';
import { HowtoPage } from '../howto/howto.page';
import { StackCashoutPage } from './LAAB/stack-cashout/stack-cashout.page';
import { EpinShowCodePage } from './LAAB/epin-show-code/epin-show-code.page';
import { MmoneyIosAndroidDownloadPage } from './MMoney/mmoney-ios-android-download/mmoney-ios-android-download.page';
import { SettingControlMenuPage } from '../setting/pages/setting-control-menu/setting-control-menu.page';
import { ControlMenuService } from '../services/control-menu.service';
import { TopupAndServicePage } from './Vending/topup-and-service/topup-and-service.page';
import { VendingGoPage } from './Vending/vending-go/vending-go.page';
import { HowtoPageModule } from '../howto/howto.module';
import { HowToPage } from './Vending/how-to/how-to.page';
import { LoadStockListProcess } from './Vending_processes/loadStockList.process';
import { AppcachingserviceService } from '../services/appcachingservice.service';
import Swal from 'sweetalert2';
import { AdsPage } from '../ads/ads.page';

var host = window.location.protocol + '//' + window.location.host;
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page {
  private loadVendingWalletCoinBalanceProcess: LoadVendingWalletCoinBalanceProcess;
  private cashValidationProcess: CashValidationProcess;
  private cashinValidationProcess: CashinValidationProcess;
  private loadStockListProcess: LoadStockListProcess;

  private CONTROL_MENUList: Array<{ name: string; status: boolean }> = [];
  private links: NodeListOf<HTMLLinkElement>;

  private ownerUuid: string;
  filemanagerURL: string = environment.filemanagerurl;

  acceptcash: number;
  _machineStatus = { status: {} as IMachineStatus } as any;

  production = environment.production;

  mmLogo = 'assets/icon/mmoney.png';

  vendingOnSale = new Array<IVendingMachineSale>();
  vendingBill = new Array<IVendingMachineBill>();
  vendingBillPaid = new Array<IVendingMachineBill>();
  onlineMachines = new Array<IMachineClientID>();

  bills = {} as IVendingMachineBill;

  machineId = {} as IMachineId;

  url = environment.url;
  orders = new Array<IVendingMachineSale>();
  swidth = 0;
  sheight = 0;
  smode = 2;

  summarizeOrder = new Array<IVendingMachineSale>();
  getTotalSale = { q: 0, t: 0 };

  saleList = new Array<IVendingMachineSale>();
  timeoutHandler: any;
  manageStockCount = 0;
  compensation = 0;
  _checkHowTo_Duration = 1000 * 60 * 10;
  _checkHowTo_Time = 1000 * 60 * 10; // 10 minutes
  _howToT: any;
  _howToPage: HTMLIonModalElement;
  isFirstLoad = true;
  autopilot = { auto: 0 };
  constructor(
    private ref: ChangeDetectorRef,
    public apiService: ApiService,
    platform: Platform,
    // private scanner: @ionic-native/serial,
    public storage: IonicStorageService,
    public appCaching: CachingService,
    private vendingAPIService: VendingAPIService,
    private WSAPIService: WsapiService,
    private cashingService: AppcachingserviceService
  ) {
    this.autopilot = this.apiService.autopilot;
    const that = this;
    this.dynamicControlMenu();

    this._machineStatus = this.apiService._machineStatus;
    this.autoUpdateCash();

    this.loadVendingWalletCoinBalanceProcess =
      new LoadVendingWalletCoinBalanceProcess(
        this.apiService,
        this.vendingAPIService
      );
    this.cashValidationProcess = new CashValidationProcess(
      this.apiService,
      this.vendingAPIService
    );
    this.cashinValidationProcess = new CashinValidationProcess(
      this.apiService,
      this.vendingAPIService
    );
    this.loadStockListProcess = new LoadStockListProcess(
      this.apiService,
      this.cashingService
    );

    // alert('V1_'+this.mmLogo);

    // ref.detach();
    // this.zone.runOutsideAngular(()=>{
    this.machineId = this.apiService.machineId;
    this.url = this.apiService.url;
    // this.initVendingSale();

    platform.ready().then(() => {
      this.ownerUuid = localStorage.getItem('machineId');
      this.apiService.audioElement = document.createElement('audio');
      this.apiService.backGroundMusicElement = document.createElement('audio');
      console.log('Width: ' + (this.swidth = platform.width()));
      console.log('Height: ' + (this.sheight = platform.height()));
      console.log('screen width', this.swidth, 'screen height', this.sheight);
      if (this.swidth > 550) this.smode = 3;
      else this.smode = 2;
      // setTimeout(() => {
      console.log('loading sale list');

      // }, 1000);
      this.vendingOnSale = ApiService.vendingOnSale;
      this.vendingBillPaid = this.apiService.vendingBillPaid;
      this.vendingBill = this.apiService.vendingBill;
      this.onlineMachines = this.apiService.onlineMachines;

      this.apiService.wsapi.loginSubscription.subscribe((r) => {
        if (!r) return console.log('empty');
        console.log('ws login subscription', r);
        this.apiService.myTab1 = this;
        this.apiService.clientId.clientId = r.clientId;
        this.apiService.wsAlive.time = new Date();
        this.apiService.wsAlive.isAlive = this.apiService.checkOnlineStatus();
        // this.loadSaleList();
        // this.initStock();
        if(this.isFirstLoad){
          // let adsOn =false
          setInterval(()=>{
            if(this.autopilot.auto>=6){
              // load ads when no active
              // if(!adsOn)
              const adsSlide = localStorage.getItem('isAds');
              if (adsSlide != undefined && adsSlide == 'yes' ) {
                this.apiService.showModal(AdsPage).then(r=>{
                  r.present();
                  this.checkActiveModal(r);
                  // adsOn=true;
                  // r.onDidDismiss().then(rx=>{
                  //   adsOn=false;
                  // })
                })
              }


              this.apiService.soundGreeting();
              setTimeout(() => {
                this.apiService.soundPleaseVisit();
              }, 5000);
  
              setTimeout(() => {
                
                if(new Date().getTime()%2){
                  setTimeout(() => {
                    this.apiService.soundPointToCashOut();
                  }, 5000);
                  setTimeout(() => {
                    this.apiService.soundPleaseViewVideo();
                  }, 10000);
                  setTimeout(() => {
                    this.apiService.soundCheckTicketsExist();
                  }, 15000);
                  setTimeout(() => {
                    if(this.apiService.cash.amount>0)this.apiService.soundMachineHasSomeChanges();
                  }, 20000);
                }
                
              }, 10000);
              this.autopilot.auto=0;
              
            }else{
              this.autopilot.auto++;
            }
          }, 10000);

          this.loadStock();
          this.isFirstLoad = false;
        }
      });
      this.apiService.onDeductOrderUpdate((position) => {
        try {
          // const x = JSON.parse(JSON.stringify(that.vendingOnSale));
          // console.log('before SAVE ==>',x);
          // setTimeout(() => {
          // this.storage.get('saleStock', 'stock').then((s) => {
          //   try {
          //     console.log(`storage get`, s);

          //     const saleitems = JSON.parse(
          //       JSON.stringify(s?.v ? s.v : [])
          //     ) as Array<IVendingMachineSale>;
          //     that.apiService.saveSale(saleitems).subscribe((r) => {
          //       console.log(r);
          //       if (r.status) {
          //         console.log(`save sale success`);
          //       } else {
          //         this.apiService.simpleMessage(IENMessage.saveSaleFail);
          //       }
          //     });
          //   } catch (error) {
          //     console.log('error', error);
          //   }
          // });

          // }, 1000);

          // for stack order UI
          const ind = this.orders.findIndex((v) => v.position == position);
          if (ind != -1) this.orders.splice(ind, 1);
        } catch (error) {
          console.log(' error on event emitter');
        }
      });

      // const vsale = this.saleList;
      // this.apiService.wsapi.onBillProcess((r) => {
      //   if (!r) return console.log('empty');
      //   console.log('ws process subscription', r);
      //   const message =
      //     'processing slot ' +
      //     r.position +
      //     `==>${r.position}` +
      //     '; ' +
      //     r?.bill?.vendingsales?.find((v) => v.position == r.position)?.stock
      //       ?.name;

      //   // const x = this.vendingOnSale?.find(v => r?.bill?.vendingsales.find(vx => vx.stock.id == v.stock.id && r.position.position + '' == vx.position + ''));

      //   const x = vsale.find((v) => {
      //     if (v.position == r.position) {
      //       v.stock.qtty--;
      //       return true;
      //     }
      //   });
      //   console.log('X', x, r.position, x && r.position);

      //   if (x && r.position) {
      //     // # save to machine
      //     console.log('saveSale', vsale);

      //     // this.clearWaitingT();

      //     // PLAY SOUNDS
      //     this.apiService.soundCompleted();
      //     setTimeout(() => {
      //       this.apiService.soundThankYou();
      //     }, 2000);
      //     that.apiService.toast
      //       .create({ message, duration: 2000 })
      //       .then((r) => {
      //         r.present();
      //       });

      //     r.bill.updatedAt = new Date();
      //   } else if (!r.position) {
      //     // PLAY SOUNDS
      //     this.apiService.soundSystemError();
      //     this.apiService.alert
      //       .create({
      //         header: 'Alert',
      //         message,
      //         buttons: [
      //           {
      //             text: 'OK',
      //             role: 'confirm',
      //             handler: () => {},
      //           },
      //         ],
      //       })
      //       .then((v) => v.present());
      //   }

      //   console.log(`vendingOnSale-->`, vsale);
      //   this.storage.set('saleStock', vsale, 'stock').then((r) => {
      //     // that.deductOrderUpdate(x.position);
      //   });

      //   // });
      // });
    });
    // });

    setTimeout(() => {
      // this.checkHowTo();
    }, 5000);
  }
  setActive() {
    console.log('active');
    this._checkHowTo_Time = this._checkHowTo_Duration + 1000;
  }

  autoUpdateCash() {
    this.WSAPIService.balanceUpdateSubscription.subscribe(async (r) => {
      if (r) {
        await this.initVendingWalletCoinBalance();
      }
    });
  }

  refresh() {
    window.location.reload();
  }
  initStock() {
    // if (this.vendingOnSale?.length) return;
    this.apiService.loadVendingSale().subscribe((r) => {
      try {
        console.log(`load vending sale`, r.data);
        if (r.status) {
          const saleServer = r.data as Array<IVendingMachineSale>;
          console.log('saleServer', saleServer);

          this.apiService.newProductItems(saleServer);
          // saleServer.forEach(async (v,i)=>{
          //   setTimeout(async () => {
          //     await this.apiService.saveImage(v.stock.id,v.stock.image);
          //   }, 100*i);

          // })
          // window.location.reload();
          this.initVendingWalletCoinBalance().then(() => {});
          this.storage.get('saleStock', 'stock').then((s) => {
            try {
              console.log(`storage get`, s);

              const saleitems = JSON.parse(
                JSON.stringify(s?.v ? s.v : [])
              ) as Array<IVendingMachineSale>;

              // console.log(`sale server`, JSON.stringify(saleServer.map(item => { return { uuid: item.stock.uuid } })));

              console.log(`saleitems`, saleitems);

              // reset everytime ws activate
              // console.log(' this.vendingOnSale.length 1', this.vendingOnSale.length);

              if (this.vendingOnSale?.length) this.vendingOnSale.length = 0;

              if (this.saleList?.length) this.saleList.length = 0;

              // console.log(' this.vendingOnSale.length 2', this.~vendingOnSale.length);
              // console.log(`sale list der 1`, this.saleList.length);

              this.vendingOnSale.push(...saleitems);
              this.saleList.push(...this.vendingOnSale);
              if (this.saleList[0]?.position == 0) this.compensation = 1;
              this.saleList.sort((a, b) => {
                if (a.position < b.position) return -1;
              });
              console.log(`sale list der ni`, this.saleList);
              setTimeout(() => {
                this.showBills();
              }, 1000);

              console.log(`sale list der 2`, this.saleList.length);
            } catch (error) {
              console.log('error', error);
            }
          });
        } else {
          alert(r.message);
        }
      } catch (error) {
        console.log('error', error);
      }
    });
  }

  loadStock(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        // 100 x 240

        // await this.cashingService.remove(this.ownerUuid);
        // return resolve(IENMessage.success);

        // save image
        const params = {
          ownerUuid: this.ownerUuid,
          filemanagerURL: this.filemanagerURL,
        };
        console.log(`params`, params);
        const run = await this.loadStockListProcess.Init(params);
        if (run.message != IENMessage.success) throw new Error(run);

        this.apiService.newProductItems(run.data[0].lists);
        this.apiService.imageList = run.data[0].imageObject;

        const s = await this.storage.get('saleStock', 'stock');
        const saleitems = JSON.parse(
          JSON.stringify(s?.v ? s.v : [])
        ) as Array<IVendingMachineSale>;
        console.log(`saleitems`, saleitems);

        if (this.vendingOnSale?.length) this.vendingOnSale.length = 0;
        if (this.saleList?.length) this.saleList.length = 0;

        const initVendingWalletCoinBalance =
          await this.initVendingWalletCoinBalance();
        if (initVendingWalletCoinBalance != IENMessage.success)
          throw new Error(initVendingWalletCoinBalance);
        if (saleitems.length) {
          this.vendingOnSale.push(...saleitems);
          this.saleList.push(...this.vendingOnSale);
          if (this.saleList[0]?.position == 0) this.compensation = 1;

          this.saleList.sort((a, b) => {
            if (a.position < b.position) return -1;
          });
          setTimeout(() => {
            this.showBills();
          }, 1000);

          resolve(IENMessage.success);
        } else {
          this.apiService.recoverSale().subscribe((r) => {
            // console.log(r);
            if (r.status) {
              ApiService.vendingOnSale.length = 0;
              console.log('recover', r.data);

              ApiService.vendingOnSale.push(...r.data);
              this.saleList.push(...this.vendingOnSale);
              if (this.saleList[0]?.position == 0) this.compensation = 1;
              this.saleList.sort((a, b) => {
                if (a.position < b.position) return -1;
              });
              setTimeout(() => {
                this.showBills();
              }, 1000);

              this.storage.set('saleStock', ApiService.vendingOnSale, 'stock');
              resolve(IENMessage.success);
            }
            this.apiService.toast
              .create({ message: r.message, duration: 200 })
              .then((r) => {
                r.present();
              });
          });
        }
      } catch (error) {
        this.apiService.simpleMessage(error.message);
        resolve(error.message);
      }
    });
  }

  endCount() {
    if (this.timeoutHandler) {
      clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
    if (this.manageStockCount >= 3) {
      this.manageStock();
    }
    this.manageStockCount = 0;
  }
  holdCount() {
    this.timeoutHandler = setInterval(() => {
      ++this.manageStockCount;
    }, 1000);
  }
  async manageStock() {
    const x = prompt('password');
    console.log(x, this.getPassword());

    // if (environment.production)
    if (
      !this.getPassword().endsWith(x?.substring(6)) ||
      !x?.startsWith(this.machineId?.otp) ||
      x?.length < 12
    )
      return;
    const m = await this.apiService.showModal(StocksalePage);
    this.checkActiveModal(m);

    m.onDidDismiss().then((r) => {
      r.data;
      console.log('manageStock', r.data);
      // if (r.data) {
      const k = 'refillSaleStock';
      this.storage.get(k + '_', k).then((rx) => {
        const b = rx.v as Array<IVendingMachineSale>;
        const s = b ? b : [];
        const u = new Date();
        this.vendingOnSale.forEach((v) => (v.updatedAt = u));
        s.unshift(...this.vendingOnSale);
        this.storage.set(k + '_', s, k);

        // setTimeout(() => {
        //   this.apiService.saveSale(s).subscribe(r=>{
        //     console.log(r);
        //     if(r.status){
        //       console.log(`save sale success`);
        //     } else {
        //       this.apiService.simpleMessage(IENMessage.saveSaleFail);
        //     }
        //   });
        // }, 500);
      });

      // } else {
      //   console.log('Canceled');

      // }
      // window.location.reload();
    });
    m.present();
  }
  // loadPaidBills() {
  //   this.apiService.loadPaidBills().subscribe(r => {
  //     console.log(r);
  //     if (r.status) {
  //       this.vendingBillPaid.push(...r.data);
  //     }
  //   })
  // }
  // loadBills() {
  //   this.apiService.loadBills().subscribe(r => {
  //     console.log(r);
  //     if (r.status) {
  //       this.vendingBill.push(...r.data);
  //     }
  //   })
  // }
  loadOnlineMachine() {
    this.apiService.loadOnlineMachine().subscribe((r) => {
      console.log(r);
      if (r.status) {
        this.onlineMachines.push(...r.data);
      }
    });
  }
  // loadSaleList() {
  //   this.apiService.loadSaleList().subscribe(r => {
  //     console.log(r);
  //     if (r.status) {
  //       this.vendingOnSale.length=0;
  //       this.saleList.length=0;
  //       this.vendingOnSale.push(...r.data);
  //       console.log('VENDING ON SALE', this.vendingOnSale);
  //       this.saleList.push(...this.getSaleList());
  //     }
  //   })
  // }

  buyMMoney(x: IVendingMachineSale) {
    if (!x) return alert('not found');
    // if (x.stock.qtty <= 0) alert('Out Of order');
    this.apiService.showLoading();
    if (x.stock.price == 0) {
      this.apiService.getFreeProduct(x.position, x.stock.id).subscribe((r) => {
        console.log(r);
        if (r.status) {
          this.apiService.toast
            .create({ message: r.message, duration: 2000 })
            .then((r) => {
              r.present();
              const y = ApiService.vendingOnSale.find(
                (v) => v.position == x.position
              );
              y.stock.qtty--;
              console.log('yyyyy', y, x);

              this.storage.set('bill_' + new Date().getTime(), y, 'bills');
              // PLAY SOUNDS
              this.storage.set('saleStock', ApiService.vendingOnSale, 'stock');
            });
        } else {
          this.apiService.toast
            .create({ message: r.message, duration: 5000 })
            .then((r) => {
              r.present();
            });
        }
        setTimeout(() => {
          this.apiService.soundThankYou();
          this.apiService.dismissLoading();
        }, 3000);
      });
    } else {
      const amount = x.stock.price * 1;

      this.apiService
        .buyMMoney([x], amount, this.machineId.machineId)
        .subscribe((r) => {
          console.log(r);
          if (r.status) {
            this.bills = r.data as IVendingMachineBill;
            // localStorage.setItem('order', JSON.stringify(this.bills));
            this.storage.set(
              'order_' + new Date().getTime(),
              this.bills,
              'orders'
            );
            new qrlogo({
              logo: '../../assets/icon/mmoney.png',
              content: this.bills.qr,
            })
              .getCanvas()
              .then((r) => {
                this.apiService.modal
                  .create({
                    component: QrpayPage,
                    componentProps: {
                      encodedData: r.toDataURL(),
                      amount,
                      ref: this.bills.paymentref,
                    },
                    cssClass: 'dialog-fullscreen',
                  })
                  .then((r) => {
                    r.present();
                    this.checkActiveModal(r);

                  });
              });

            // this.scanner.encode(this.scanner.Encode.TEXT_TYPE, this.bills.qr).then(
            //   res => {
            //     console.log(res);
            //     this.modal.create({ component: QrpayPage, componentProps: { encodedData: res } }).then(r => {
            //       r.present();
            //     })
            //   }, error => {
            //     alert(error);
            //   }
            // );
          } else {
            this.apiService.toast
              .create({ message: r.message, duration: 5000 })
              .then((r) => {
                r.present();
              });
          }
          setTimeout(() => {
            this.apiService.dismissLoading();
          }, 1000);
        });
    }
  }
  buyManyMMoney() {
    if (!this.orders.length) return alert('Please add any items first');
    const amount = this.orders.reduce(
      (a, b) => a + b.stock.price * b.stock.qtty,
      0
    );
    // console.log('ids', this.orders.map(v => { return { id: v.stock.id + '', position: v.position } }));
    this.apiService.showLoading();
    console.log(this.orders, amount);
    this.apiService
      .buyMMoney(this.orders, amount, this.machineId.machineId)
      .subscribe((r) => {
        console.log(r);
        if (r.status) {
          this.bills = r.data as IVendingMachineBill;
          localStorage.setItem('order', JSON.stringify(this.bills));
          new qrlogo({
            logo: '../../assets/icon/mmoney.png',
            content: this.bills.qr,
          })
            .getCanvas()
            .then((r) => {
              this.apiService.modal
                .create({
                  component: QrpayPage,
                  componentProps: {
                    encodedData: r.toDataURL(),
                    amount,
                    ref: this.bills.paymentref,
                  },
                  cssClass: 'dialog-fullscreen',
                })
                .then((r) => {
                  r.present();
                  this.checkActiveModal(r);

                });
            });
          // this.scanner.encode(this.scanner.Encode.TEXT_TYPE, this.bills.qr).then(
          //   res => {
          //     console.log(res);
          //     this.modal.create({ component: QrpayPage, componentProps: { encodedData: res } }).then(r => {
          //       r.present();
          //     })
          //   }, error => {
          //     alert(error);
          //   }
          // );
        }
        this.apiService.dismissLoading();
        this.getTotalSale.q = 0;
        this.getTotalSale.t = 0;
        // this.orders = [];
        this.summarizeOrder = [];
      });
  }

  addOrder(x: IVendingMachineSale) {
    try {
      this.autopilot.auto = 0;
      console.log(`allow vending`, this.WSAPIService?.setting_allowVending);

      if (this.WSAPIService?.setting_allowVending == false) {
        // this.apiService.simpleMessage('Vending is closed');
        this.apiService.soundSystemError();
        const alert = Swal.fire({
          icon: 'error',
          title: 'Vender is out of service',
          text: `Please, try again later`,
          showConfirmButton: true,
          confirmButtonText: 'OK',
          confirmButtonColor: '#EE3124',
          heightAuto: false,
        });
        setTimeout(() => {
          Swal.close();
        }, 2000);
        return;
      }
      this.setActive();
      if (!x) return alert('not found');
      const ord = this.orders.filter((v) => v.position == x.position);
      if (ord.length)
        if (ord.length >= x?.stock.qtty) return alert('Out of Stock');
      console.log('ID', x);
      console.log(`getTotalSale`, this.getTotalSale.q, this.getTotalSale.t);

      this.apiService.showLoading('', 500);

      // if (this.orders.find(v => v.position == x.position)) {
      //   const mx = x.max;
      //   // const summ = this.getSummarizeOrder();
      //   // const summ  = this.summarizeOrder;
      //   const re = this.orders.find(v => {
      //     const o = this.orders.filter(vx=>vx.stock.id==v.stock.id);
      //     console.log('o',o,'reduce',o.reduce((a,b)=>a+b.stock.qtty,0),'mx',mx,'pos',x.position,v.position);

      //     return (o.reduce((a,b)=>a+b.stock.qtty,0))+1 > mx && v.position == x.position
      //   });
      //    console.log('0x0r',this.orders, mx, re);
      //   if (re){
      //      setTimeout(() => {
      //     this.apiService.dismissLoading();
      //   }, 1000);
      //     return alert('Out of Stock');
      //   }

      // }

      // if (x.stock.qtty <= 0) alert('Out Of order');

      const y = JSON.parse(JSON.stringify(x)) as IVendingMachineSale;
      y.stock.qtty = 1;
      console.log('y', y);
      this.orders.push(y);
      //  console.log('sum',this.getSummarizeOrder());
      this.getSummarizeOrder();
      // setTimeout(() => {
      this.apiService.dismissLoading();
      // }, 1000);

      // });
    } catch (error) {
      console.log('error', error);
      alert(JSON.stringify(error));
    }
  }
  checkCartCount(position: number) {
    return this.orders.find((v) => v.position == position)?.stock?.qtty || 0;
  }
  getSummarizeOrder() {
    // this.summarizeOrder=new Array<IVendingMachineSale>();
    const o = new Array<IVendingMachineSale>();
    const ord = JSON.parse(
      JSON.stringify(this.orders)
    ) as Array<IVendingMachineSale>;
    ord.forEach((v) => {
      const x = o.find((x) => x.stock.id == v.stock.id);
      if (!x) o.push(v);
      else x.stock.qtty += 1;
    });
    console.log('OOOO', o);

    // this.summarizeOrder.push(...o);
    const t = this.getTotal();
    Object.keys(this.getTotalSale).forEach((k) => {
      this.getTotalSale[k] = t[k];
    });
    console.log(`-->`, this.getTotalSale);
    // return this.summarizeOrder;
  }
  getTotal() {
    const o = this.orders;
    console.log(`get total der`, o);
    const q = o.reduce((a, b) => {
      return a + b.stock.qtty;
    }, 0);
    const t = o.reduce((a, b) => {
      // console.log(`a`, a, `b`, b.stock.qtty, b.stock.price, b.stock.qtty * b.stock.price);
      return a + b.stock.qtty * b.stock.price;
    }, 0);
    return { q, t };
  }
  // clearOrder() {
  //   this.orders.length = 0;
  //   this.getSummarizeOrder();
  // }

  getSaleList() {
    const x = new Array<Array<IVendingMachineSale>>();

    this.vendingOnSale.forEach((v, i) => {
      if (i == this.smode) {
        x.push(this.vendingOnSale.slice(0, i));
      } else if (!(i % this.smode)) {
        x.push(this.vendingOnSale.slice(i - this.smode, i));
      } else if (i == this.vendingOnSale.length - 1) {
        x.push(
          this.vendingOnSale.slice(this.vendingOnSale.length - this.smode)
        );
      }
    });
    // console.log('x',x);

    return x;
  }
  handleRefresh(ev: any) {
    this.refresh();
  }
  // showCart() {
  //   this.apiService.showModal(ShowcartPage, { orders: this.orders, compensation: this.compensation }).then(r => {
  //     r.present();
  //   })
  // }
  getPassword() {
    let x = '';
    this.apiService.machineuuid.split('').forEach((v) => {
      !Number.isNaN(Number.parseInt(v)) ? (x += v) : '';
    });
    return x;
  }

  removeCart(i: number) {
    const x = this.orders.splice(i, 1);
    this.getSummarizeOrder();
    // const y = this.orders.findIndex(v => x[0]?.position == v.position);
    // if (y != -1) {
    //   this.orders.splice(y, 1);
    //   this.getSummarizeOrder();
    // }
  }

  refreshVendingWalletCoinBalance(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        // const machineId: string = localStorage.getItem('machineId');
        const params = {};
        const run = await this.loadVendingWalletCoinBalanceProcess.Init(params);
        if (run.message != IENMessage.success) throw new Error(run);
        this.apiService.cash.amount = run.data[0].vendingWalletCoinBalance;
        resolve(IENMessage.success);
      } catch (error) {
        this.apiService.simpleMessage(error.message);
        resolve(error.message);
      }
    });
  }
  initVendingWalletCoinBalance(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        // const machineId: string = localStorage.getItem('machineId');
        const params = {};
        const run = await this.loadVendingWalletCoinBalanceProcess.Init(params);
        if (run.message != IENMessage.success) throw new Error(run);
        this.apiService.cash.amount = run.data[0].vendingWalletCoinBalance;
        if (this.apiService.cash.amount > 0)
          this.apiService.soundMachineHasSomeChanges();
        resolve(IENMessage.success);
      } catch (error) {
        this.apiService.simpleMessage(error.message);
        resolve(error.message);
      }
    });
  }
  cashin(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        // const machineId: string = localStorage.getItem('machineId');
        let params: any = {};
        let run: any = await this.cashValidationProcess.Init(params);
        if (run.message != IENMessage.success) throw new Error(run);
        this.acceptcash = run.data[0].acceptcash;
        const cashList = await this.cashList();

        params = {
          cash: cashList,
          description: 'VENDING CASH IN',
        };
        run = await this.cashinValidationProcess.Init(params);
        if (run.message != IENMessage.success) throw new Error(run);
        this.apiService.cash.amount = Number(this.apiService.cash.amount) + Number(cashList);

        resolve(IENMessage.success);
      } catch (error) {
        await this.apiService.soundSystemError();
        this.apiService.simpleMessage(error.message);
        resolve(error.message);
      }
    });
  }
  cashList(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        let message: any = {} as any;
        let inputs: Array<any> = [
          {
            type: 'radio',
            label: '1,000',
            handler: async () => {
              await message.dismiss();
              resolve(1000);
            },
          },
          {
            type: 'radio',
            label: '5,000',
            handler: async () => {
              await message.dismiss();
              resolve(5000);
            },
          },
          {
            type: 'radio',
            label: '10,000',
            handler: async () => {
              await message.dismiss();
              resolve(10000);
            },
          },
          {
            type: 'radio',
            label: '20,000',
            handler: async () => {
              await message.dismiss();
              resolve(20000);
            },
          },
          {
            type: 'radio',
            label: '50,000',
            handler: async () => {
              await message.dismiss();
              resolve(50000);
            },
          },
          {
            type: 'radio',
            label: '100,000',
            handler: async () => {
              await message.dismiss();
              resolve(100000);
            },
          },
        ];
        // if (this.acceptcash == 100000) {
        //   inputs.splice(inputs.length - 0, 0);
        // } else if (this.acceptcash == 50000) {
        //   inputs.splice(inputs.length - 1, 1);
        // } else if (this.acceptcash == 20000) {
        //   inputs.splice(inputs.length - 2, 2);
        // } else if (this.acceptcash == 10000) {
        //   inputs.splice(inputs.length - 3, 3);
        // } else if (this.acceptcash == 5000) {
        //   inputs.splice(inputs.length - 4, 4);
        // } else {
        //   inputs = [];
        // }

        message = await this.apiService.alert.create({
          header: 'Cash In',
          inputs: inputs,
        });
        message.present();
      } catch (error) {
        resolve(error.message);
      }
    });
  }
  laabGo(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        this.summarizeOrder = JSON.parse(JSON.stringify(this.orders));

        this.summarizeOrder.forEach((item) => (item.stock.image = ''));

        console.log(`summarizeOrder`, this.summarizeOrder);
        let sum_quantity: number = 0;
        let sum_total: number = 0;
        for (let i = 0; i < this.summarizeOrder.length; i++) {
          sum_quantity += this.summarizeOrder[i].stock.qtty;
          sum_total +=
            this.summarizeOrder[i].stock.qtty *
            this.summarizeOrder[i].stock.price;
        }
        console.log(`sum total`, sum_total);
        if (this.apiService.cash.amount < sum_total) {
          await this.apiService.soundPleaseTopUpValue();
          throw new Error(IENMessage.notEnoughtCashBalance);
        }
        const sum_refund = this.apiService.cash.amount - sum_total;

        const paidLAAB = {
          command: EClientCommand.paidLAAB,
          data: {
            ids: this.summarizeOrder,
            value: sum_total,
            clientId: this.apiService.clientId.clientId,
          },
          ip: '',
          time: new Date().toString(),
          token: cryptojs
            .SHA256(
              this.apiService.machineId.machineId +
                this.apiService.machineId.otp
            )
            .toString(cryptojs.enc.Hex),
        };

        const props = {
          machineId: localStorage.getItem('machineId'),
          cash: this.apiService.cash.amount,
          quantity: sum_quantity,
          total: sum_total,
          balance: sum_refund,
          paidLAAB: paidLAAB,
        };
        console.log(`props`, props);

        this.apiService.modal
          .create({ component: LaabGoPage, componentProps: props })
          .then((r) => {
            r.present();
            this.checkActiveModal(r);

          });
      } catch (error) {
        this.apiService.simpleMessage(error.message);
        resolve(error.message);
      }
    });
  }
  clearStockAfterLAABGo() {
    this.orders = [];
    this.getTotalSale.q = 0;
    this.getTotalSale.t = 0;
  }
  epinCashOut(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        this.apiService.modal
          .create({ component: EpinCashOutPage, componentProps: {} })
          .then((r) => {
            r.present();
            this.checkActiveModal(r);

          });
      } catch (error) {
        resolve(error.message);
      }
    });
  }
  laabCashin(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        const disable =
          this.apiService.controlMenuService.disableControlMenuFunction(
            'menu-laab-cashin'
          );
        if (disable == undefined || disable == false)
          return resolve(IENMessage.success);

        // const machineId: string = localStorage.getItem('machineId');
        let params: any = {};
        let run: any = await this.cashValidationProcess.Init(params);
        if (run.message != IENMessage.success) throw new Error(run);
        this.acceptcash = run.data[0].acceptcash;
        const cashList = await this.cashList();

        params = {
          cash: cashList,
          description: 'VENDING CASH IN',
        };
        console.log(`params`, params);

        let qrModel = {
          type: 'CQR',
          mode: 'COIN',
          destination: this.apiService.laabuuid,
          amount: cashList,
          expire: '',
          options: {
            coinname: this.apiService.coinName,
            name: this.apiService.name,
          },
        };

        QRCode.toDataURL(JSON.stringify(qrModel)).then(async (r) => {
          const props = {
            qrImage: r,
          };
          this.apiService.modal
            .create({
              component: LaabCashinShowCodePage,
              componentProps: props,
            })
            .then((r) => {
              r.present();
              resolve(IENMessage.success);
              this.checkActiveModal(r);

            });
        });
      } catch (error) {
        this.apiService.simpleMessage(error.message);
        resolve(error.message);
      }
    });
  }
  checkActiveModal(rx:HTMLIonModalElement){
    const t = setInterval(() => {
      this.autopilot.auto=0;
    }, 1000);
    rx.onDidDismiss().then(rx=>{
      clearInterval(t);
    })

  }
  laabCashout(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        if (this.apiService.cash.amount == 0)
          throw new Error(IENMessage.thereIsNotBalance);

        const props = {};
        this.apiService.modal
          .create({ component: LaabCashoutPage, componentProps: props })
          .then((r) => {
            r.present();
            resolve(IENMessage.success);
            this.checkActiveModal(r);
          });
      } catch (error) {
        this.apiService.simpleMessage(error.message);
        this.apiService.soundPleaseTopUpValue();
        resolve(error.message);
      }
    });
  }
  showBills() {
    console.log(`here`);
    this.apiService.loadDeliveryingBills().subscribe((r) => {
      console.log(`response`, r);
      if (r.status) {
        // this.apiService.dismissModal();
        this.apiService.pb = r.data as Array<IBillProcess>;
        if (this.apiService.pb.length){
          this.apiService
            .showModal(RemainingbillsPage, { r: this.apiService.pb })
            .then((r) => {
              r.present();
              this.checkActiveModal(r);
            });
        }
          
      } else {
        this.apiService.toast
          .create({ message: r.message, duration: 5000 })
          .then((r) => {
            r.present();
          });
      }
    });
  }
  public reshowBills(count: number): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        let loading = this.apiService.load.create({
          message: 'Please wait...',
        });

        if (count > 0) {
          (await loading).present();
          let i = setTimeout(async () => {
            (await loading).dismiss();
            this.showBills();
          }, 1000);
        }

        resolve(IENMessage.success);
      } catch (error) {
        this.apiService.simpleMessage(error.message);
        resolve(error.message);
      }
    });
  }
  public openStackCashOutPage(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        if (this.apiService.cash.amount == 0)
          throw new Error(IENMessage.thereIsNotBalance);

        // ##here
        this.apiService.modal
          .create({ component: StackCashoutPage })
          .then((r) => {
            r.present();
            this.checkActiveModal(r);

          });

        resolve(IENMessage.success);
      } catch (error) {
        this.apiService.simpleMessage(error.message);
        resolve(error.message);
      }
    });
  }

  public ShowMMoneyAppLink() {
    // this.refreshControlMenuList();

    const ios_link: string =
      'https://apps.apple.com/la/app/m-money/id1513863808';
    const android_link: string =
      'https://play.google.com/store/apps/details?id=com.ltc.wallet';
    const props = {
      links: [android_link, ios_link],
    };

    this.apiService.modal
      .create({
        component: MmoneyIosAndroidDownloadPage,
        componentProps: props,
      })
      .then((r) => {
        r.present();
        this.checkActiveModal(r);

      });
  }

  dynamicControlMenu() {
    this.refreshControlMenuList();
    let i = setInterval(() => {
      if (this.links == undefined) {
        this.links = document.querySelectorAll(
          '.control-menu'
        ) as NodeListOf<HTMLLinkElement>;
        ControlMenuService.tab1PageLinks = this.links;
      }

      this.links = ControlMenuService.tab1PageLinks;
      this.animateControlMenu(this.links);

      this.apiService.controlMenuService.CONTROL_MENU.subscribe((r) => {
        if (r) this.animateControlMenu(this.links, r);
      });
      clearInterval(i);
    });
  }
  animateControlMenu(links: NodeListOf<HTMLLinkElement>, res?: any) {
    links.forEach((item) => {
      const name = item.className.split(' ')[2];
      if (res) {
        res.forEach((menu) => {
          if (name == menu.name) {
            if (menu.status == true) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          }
        });
      } else {
        this.CONTROL_MENUList.forEach((menu) => {
          if (name == menu.name) {
            if (menu.status == true) {
              item.classList.add('active');
            } else {
              item.classList.remove('active');
            }
          }
        });
      }
    });
  }
  refreshControlMenuList() {
    this.CONTROL_MENUList = JSON.parse(
      JSON.stringify(this.apiService.controlMenuService.CONTROL_MENUList)
    );
  }

  public openTopupAndServicePage(): Promise<any> {
    return new Promise<any>(async (resolve, reject) => {
      try {
        this.apiService.modal
          .create({
            component: TopupAndServicePage,
            cssClass: 'dialog-fullscreen',
          })
          .then((r) => {
            r.present();
            this.checkActiveModal(r);
          });

        resolve(IENMessage.success);
      } catch (error) {
        this.apiService.simpleMessage(error.message);
        resolve(error.message);
      }
    });
  }

  vendingGO() {
    const props = {
      summarizeOrder: this.summarizeOrder,
      getTotalSale: this.getTotalSale,
      bills: this.bills,
      machineId: this.machineId,
      orders: this.orders,
    };
    this.apiService.modal
      .create({ component: VendingGoPage, componentProps: props })
      .then((r) => {
        r.present();
        this.checkActiveModal(r);

      });
  }
  openHowToPage() {
    this.apiService.modal
      .create({
        component: HowToPage,
        componentProps: {},
        cssClass: 'dialog-fullscreen',
      })
      .then((r) => {
        r.present();
        this.checkActiveModal(r);

      });
  }
  openads() {
    this.apiService.modal
    .create({
      component: AdsPage,
      componentProps: {},
      cssClass: 'dialog-fullscreen',
    })
    .then((r) => {
      r.present();
      // this.checkActiveModal(r);

    });
  }
}
