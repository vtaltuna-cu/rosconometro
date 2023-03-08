import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { catchError, map, retry } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { throwError } from 'rxjs';

import { environment } from '../../environments/environment';

import { ConfluxErrorService } from './conflux-error.service';
import { WxResponse } from '../models/wxresponse';
import { WxRequest } from '../models/wxrequest';
import { WxResponseType } from '../models/enum/wxresponsetype';

@Injectable({
  providedIn: 'root'
})
export class ConfluxApiService {

  private url = environment.url_conflux;

  constructor(
    private route: Router, 
    private http: HttpClient,
    private confluxError: ConfluxErrorService,
  ) {
    // ...
  }

  // --------------------------------------------------------------------------
  // without token
  // --------------------------------------------------------------------------
  check() { }
  
  // --------------------------------------------------------------------------
  // without token
  // --------------------------------------------------------------------------
  login(data: WxRequest): Observable<WxResponse> {
    return this.http.post<WxResponse>(this.url + 'login', data)
    .pipe(

      // Response with 200
      map((res: WxResponse) => {
        // Check for data ok
        if ( res.type != WxResponseType.SystemError && res.type != WxResponseType.AppError && res.type != WxResponseType.Undefined ){
          return res as WxResponse;
        }else{
          if (res.type != WxResponseType.AppError){
            this.confluxError.SetAppError(res.messageTitle, res.messageInfo, res.messageAdditional);
          }else{
            this.confluxError.SetSystemError(res.messageTitle, res.messageInfo, res.messageAdditional);
          }
          return null;
        }
      }),
      
      retry(1),

      // All erros (include 401)
      catchError((e: HttpErrorResponse) => {
        this.confluxError.SetFatalError(this.constructor.name, e);
        return throwError(null);
      })

    );
  }

  // --------------------------------------------------------------------------
  // with token
  // --------------------------------------------------------------------------
  process(r: WxRequest): Observable<WxResponse> {
    return this.http.post<WxResponse>(this.url + 'process', r)
      .pipe(

        // Response with 200
        map((res: WxResponse) => {
          // Check for data ok

          if ( res.type !== WxResponseType.SystemError && res.type !== WxResponseType.AppError && res.type !== WxResponseType.Undefined ){
            return res as WxResponse;
          }else{
            if (res.type !== WxResponseType.AppError){
              this.confluxError.SetAppError(res.messageTitle, res.messageInfo, res.messageAdditional);
            }else{
              this.confluxError.SetSystemError(res.messageTitle, res.messageInfo, res.messageAdditional);
            }
            return null;
          }
        }),

        retry(1),

        // All erros (include 401)
        catchError((e: HttpErrorResponse) => {
          if ( e.status === 401) {
            this.confluxError.SetUnAuthorizeError(this.constructor.name);
          }else{
            this.confluxError.SetFatalError(this.constructor.name, e);
          }
          return throwError(null);
        })

      );
  }

  // --------------------------------------------------------------------------
  // without token
  // --------------------------------------------------------------------------
  external() { }

}
