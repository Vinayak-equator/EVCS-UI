import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { DialogData } from '@app/mat-confirm-dialog/mat-confirm-dialog.component';

@Component({
  selector: 'app-mat-log-dialog',
  templateUrl: './mat-log-dialog.component.html',
  styleUrls: ['./mat-log-dialog.component.css']
})
export class MatLogDialogComponent implements OnInit {
  isobject = false
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data:DialogData) {
    if(typeof(data.title) == 'object'){
      this.isobject = true
    }
   }

  ngOnInit(): void {
  }

}
