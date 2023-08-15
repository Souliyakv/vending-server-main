
import axios from "axios";


import { EMessage, IReqModel, IResModel } from '../entities/syste.model';

import * as WebSocketServer from 'ws';
import moment from "moment";
import fs from 'fs';

const _default_format = 'YYYY-MM-DD HH:mm:ss';


export enum RedisKeys {
    storenamebyprofileuuid = 'store_name_by_profileuuid_',
}

export function PrintSucceeded(command: string, data: any, message: string, transactionID: number = -1, code: string = '0'): IResModel {
    return {
        command, data, message, code, status: 1, transactionID
    } as IResModel;
}
export function PrintError(command: string, data: any, message: string, transactionID: number = -1, code: string = '0'): IResModel {
    return {
        command, data: data, message, code, status: 0, transactionID
    } as IResModel;
}
export function broadCast(wss: WebSocketServer.WebSocketServer, comm: string, r: any, delay: boolean = false) {
    const d = {} as IResModel;
    d.data = r;
    console.log('send ws to client ', d);
    wsSendToClient(wss, EMessage.all, comm, d, delay);
}

export function wsSendToClient(wss: WebSocketServer.Server, comm: string, uuid: string, d: any, delay: boolean = false) {
    setTimeout(() => {
        wss.clients.forEach(ws => {
            if (ws) {
                if (ws.readyState === 1) {
                    if (ws['ownerUuid'] + '' == uuid || uuid == EMessage.all) {
                        //d.data = x;
                        console.log('sending to ', uuid);

                        ws.send(JSON.stringify(PrintSucceeded(comm, d, EMessage.succeeded)));
                        return;
                    }
                }
                else {
                    console.log('client ', ws['ownerUuid'], ws.readyState);

                }
            }

        });
    }, delay ? 1000 : 0);

}
export function int2hex(i: number) {
    const str = Number(i).toString(16);
    return str.length === 1 ? '0' + str : str;
}
export function initWs(wss: WebSocketServer.Server) {
    // setWsHeartbeat(wss, (ws, data, binary) => {
    //     if (data === '{"kind":"ping"}') { // send pong if recieved a ping.
    //         ws.send(JSON.stringify(PrintSucceeded('pong', { kind: 'ping' }, EMessage.succeeded)));

    //     }
    // }, 30000);

    wss.on('connection', (ws: WebSocket) => {
        console.log('new connection ', ws.url);

        console.log('current connection is alive', ws['isAlive']);



        ws.onopen = (ev: Event) => {
            console.log('open', ev);
            // ws['isAlive'] = true;
        }
        ws.onclose = (ev: CloseEvent) => {

        }
        ws.onerror = (ev: Event) => {
            console.log('error', ev);
        }

        //connection is up, let's add a simple simple event
        ws.onmessage = async (ev: MessageEvent) => {
            let d: IReqModel = {} as IReqModel;
            // ws['isAlive'] = true;
            try {
                console.log('comming', ev.data);

                d = JSON.parse(ev.data) as IReqModel;
                ws.send(JSON.stringify(PrintSucceeded('', d, EMessage.succeeded)));

            } catch (error) {
                console.log('message', error);
                ws.send(JSON.stringify(PrintSucceeded('', d, EMessage.succeeded)));

            }
        }
    });
}

export function xORChecksum(array = new Array<any>()) {
    return array.reduce((checksum, item) =>
        checksum ^ parseInt(item, 16)
        , 0)
}
export function chk8xor(byteArray = new Array<any>()) {
    let checksum = 0x00
    for (let i = 0; i < byteArray.length - 1; i++)
        checksum ^= parseInt(byteArray[i].replace(/^#/, ''), 16)
    const x = checksum.toString(16);
    if (x.length == 1) return '0' + x;
    return x;
}

//    short crc = 0;
//         for(int i=offset; i < offset+ len; i++)
//         {
//             crc ^=data[i];
//         }
//         return (short) (crc & 0xff);
function toHex(str: string) {
    var result = '';
    for (var i = 0; i < str.length; i++) {
        result += str.charCodeAt(i).toString(16);
    }
    return result;
}
function fromHex(hex: string) {
    let str = '';
    try {
        str = decodeURIComponent(hex.replace(/(..)/g, '%$1'))
    }
    catch (e) {
        str = hex
        console.log('invalid hex input: ' + hex)
    }
    return str
}

export function writeSucceededRecordLog(m, position) {
    const da = moment().year() + '_' + moment().month() + '_' + moment().date();
    const logs = process.env._log_path || process.cwd() + `/results_${da}.json`;
    if (!fs.existsSync(logs)) {
        fs.writeFileSync(logs, JSON.stringify({ m, position, time: new Date() }),{encoding:'utf-8'});
    } else {
        fs.appendFileSync(logs, '\n'+JSON.stringify({ m, position, time: new Date() }), { flag: 'a+',encoding:'utf-8' });
    }
}
export function writeLogs(m, position, name = 'g_') {
    const da = moment().year() + '_' + moment().month() + '_' + moment().date();
    const logs = process.env._log_path || process.cwd() + `/${name}_${da}.json`;
    console.log('m', m);
    if (!fs.existsSync(logs)) {
        fs.writeFileSync(logs, JSON.stringify({ m, position, time: new Date() }),{encoding:'utf-8'});
    } else {
        fs.appendFileSync(logs, '\n'+JSON.stringify({ m, position, time: new Date() }), { flag: 'a+' ,encoding:'utf-8'});
    }
}
export function writeCreditRecord(m, name = 'credit_') {
    // const da = moment().year() + '_' + moment().month() + '_' + moment().date();
    const logs = process.env._log_path || process.cwd() + `/${name}_.json`;
    console.log('writeCreditRecord', m);
        fs.writeFileSync(logs, JSON.stringify(m),{encoding:'utf-8'});
    

}
export function readCreditRecord(name = 'credit_') {
    // const da = moment().year() + '_' + moment().month() + '_' + moment().date();
    const logs = process.env._log_path || process.cwd() + `/${name}_.json`;
    const text = fs.readFileSync(logs,{encoding:'utf-8'});
    return text;
}

export function clearLogsDays(name = 'g_', duration = 15) {
    try {
        const hist = moment().subtract(duration, 'days');
        const da = hist.year() + '_' + hist.month() + '_' + hist.date();
        const logs = process.env._log_path || process.cwd() + `/${name}_${da}.json`;
        const elogs = process.env._log_path || process.cwd() + `/e_${da}.json`;
        const rlogs = process.env._log_path || process.cwd() + `/results_${da}.json`;
        !fs.existsSync(logs) ||
            fs.unlinkSync(logs);
        !fs.existsSync(elogs) ||
            fs.unlinkSync(elogs);
        !fs.existsSync(rlogs) ||
            fs.unlinkSync(rlogs);
    } catch (error) {
        console.log(error);

    }
}

export function loadLogsDays(name = 'g_', duration = 15) {
    try {
        const hist = moment().subtract(duration, 'days');
        const da = hist.year() + '_' + hist.month() + '_' + hist.date();
        const logs = process.env._log_path || process.cwd() + `/${name}_${da}.json`;
        const elogs = process.env._log_path || process.cwd() + `/e_${da}.json`;
        const rlogs = process.env._log_path || process.cwd() + `/results_${da}.json`;

        let content = '';
        if (!fs.existsSync(logs))
            content += fs.readFileSync(logs, { encoding:'utf-8', flag: 'r' })

        if (!fs.existsSync(elogs))
            content += fs.readFileSync(elogs, { encoding: 'utf-8', flag: 'r' })

        if (!fs.existsSync(rlogs))
            content += fs.readFileSync(rlogs, { encoding: 'utf-8', flag: 'r' });
        return content;
    } catch (error) {
        console.log(error);

    }
}
export interface IMachineStatus { billStatus: string, coinStatus: string, cardStatus: string, tempconrollerStatus: string, temp: string, doorStatus: string, billChangeValue: string, coinChangeValue: string, machineIMEI: string, allMachineTemp: string }

export function machineStatus(b: string): IMachineStatus {
    // fafb52215400010000130000000000000000003030303030303030303013aaaaaaaaaaaaaa8d
    // fafb52
    // 21 //len
    // 54 // series
    const billStatus = b.substring(10, 12);
    // 00 // bill acceptor
    const coinStatus = b.substring(12, 14);
    // 01 // coin acceptor
    const cardStatus = b.substring(14, 16);
    // 00 // card reader status
    const tempconrollerStatus = b.substring(16, 18);
    // 00 // tem controller status
    const temp = b.substring(18, 20);
    // 13 // temp
    const doorStatus = b.substring(20, 22);
    // 00 // door 
    const billChangeValue = b.substring(22, 30);
    // 00000000 // bill change
    const coinChangeValue = b.substring(30, 38);
    // 00000000 // coin change
    const machineIMEI = b.substring(38, 58);
    // 30303030303030303030
    const allMachineTemp = b.substring(58, 74);
    // 13aaaaaaaaaaaaaa8d
    // // fafb header
    // // 52 command
    // // 01 length
    // // Communication number+ 
    // '00'//Bill acceptor status+ 
    // '00'//Coin acceptor status+ 
    // '00'// Card reader status+
    // '00'// Temperature controller status+ 
    // '00'// Temperature+ 
    // '00'// Door status+ 
    // '00 00 00 00'// Bill change(4 byte)+ 
    // '00 00 00 00'// Coin change(4 byte)+ 
    // '00 00 00 00 00 00 00 00 00 00'//Machine ID number (10 byte) + 
    // '00 00 00 00 00 00 00 00'// Machine temperature (8 byte, starts from the master machine. 0xaa Temperature has not been read yet) +
    // '00 00 00 00 00 00 00 00'//  Machine humidity (8 byte, start from master machine)
    return { billStatus, coinStatus, cardStatus, tempconrollerStatus, temp, doorStatus, billChangeValue, coinChangeValue, machineIMEI, allMachineTemp }
}

export function writeErrorLogs(m: string, e: any) {
    const da = moment().year() + '_' + moment().month() + '_' + moment().date();
    const logs = process.env._log_path || process.cwd() + `/e_${da}.json`;
    console.log('error', m);
    if (!fs.existsSync(logs)) {
        fs.writeFileSync(logs, JSON.stringify({ m, e, time: new Date() }));
    } else {
        fs.appendFileSync(logs, '\n'+JSON.stringify({ m, e, time: new Date() }), { flag: 'a+' });
    }
}
