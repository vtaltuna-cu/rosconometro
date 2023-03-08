import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, } from 'rxjs/operators';

import { HttpClient } from '@angular/common/http';
import { WxLoginInfo } from '../models/wxlogininfo';
import { WxResponse } from '../models/wxresponse';
import { environment } from 'src/environments/environment';
import { WxRequest } from '../models/wxrequest';
import { ConfluxApiService } from './conflux-api.service';

@Injectable({
  providedIn: 'root'
})
export class AutenticationService {

  private userloggedIn: boolean = false;
  private loginInfo: WxLoginInfo = new WxLoginInfo;
  private USER_STORE_KEY = 'glass-monitor-data';


  constructor(private route: Router, private http: HttpClient ,private confluxApi: ConfluxApiService) {
    this.loginInfo = new WxLoginInfo;
    this.userloggedIn = false;
    this.updateUserFromLocal();
  }

  updateUserFromLocal() {
    try {

      // Verifica el localStorge
      const getLocalStorage:any  = localStorage.getItem(this.USER_STORE_KEY);

      const getLocalStorageConvert = JSON.parse(getLocalStorage);

      const getLocalStorageEnd: WxLoginInfo = JSON.parse(getLocalStorageConvert);

      this.loginInfo = getLocalStorageEnd;

      if (this.loginInfo) {
        this.userloggedIn = true;
      }

    } catch (e) {
      // login....
      this.userloggedIn = false;
      this.route.navigate(['/login']);
    }

  }


  RefreshUserData(): void {
    try{
      const sData: any = localStorage.getItem(this.USER_STORE_KEY)
      const oData = JSON.parse(sData);
      const jData: WxLoginInfo = JSON.parse(oData);
      this.loginInfo = jData;
    } catch (e) {
      this.loginInfo = new WxLoginInfo;
    }
  }

  // metodo para recuerar el token

  public getUserToken(): string {

    try {
      return this.loginInfo.token;

    } catch (e) {
      return "";
    }
  }



  getUserLogge(): WxLoginInfo {
    return this.loginInfo;
  }

  // funcion para consumir api y consultar usuario
  getLogin(data : any): Observable<WxResponse> {

    // Build Request
    let rq = new WxRequest();
    rq.apiKey = environment.key_conflux;
    rq.addStringFilter('username', data.email);
    rq.addStringFilter('password', data.password);
    
    return this.confluxApi.login(rq).pipe(

      map((res: WxResponse) => {
        return <WxResponse>res;
      }),

      catchError(e => {
        console.error(this.constructor.name, e);
        return throwError(null);
      })

    );

  }

  saveUser(res : any) {
    try {
      localStorage.setItem(this.USER_STORE_KEY, JSON.stringify(res));
      this.updateUserFromLocal();
    } catch (e) {
      console.error(e);
    }
  }

  isUserLogge(): boolean {
    return this.userloggedIn;
  }

  isTokenExpired(): boolean {
    return false;
  }

  // deslogueo de usuario
  logout(): void {

    localStorage.removeItem(this.USER_STORE_KEY);
    this.route.navigateByUrl('/login');
    this.userloggedIn = false;
  }

  // funcion para reuperar el rol
  recoverRol(): any {
    try {
      return this.loginInfo.confluxUser.role;
    } catch (e) {
      return -1;
    }
  }
}
