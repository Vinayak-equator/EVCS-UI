import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-content-wrapper',
  templateUrl: './content-wrapper.component.html',
  styleUrls: ['./content-wrapper.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentWrapperComponent {

  constructor() { }
  // This component is used for Layout
}
