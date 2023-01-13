import { Component, OnInit } from '@angular/core';
const { BarcodeScanner, SupportedFormat } = Plugins;
import { Plugins } from "@capacitor/core";
import { ModalController, NavController } from '@ionic/angular';
import { UtilService } from 'src/app/services/util.service';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.page.html',
  styleUrls: ['./barcode-scanner.page.scss'],
})
export class BarcodeScannerPage implements OnInit {

  constructor(
    private utilService: UtilService,
    public modalController: ModalController,
    private navCtrl: NavController
  ) { }

  ngOnInit() {
    this.startScan();
  }

  ngAfterViewInit() {
    console.log("ngAfterViewInit");
    BarcodeScanner.prepare();
  }

  ngOnDestroy() {
    this.stopScan();
  }

  // tutorial: https://www.youtube.com/watch?v=8GXfjDUCYjU
  async startScan() {
    const allowed = await this.checkPermission()
    if (allowed) {
      console.log("🚀 allowed")

      /* make background of WebView transparent, another step is adding some style to global.scss */
      BarcodeScanner.hideBackground();
      document.querySelector('body').classList.add('scanner-active');

      /* specified qr-code */
      const result = await BarcodeScanner.startScan({ targetedFormats: ['QR_CODE'] }); // start scanning and wait for a result

      // if the result has content
      if (result.hasContent) {
        console.log(result.content); // log the raw scanned content
        /* show toast msg */
        this.utilService.showToast(`Qr-Code: ${result.content}`, "dark", 3500);

        this.utilService.setQRCodeValue(result.content);

        this.navCtrl.back();
      }
    }
  }

  async stopScan() {
    BarcodeScanner.showBackground();
    document.querySelector('body').classList.remove('scanner-active');

    BarcodeScanner.stopScan();
  };

  async checkPermission() {
    return new Promise(async (resolve, rejects) => {
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        resolve(true);
      } else if (status.denied) {
        // ToDo: update
        BarcodeScanner.openAppSettings();
      } else {
        resolve(false);
      }
    });
  }
}
