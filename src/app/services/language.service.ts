import { TranslateService } from '@ngx-translate/core';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

const LNG_KEY = 'SELECTED_LANGUAGE';
const lngs = ['de', 'en'];

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  selected = '';

  constructor(private translate: TranslateService, private storage: Storage) { }

  setInitialAppLangauge() {
    // 1. check if lang have been stored
    // 2. check if device default lang can be fetched and it's one of the supported language
    // 3. use german as a default lang
    this.storage.get(LNG_KEY).then(val => {
      if (val) {
        this.setLanguage(val);
        this.selected = val
      } else {
        let langauge = this.translate.getBrowserCultureLang(); // Get browser lang
        if (lngs.includes((langauge.toLowerCase().slice(0, 2)))) {
          this.translate.setDefaultLang(langauge.toLowerCase().slice(0, 2));
          this.selected = langauge.toLowerCase().slice(0, 2);
        } else {
          this.setLanguage('de') // german is the default lang if browser lang is not supported
        }
      }
      //this.storage.clear()
    });
  }

  getLangauges() {
    return [
      { value: 'de', img: '🇩🇪', text: 'Deutsch' },
      { value: 'en', img: '🇺🇸', text: 'English' },
      //{ value: 'pt', img: '🇵🇹' },
    ];
  }

  setLanguage(lng) {
    this.translate.use(lng);
    this.selected = lng;
    this.storage.set(LNG_KEY, lng)
  }
}
