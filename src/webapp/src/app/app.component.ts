import { Component } from '@angular/core';
import { SharedService } from '../services/shared.service';
import { AppConst } from '../models/AppConst';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private sharedService: SharedService) {
   }

  ngOnInit() {
    this.sharedService.changePage(AppConst.LivePage);
  }


}
