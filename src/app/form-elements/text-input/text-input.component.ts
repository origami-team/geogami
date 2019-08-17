import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-text-input',
  templateUrl: './text-input.component.html',
  styleUrls: ['./text-input.component.scss'],
})
export class TextInputComponent {
  @Input() label: string = ''
  @Input() text: string = ''
  @Input() type: string = 'input'

  constructor() { }
}
