import { Injectable } from '@angular/core';
import { DialogService } from '../services/dialog.service';

@Injectable({
    providedIn: 'root'
})
export class PopUpService {

    data = {
        message: '',
        url: '',
        dataType:'',
        title:'',
        type:''
    };
    constructor(private dialogService: DialogService) { }

showMsg(msg: any, url: string, title = '', type = '', dataType = '') {
    this.data.message = msg;
    this.data.url = url;
    this.data.title = title;
    this.data.dataType = dataType;
    this.data.type = type;
    this.dialogService.openConfirmDialog(this.data)
      .afterClosed().subscribe(res => {
        if (res) {
          console.log(res);
        }
      });
  }
}