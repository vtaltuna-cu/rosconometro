import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

//import { MatDialog } from '@angular/material/dialog';
//import { ConfluxErrorComponent } from '../shared/confluxerror/confluxerror.component';

import { WxResponse } from '../models/wxresponse';
//import Swal from 'sweetalert2';
import { WxResponseType } from '../models/enum/wxresponsetype';

@Injectable({
  providedIn: 'root'
})
export class ConfluxErrorService {

  private lastErrorType       : WxResponseType  = WxResponseType.Undefined;
  private lastErrorTitle      : string = "";
  private lastErrorInfo       : string = "";
  private lastErrorAdditional : string = "";

  // --------------------------------------------------------------------------
  // Constructor Class
  // --------------------------------------------------------------------------
  constructor(
    //public dialog: MatDialog
  ) {
    this.Clear();
  }

  public Clear(): void {
    this.lastErrorType       = WxResponseType.Undefined;
    this.lastErrorTitle      = "";
    this.lastErrorInfo       = "";
    this.lastErrorAdditional = "";
  }

  public SetUnAuthorizeError(c: string): void {
    console.error(c, "401 - UnAuthorize. (Invalid Token)");
    this.Clear();
    this.lastErrorType       = WxResponseType.AppError;
    this.lastErrorTitle      = "¡Sesion Expirada!";
    this.lastErrorInfo       = "Informamos a usted, que su actual sesión de usuario en el sistema ha expirado, por favor, vuelva a autenticarse.";
    this.lastErrorAdditional = "";
    this.ShowLastErrorToUser();
  }

  public SetFatalError(c: string, e: HttpErrorResponse): void {
    console.error(c, e);
    this.Clear();
    this.lastErrorType       = WxResponseType.SystemError;
    this.lastErrorTitle      = "¡Error Inesperado!";
    this.lastErrorInfo       = "Estimado usuario, ha ocurrido un error inesperado en el sistema, por favor, vuelva a intentarlo en unos minutos.";
    this.lastErrorAdditional = e.message;
    this.ShowLastErrorToUser();
  }

  public SetSystemError(sTitle: string, sInfo: string, sAdditional: string): void {
    this.Clear();
    this.lastErrorType       = WxResponseType.SystemError;
    this.lastErrorTitle      = sTitle;
    this.lastErrorInfo       = sInfo;
    this.lastErrorAdditional = sAdditional;
    this.ShowLastErrorToUser();
  }

  public SetAppError(sTitle: string, sInfo: string, sAditional: string = ""): void {
    this.Clear();
    this.lastErrorType       = WxResponseType.AppError;
    this.lastErrorTitle      = sTitle;
    this.lastErrorInfo       = sInfo;
    this.lastErrorAdditional = sAditional;
    this.ShowLastErrorToUser();
  }

  ShowLastErrorToUser(): void {

    // Prepare new model with details data erros
    var wxData = new WxResponse();
    wxData.type              = this.lastErrorType;
    wxData.messageTitle      = this.lastErrorTitle;
    wxData.messageInfo       = this.lastErrorInfo;
    wxData.messageAdditional = this.lastErrorAdditional;

    alert(wxData.messageTitle+":"+wxData.messageInfo);

    // Show dialog with error resume
   /* const dialogRef = this.dialog.open(ConfluxErrorComponent, {
      width: '450px', 
      disableClose: true,
      data: wxData
    });

    // Keep listen for changes
    dialogRef.afterClosed().subscribe((result : any)  => {
      console.log('Dialog result = ' + result);
      Swal.fire('Reportado!', 'Muchas gracias por reportarnos estos inconvenientes.', 'success');
    });*/

  }

}