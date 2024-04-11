import { Component, OnInit } from '@angular/core';
import { LoaderService } from '@app/shared/services/loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class LoaderComponent {

  loading: boolean;

  constructor(private loaderService: LoaderService) {

    this.loaderService.isLoading.subscribe((v) => {
      this.loading = v;
    });

  }
  
}
