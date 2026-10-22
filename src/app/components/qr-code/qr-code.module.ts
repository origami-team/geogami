import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QrCodeComponent } from './qr-code.component';

@NgModule({
  imports: [CommonModule],
  declarations: [QrCodeComponent],
  exports: [QrCodeComponent],
})
export class QrCodeModule {}
