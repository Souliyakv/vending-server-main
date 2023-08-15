import { Injectable } from '@angular/core';
import { setWsHeartbeat } from 'ws-heartbeat/client';
import { EMACHINE_COMMAND, IAlive, IBillProcess, IClientId, IReqModel, IResModel } from './syste.model';
import * as cryptojs from 'crypto-js';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
@Injectable({
  providedIn: 'root'
})
export class WsapiService {
  wsurl = 'ws://localhost:9009';
  webSocket={} as WebSocket;
  retries = 1;
  machineId?: string;
  otp?: string;
  public loginSubscription = new BehaviorSubject<IClientId|null>(null);
  public aliveSubscription = new BehaviorSubject<IAlive|null>(null);
  public billProcessSubscription = new BehaviorSubject<IBillProcess|null>(null);


  public refreshSubscription = new BehaviorSubject<boolean>(false);

  retry: any;
  constructor() {
  }
  connect(url: string) {
    this.wsurl = url;
    this.webSocket = new WebSocket(this.wsurl);

    clearInterval(this.retries);
    this.retry = null;
    setWsHeartbeat(this.webSocket, '{"command":"ping"}', { pingInterval: 10000, pingTimeout: 15000 });
    this.webSocket.onopen = (ev) => {
      this.retries = 0;
      console.log('connection has been opened', ev);
      // this.pingTimeout = setTimeout(() => {
      //   this.webSocket.close();
      // }, 30000 + 1000);
      // this.machineId = [];
     const  token = localStorage.getItem('lva_token');
      const req = {} as IReqModel;
      req.command= EMACHINE_COMMAND.adminlogin;
      // req. data= '', 
      // req. ip= '', 
      // req.  message: '',
      // req.   status: -1, 
      req.  time=new Date().toString(), 
      req.   token=token ;
      this.send(req);

      this.webSocket.onclose = (ev): void => {
        // this.timerId = setInterval(() => {
        //   this.connect();
        // }, 10000);
        console.log('connection has been closed', ev);

        setTimeout(() => {
          // clearInterval(this.retries);
          // this.retry = null;
          this.connect(url);

        }, 5000);
      };
    };
    this.webSocket.onerror = (ev) => {
      console.log('ERROR', ev);
      // this.retry = setInterval(() => {
        setTimeout(() => {
          // clearInterval(this.retries);
          // this.retry = null;
          this.connect(url);

        }, 5000);

      // }, 5000)
    }
    this.webSocket.onmessage = (ev) => {
      try {
        const res = JSON.parse(ev.data) as IResModel;
      if (res) {

        const data = res.data;
        // console.log('COMMING DATA', res);
        switch (res.command) {
          case 'ping':
            // console.log('Ping');
//{ command: "ping", production: this.production, balance: r,limiter,merchant,mymmachinebalance, mymlimiterbalance, setting ,mstatus,mymstatus,mymsetting,mymlimiter},

            this.aliveSubscription.next({test:data?.test,data,balance:res['balance']} as IAlive)
            break;
          case 'confirm':
            console.log('confirm', data);

            this.billProcessSubscription.next(data)
            break;
          case 'login':
            if (data.data)
            console.log('LOGIN',data);
            
              this.loginSubscription.next(data.data)
            break;
            case 'adminlogin':
              console.log('admin login',data.data);
              this.loginSubscription.next(data.data)
              break;
          case 'refresh':
            this.refreshSubscription.next(data.data);
            break;
          default:
            break;
        }
      }
      } catch (error) {
        console.log('WS MESSAGE',error);
        
      }
      
    }
  }
  send(data: IReqModel | IResModel) {
    const that = this;
    console.log('sending');

    this.waitForSocketConnection(function () {
      console.log('connection is ready to send', data);
      that.webSocket.send(JSON.stringify(data));
    });
  }


  waitForSocketConnection(callback:Function) {
    const socket = this.webSocket;
    const that = this;
    console.log('waiting for sending');

    setTimeout(
      function () {
        console.log('wating count', socket.readyState, new Date().getTime());

        // console.log('ws ready state', socket.readyState);
        if (socket.readyState === 1) {
          console.log("Connection is made")
          if (callback) {
            callback();
            that.retries = 0;
          }
        } else {
          if (that.retries > 2) {
            console.log('create a new connection');

            // that.webSocket.close();
            that.connect(that.wsurl);
            that.retries = 0;
          } else {
            console.log("waiting for the connection...")
            that.waitForSocketConnection(callback);
          }
          that.retries++;
        }
      }, 1000); // wait 5 milisecond for the connection...
  }
}
