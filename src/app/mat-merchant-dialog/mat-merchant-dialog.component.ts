import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnInit,
  Optional,
} from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';

@Component({
  selector: 'app-mat-merchant-dialog',
  templateUrl: './mat-merchant-dialog.component.html',
  styleUrls: ['./mat-merchant-dialog.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatMerchantDialogComponent implements OnInit {

  merchantKey = '';
  keyName = '';
  apiLoginID = '';
  apiTransactionKey = '';

  constructor(
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<MatMerchantDialogComponent>
  ) {}

  ngOnInit(): void {
    if (this.data) {
      this.merchantKey = this.data.isOwnMerchantKey ? '2' : '1';
      this.keyName  = this.data.keyName;
      this.apiLoginID = this.data.apiLoginID;
      this.apiTransactionKey = this.data.apiTransactionKey;
    };
  }

  radioChange(event: any) {}

  save() {
    const data = {
      merchantKey: this.merchantKey,
      keyName: this.keyName,
      apiLoginID: this.apiLoginID,
      apiTransactionKey: this.apiTransactionKey
    };
    this.dialogRef.close(data);
  }
}
