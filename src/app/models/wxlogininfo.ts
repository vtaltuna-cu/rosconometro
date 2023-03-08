export class WxLoginInfo {

  // General data
  confluxUserId    : number =0;
  confluxUserClass : string = "";
  guid             : string = "";
  username         : string = "";
  token            : string = "";

  // User Data
  confluxUser: {
    clientId: number;
    role: number;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    userName: string;
    phone: number;
    webUserId: string;
    defaultRoute: string;
    defaultLanguage: string;
    defaultTimeZone: string;
    defaultLocale: string;
    id: number;
    code: string;
    createdDate: Date;
    createdUserId: number;
    modifiedDate: Date;
    modifiedUserId: number;
    isChild: boolean;
  } | any

}