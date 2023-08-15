import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { VENDING_ReCreateEPIN, VENDING_CreateMerchant, VENDING_CreateMerchantCoin, VENDING_CreateVendingLimiter, VENDING_CreateVendingLimiterCoin, VENDING_CreateVendingWallet, VENDING_CreateVendingWalletCoin, VENDING_FindEPINShortCodeList, VENDING_FindMerchant, VENDING_FindMerchantCoin, VENDING_FindVendingCoin, VENDING_FindVendingLimiter, VENDING_FindVendingLimiterCoin, VENDING_FindVendingWallet, VENDING_FindVendingWalletCoin, VENDING_Login, VENDING_MerchantCoinTransfer, VENDING_QRHashVerify, VENDING_ShowEPINShortCodeList, VENDING_ShowMerchantCoinBalance, VENDING_ShowMerchantReport, VENDING_ShowVendingLimiterCoinBalance, VENDING_ShowVendingLimiterReport, VENDING_ShowVendingWalletCoinBalance, VENDING_ShowVendingWalletReport, VENDING_TextHashVerify, VENDING_VendingLimiterCoinTransfer, VENDING_VendingWalletCoinTransfer, VENDING_CounterCashout_cash, VENDING_ShowSubadminList, VENDING_FindSubadminList, VENDING_CreateSubadmin, VENDING_DeleteSubadmin, VENDING_AddProvideToSubadmin, VENDING_RemoveProvideToSubadmin } from '../models/vending.model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class VendingAPIService {
  private url: string = environment.baseurl;
  private token: string = localStorage.getItem('lva_token');

  constructor(
    private http: HttpClient
  ) { }

  login(params: VENDING_Login): Observable<any> {
    return this.http.post(this.url + '/laab/admin/login', params);
  }
  textHashVerify(params: VENDING_TextHashVerify): Observable<any> {
    return this.http.post(this.url + '/laab/admin/text_hash_verify', params);
  }
  qrHashVerify(params: VENDING_QRHashVerify): Observable<any> {
    return this.http.post(this.url + '/laab/admin/qr_hash_verify', params);
  }
  findVendingCoin(params: VENDING_FindVendingCoin): Observable<any> {
    return this.http.post(this.url + '/laab/admin/find_vending_coin', params);
  }






  findMerchant(params: VENDING_FindMerchant): Observable<any> {
    return this.http.post(this.url + '/laab/admin/find_merchant', params);
  }
  createMerchant(params: VENDING_CreateMerchant): Observable<any> {
    return this.http.post(this.url + '/laab/admin/create_merchant', params);
  }
  findMerchantCoin(params: VENDING_FindMerchantCoin): Observable<any> {
    return this.http.post(this.url + '/laab/admin/find_merchant_coin', params);
  }
  createMerchantCoin(params: VENDING_CreateMerchantCoin): Observable<any> {
    return this.http.post(this.url + '/laab/admin/create_merchant_coin', params);
  }
  showMerchantCoinBalance(params: VENDING_ShowMerchantCoinBalance): Observable<any> {
    return this.http.post(this.url + '/laab/admin/show_merchant_coin_balance', params);
  }
  merchantCoinTransfer(params: VENDING_MerchantCoinTransfer): Observable<any> {
    return this.http.post(this.url + '/laab/admin/merchant_coin_transfer', params);
  }
  showMerchantReports(params: VENDING_ShowMerchantReport): Observable<any> {
    return this.http.post(this.url + '/laab/admin/show_merchant_report', params);
  }





  findVendingLimiter(params: VENDING_FindVendingLimiter): Observable<any> {
    return this.http.post(this.url + '/laab/admin/find_vending_limiter', params);
  }
  createVendingLimiter(params: VENDING_CreateVendingLimiter): Observable<any> {
    return this.http.post(this.url + '/laab/admin/create_vending_limiter', params);
  }
  findVendingLimiterCoin(params: VENDING_FindVendingLimiterCoin): Observable<any> {
    return this.http.post(this.url + '/laab/admin/find_vending_limiter_coin', params);
  }
  createVendingLimiterCoin(params: VENDING_CreateVendingLimiterCoin): Observable<any> {
    return this.http.post(this.url + '/laab/admin/create_vending_limiter_coin', params);
  }
  showVendingLimiterCoinBalance(params: VENDING_ShowVendingLimiterCoinBalance): Observable<any> {
    return this.http.post(this.url + '/laab/admin/show_vending_limiter_coin_balance', params);
  }
  vendingLimiterCoinTransfer(params: VENDING_VendingLimiterCoinTransfer): Observable<any> {
    return this.http.post(this.url + '/laab/admin/vending_limiter_coin_transfer', params);
  }
  showVendingLimiterReport(params: VENDING_ShowVendingLimiterReport): Observable<any> {
    return this.http.post(this.url + '/laab/admin/show_vending_limiter_report', params);
  }






  findVendingWallet(params: VENDING_FindVendingWallet): Observable<any> {
    return this.http.post(this.url + '/laab/admin/find_vending_wallet', params);
  }
  createVendingWallet(params: VENDING_CreateVendingWallet): Observable<any> {
    return this.http.post(this.url + '/laab/admin/create_vending_wallet', params);
  }
  findVendingWalletCoin(params: VENDING_FindVendingWalletCoin): Observable<any> {
    return this.http.post(this.url + '/laab/admin/find_vending_wallet_coin', params);
  }
  createVendingWalletCoin(params: VENDING_CreateVendingWalletCoin): Observable<any> {
    return this.http.post(this.url + '/laab/admin/create_vending_wallet_coin', params);
  }
  showVendingWalletCoinBalance(params: VENDING_ShowVendingWalletCoinBalance): Observable<any> {
    return this.http.post(this.url + '/laab/admin/show_vending_wallet_coin_balance', params);
  }
  vendingWalletCoinTransfer(params: VENDING_VendingWalletCoinTransfer): Observable<any> {
    return this.http.post(this.url + '/laab/admin/vending_wallet_coin_transfer', params);
  }
  showVendingWalletReport(params: VENDING_ShowVendingWalletReport): Observable<any> {
    return this.http.post(this.url + '/laab/admin/show_vending_wallet_report', params);
  }
  showEPINShortCodeList(params: VENDING_ShowEPINShortCodeList): Observable<any> {
    return this.http.post(this.url + '/laab/admin/show_epinshortcode', params);
  }
  findEPINShortCodeList(params: VENDING_FindEPINShortCodeList): Observable<any> {
    return this.http.post(this.url + '/laab/admin/find_epinshortcode', params);
  }
  recreateEPIN(params: VENDING_ReCreateEPIN): Observable<any> {
    return this.http.post(this.url + '/laab/admin/recreate_epin', params);
  }





  
  counterCashout_cash(params: VENDING_CounterCashout_cash): Observable<any> {
    return this.http.post(this.url + '/laab/admin/counter_cashout_cash_validation', params);
  }
  

  // global
  findEPINShortCodeListForGlobal(params: VENDING_FindEPINShortCodeList): Observable<any> {
    return this.http.post(this.url + '/laab/client/find_epinshortcode', params);
  }

  // sub admin
  findEPINShortCodeListForSubadmin(params: VENDING_FindEPINShortCodeList): Observable<any> {
    return this.http.post(this.url + '/laab/sub_admin/find_epinshortcode', params);
  }
  showSubadminList(params: VENDING_ShowSubadminList): Observable<any> {
    return this.http.post(this.url + '/laab/sub_admin/show_subadmin', params);
  }
  findSubadminList(params: VENDING_FindSubadminList): Observable<any> {
    return this.http.post(this.url + '/laab/sub_admin/find_subadmin', params);
  }
  createSubadmin(params: VENDING_CreateSubadmin): Observable<any> {
    return this.http.post(this.url + '/laab/sub_admin/create_subadmin', params);
  }
  deleteSubadmin(params: VENDING_DeleteSubadmin): Observable<any> {
    return this.http.post(this.url + '/laab/sub_admin/delete_subadmin', params);
  }
  addProvideToSubadmin(params: VENDING_AddProvideToSubadmin): Observable<any> {
    return this.http.post(this.url + '/laab/sub_admin/add_provide_to_subadmin', params);
  }
  removeProvideToSubadmin(params: VENDING_RemoveProvideToSubadmin): Observable<any> {
    return this.http.post(this.url + '/laab/sub_admin/remove_provide_from_subadmin', params);
  }
}
