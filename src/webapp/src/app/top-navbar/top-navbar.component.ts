import { Component } from '@angular/core';
import { SharedService } from '../../services/shared.service';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AppConst as appConst } from '../../models/AppConst';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.css'
})
export class TopNavbarComponent {
  isDropdownOpen = false;
  appConst = appConst;
  constructor(private sharedService: SharedService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'drone',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/img/drone.svg')
    );
  }

  toggleDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  setCloseAll(str: string) {
    this.sharedService.setCloseAll();
    
    this.sharedService.changePage(str);
    
  }


}
