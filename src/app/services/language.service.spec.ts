import { LanguageService } from "./language.service";

// The rules of the language service, independent of the translation and storage libraries
// (both are replaced by simple stand-ins). The browser tests cover the real thing.
describe("LanguageService", () => {
  const KEY = "SELECTED_LANGUAGE";
  let used: string[];
  let defaults: string[];
  let saved: { [key: string]: any };
  let browserCulture: string | undefined;
  let service: LanguageService;
  let originalLang: string;
  let originalDir: string;

  const settle = () => new Promise((resolve) => setTimeout(resolve));

  function createService(storedValue?: string) {
    saved = storedValue ? { [KEY]: storedValue } : {};
    const translate: any = {
      use: (lng: string) => used.push(lng),
      setDefaultLang: (lng: string) => defaults.push(lng),
      getBrowserCultureLang: () => browserCulture,
    };
    const storage: any = {
      get: (key: string) => Promise.resolve(saved[key]),
      set: (key: string, value: any) => {
        saved[key] = value;
        return Promise.resolve();
      },
    };
    service = new LanguageService(translate, storage);
  }

  beforeEach(() => {
    used = [];
    defaults = [];
    browserCulture = undefined;
    originalLang = document.documentElement.lang;
    originalDir = document.documentElement.dir;
    createService();
  });

  afterEach(() => {
    document.documentElement.lang = originalLang;
    document.documentElement.dir = originalDir;
  });

  describe("at start", () => {
    it("uses the saved language first", async () => {
      createService("it");
      browserCulture = "fr-FR";
      service.setInitialAppLangauge();
      await settle();
      expect(used).toEqual(["it"]);
      expect(service.selected).toBe("it");
    });

    it("otherwise follows the browser language, when it is supported", async () => {
      browserCulture = "pt-BR";
      service.setInitialAppLangauge();
      await settle();
      expect(defaults).toEqual(["pt"]);
      expect(used).toEqual(["pt"]);
      expect(saved[KEY]).toBe("pt");
    });

    it("falls back to German for an unsupported or unknown browser language", async () => {
      for (const culture of ["ja-JP", "", undefined, "xx"]) {
        used = [];
        browserCulture = culture;
        service.setInitialAppLangauge();
        await settle();
        expect(used).toEqual(["de"]);
      }
    });

    it("reads the browser language case-insensitively", async () => {
      browserCulture = "EN-gb";
      service.setInitialAppLangauge();
      await settle();
      expect(used).toEqual(["en"]);
    });
  });

  describe("setLanguage", () => {
    it("switches the translations, remembers the choice and sets the page language", () => {
      service.setLanguage("fr");
      expect(used).toEqual(["fr"]);
      expect(service.selected).toBe("fr");
      expect(saved[KEY]).toBe("fr");
      expect(document.documentElement.lang).toBe("fr");
      expect(document.documentElement.dir).toBe("ltr");
    });

    it("lays Arabic out right to left and every other language left to right", () => {
      service.setLanguage("ar");
      expect(document.documentElement.dir).toBe("rtl");
      service.setLanguage("de");
      expect(document.documentElement.dir).toBe("ltr");
    });

    it("accepts locale-style and upper-case values", () => {
      service.setLanguage("PT_br");
      expect(used).toEqual(["pt"]);
      expect(saved[KEY]).toBe("pt");
    });

    it("ignores unsupported and empty values completely", () => {
      for (const value of ["xx", "", null, undefined, "zh-CN"]) {
        service.setLanguage(value as any);
      }
      expect(used).toEqual([]);
      expect(saved).toEqual({});
      expect(service.selected).toBe("");
    });
  });

  describe("applyUserLanguage (language saved on an account)", () => {
    it("switches to the account's language", () => {
      service.applyUserLanguage("de");
      expect(used).toEqual(["de"]);
      expect(service.selected).toBe("de");
    });

    it("understands legacy locale-style values", () => {
      service.applyUserLanguage("de_DE");
      expect(used).toEqual(["de"]);
    });

    it("does nothing when that language is already in use", () => {
      service.setLanguage("it");
      used = [];
      service.applyUserLanguage("it");
      expect(used).toEqual([]);
    });

    it("ignores empty and unsupported values", () => {
      service.applyUserLanguage("");
      service.applyUserLanguage(undefined);
      service.applyUserLanguage("xx");
      expect(used).toEqual([]);
    });
  });

  it("offers the six languages, each with its own name", () => {
    expect(service.getLangauges()).toEqual([
      { value: "de", img: "DE", text: "Deutsch" },
      { value: "en", img: "EN", text: "English" },
      { value: "it", img: "IT", text: "Italiano" },
      { value: "pt", img: "PT", text: "Português" },
      { value: "fr", img: "FR", text: "Français" },
      { value: "ar", img: "AR", text: "العربية" },
    ]);
  });
});
