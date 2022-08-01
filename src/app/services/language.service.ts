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
    // 1. check if lng have aleady been chosen
    // 2. check if device default lang can be fetched and it's one of the supported language
    // 3. use german as a default lang
    this.storage.get(LNG_KEY).then(val => {
      if (val) {
        this.setLanguage(val);
        this.selected = val
      } else {
        let langauge = this.translate.getBrowserCultureLang(); // Get browser lang
        if (lngs.includes(langauge.slice(0, 2))) {
          this.selected = 'de';
        } else {
          this.setLanguage('de') // german is the default lang if browser lang is not supported
        }
      }
    });
  }

  // not used
  getLangauges() {
    return [
      { value: 'de', img: '🇩🇪' },
      { value: 'en', img: '🇺🇸' },
      //{ value: 'pt', img: '🇵🇹' },
    ];
  }

  setLanguage(lng) {
    this.translate.use(lng);
    this.selected = lng;
    this.storage.set(LNG_KEY, lng)
  }
}
