import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent {
  @Input() data: any[] = [];
  @Input() columns: string[] = [];
  @Input() columnHeaders: { [key: string]: string } = {};
  
  constructor() { }

  ngOnInit(): void { }
}
