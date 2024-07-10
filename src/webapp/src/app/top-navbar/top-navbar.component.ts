import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.css'
})
export class TopNavbarComponent {

  constructor(private sharedService: SharedService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ){
    this.matIconRegistry.addSvgIcon(
      'drone',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/drone.svg')
    );
  }

  changePage(page:string){
    this.sharedService.changeMessage(page);
    // console.log(page);
    
  }

  setCloseAll(){
    this.sharedService.setCloseAll();
  }

  
}
