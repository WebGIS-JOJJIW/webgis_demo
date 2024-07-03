import { Component } from '@angular/core';
import { SharedService } from '../services/shared.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  
  PageShow = 'livemonitor'

  constructor(private sharedService: SharedService) {
    // console.log(this.PageShow);
    
   }

  ngOnInit() {
    this.sharedService.currentMessage.subscribe(message => this.PageShow = message);
  }


}
