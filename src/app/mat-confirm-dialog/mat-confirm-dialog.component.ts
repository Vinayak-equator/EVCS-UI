import { Component, OnInit, Inject, Optional, ChangeDetectionStrategy } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { AppConstants } from '@app/constants';

@Component({
  selector: 'app-mat-confirm-dialog',
  templateUrl: './mat-confirm-dialog.component.html',
  styleUrls: ['./mat-confirm-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatConfirmDialogComponent implements OnInit {

  action: string;
  local_data: any;

  get code():any {
    return JSON.stringify(this.data.message, null, 3);
  }

  set code(v) {
    try {
      this.data.message = JSON.parse(v);
    } catch (e) {
      // console.log('error occored while you were typing the JSON');
    }
  }


  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data:DialogData,private router: Router,
    public dialogRef: MatDialogRef<MatConfirmDialogComponent>) 
    { 
      this.local_data = {...data};
      this.action = this.local_data.action;
    }

  ngOnInit() {}

  doAction(){
    this.dialogRef.close({event: this.action, data: this.local_data});  
    
  }

  ok(){
    if(this.local_data.url == '/')
    this.router.navigate(['/']);
    else if(this.local_data.url != '/' && this.local_data.url != '' && 
    (this.local_data.message != AppConstants.SessionExpired))
    this.router.navigate([this.local_data.url]);
    else
    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close({event: 'Cancel'});
  }

}

export interface DialogData {
  name: string;
  id: number;
  description: string;
  labelText1: string;
  lableText2: string;
  title: string;
  buttonText: string;
  message: string;
  type: string;
  dataType: string;
}