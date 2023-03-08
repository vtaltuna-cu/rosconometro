//import { ExportToCsv } from 'export-to-csv';
import { WebRequestModule } from './enum/webrequestmodule';
import { WxRequestType } from './enum/wxrequesttype';
import { WxFilter } from './wxfilter';

export class WxRequest {

  public webUserId: number;
  public apiKey: string ;
  public module: WebRequestModule;
  public request: string;
  public requestType: WxRequestType ;
  public filters: WxFilter[];

  constructor() {
    this.filters = [];
  }

  addStringFilter(key: string, value: string): void {
    const wxf = new WxFilter();
    wxf.key = key;
    wxf.value = value;
    this.filters.push(wxf);
  }

  addNumberFilter(key: string, value: number): void {
    const wxf = new WxFilter();
    wxf.key = key;
    wxf.value = value.toString();
    this.filters.push(wxf);
  }

  addBooleanFilter(key: string, value: boolean): void {
    const wxf = new WxFilter();
    wxf.key = key;
    wxf.value = value.toString();
    this.filters.push(wxf);
  }

  addArrayFilter(key: string, value: any[]): void {
    const wxf = new WxFilter();
    wxf.key = key;
    wxf.value = value.toString();
    this.filters.push(wxf);
  }
}