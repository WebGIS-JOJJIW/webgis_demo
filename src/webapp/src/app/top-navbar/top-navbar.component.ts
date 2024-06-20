import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.css'
})
export class TopNavbarComponent {

  constructor(private sharedService: SharedService){}

  changePage(page:string){
    this.sharedService.changeMessage(page);
    // console.log(page);
    
  }
}
