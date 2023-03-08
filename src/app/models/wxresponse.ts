import { WxResponseType } from "./enum/wxresponsetype";


export class WxResponse {
  type: WxResponseType;
  messageTitle: string ;
  messageInfo: string ="";
  messageAdditional: string ;
  numEntities: number ;
  json: string ;
}