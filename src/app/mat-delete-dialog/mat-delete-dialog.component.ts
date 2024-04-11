import { ChangeDetectionStrategy, Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogData } from '@app/mat-confirm-dialog/mat-confirm-dialog.component';

@Component({
  selector: 'app-mat-delete-dialog',
  templateUrl: './mat-delete-dialog.component.html',
  styleUrls: ['./mat-delete-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatDeleteDialogComponent implements OnInit {
  isobject = false
  constructor(@Optional() @Inject(MAT_DIALOG_DATA) public data:DialogData) {
    if(typeof(data.title) == 'object'){
      this.isobject = true
    }
   }

  ngOnInit(): void {
  }

}
