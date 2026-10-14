import contract from "./editor-visibility.contract.json";
import {
  EDITOR_CATALOGUE_DIGEST,
  EDITOR_FEATURES,
  EDITOR_FEATURE_BY_ID,
  EDITOR_FEATURE_GROUPS,
  EDITOR_VISIBILITY_MANAGER_ROLES,
  buildEditorContract,
  editorContractDigest,
  editorFeatureKey,
  editorOptionFeatureId,
} from "./editor-features";
import arJson from "../../assets/i18n/ar.json";
import deJson from "../../assets/i18n/de.json";
import enJson from "../../assets/i18n/en.json";
import frJson from "../../assets/i18n/fr.json";
import itJson from "../../assets/i18n/it.json";
import ptJson from "../../assets/i18n/pt.json";

const LANGUAGES: { [code: string]: any } = {
  de: deJson, en: enJson, pt: ptJson, fr: frJson, ar: arJson, it: itJson,
};

const lookup = (dictionary: any, path: string): unknown =>
  path.split(".").reduce((node, part) => (node == null ? undefined : node[part]), dictionary);

const placeholders = (text: string) => (text.match(/{{\s*\w+\s*}}/g) || []).sort();

function flatten(node: any, prefix = ""): { [path: string]: string } {
  return Object.keys(node).reduce((flat, key) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof node[key] === "object"
      ? Object.assign(flat, flatten(node[key], path))
      : Object.assign(flat, { [path]: node[key] });
  }, {} as { [path: string]: string });
}

describe("editor feature catalogue", () => {
  it("has unique, well-formed ids", () => {
    const ids = EDITOR_FEATURES.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^[a-z][A-Za-z0-9]*(\.[A-Za-z][A-Za-z0-9]*)+$/);
    }
  });

  it("gives every optional entry a default and no essential entry one", () => {
    for (const feature of EDITOR_FEATURES) {
      if (feature.configurable) {
        expect(["both", "advanced"]).toContain(feature.default);
      } else {
        expect(feature.default).toBeUndefined();
      }
    }
  });

  it("puts every entry into a listed group and names the screens it appears on", () => {
    const groups = EDITOR_FEATURE_GROUPS.map((g) => g.id);
    for (const feature of EDITOR_FEATURES) {
      expect(groups).toContain(feature.group);
      expect(feature.screens.length).toBeGreaterThan(0);
      expect(EDITOR_FEATURE_BY_ID[feature.id]).toBe(feature);
    }
  });

  it("turns ids into dot-free translation keys", () => {
    expect(editorFeatureKey("navigation.type.flag")).toBe("navigationTypeFlag");
    expect(editorFeatureKey("free.question.mapMarking")).toBe("freeQuestionMapMarking");
    for (const feature of EDITOR_FEATURES) {
      expect(feature.labelKey).toBe(`EditorFeatures.items.${editorFeatureKey(feature.id)}.label`);
    }
  });

  describe("contract with geogami-server", () => {
    it("matches the shared contract file", () => {
      // The file is identical in both repositories; the server's test compares the two copies.
      expect(buildEditorContract()).toEqual(contract as any);
    });

    it("lists ids in a deterministic (sorted) order", () => {
      const built = buildEditorContract();
      const sorted = (list: string[]) => list.every((id, i) => i === 0 || list[i - 1] < id);
      expect(sorted(built.configurable.map((e) => e.id))).toBe(true);
      expect(sorted(built.locked)).toBe(true);
    });

    it("hashes to the same digest the server computes", () => {
      // Pinned: the server's contract test asserts the same value. After an intentional
      // catalogue change, update it in both repositories together.
      expect(EDITOR_CATALOGUE_DIGEST).toBe("20f2dcdf");
      expect(editorContractDigest(contract as any)).toBe("20f2dcdf");
    });
  });

  describe("option → feature mapping", () => {
    it("classifies only the intended options and only in their own context", () => {
      expect(editorOptionFeatureId("question", "free", "PHOTO")).toBe("free.question.photo");
      expect(editorOptionFeatureId("question", "free", "MAP_FEATURE_FREE")).toBe("free.question.mapMarking");
      expect(editorOptionFeatureId("answer", "free", "DRAW")).toBe("free.answer.drawing");
      expect(editorOptionFeatureId("question", "theme-direction", "MAP_DIRECTION")).toBe("direction.question.arrow");
      expect(editorOptionFeatureId("question", "theme-direction", "MAP_DIRECTION_PHOTO")).toBe("direction.question.photo");
      expect(editorOptionFeatureId("taskType", "nav", "nav-text")).toBe("navigation.type.text");
      expect(editorOptionFeatureId("taskType", "nav", "nav-exploration")).toBe("navigation.type.exploration");
    });

    it("leaves look-alike options in other contexts alone", () => {
      // The same value names exist for questions and answers, and in other task types.
      expect(editorOptionFeatureId("answer", "free", "PHOTO")).toBeUndefined();
      expect(editorOptionFeatureId("question", "theme-object", "PHOTO")).toBeUndefined();
      expect(editorOptionFeatureId("answer", "theme-direction", "MAP_DIRECTION")).toBeUndefined();
      expect(editorOptionFeatureId("answer", "theme-direction", "DIRECTION")).toBeUndefined();
      expect(editorOptionFeatureId("question", "theme-direction", "MAP_DIRECTION_MARKER")).toBeUndefined();
      expect(editorOptionFeatureId("question", "theme-direction", "TEXT")).toBeUndefined();
      expect(editorOptionFeatureId("question", "free", "TEXT")).toBeUndefined();
      expect(editorOptionFeatureId("taskType", "nav", "nav-flag")).toBeUndefined();
      expect(editorOptionFeatureId("taskType", "nav", "nav-arrow")).toBe("navigation.type.arrow");
    });

    it("only points at catalogue entries that exist and can be configured", () => {
      const probes: [any, string, string][] = [
        ["question", "free", "PHOTO"], ["question", "free", "MAP_FEATURE_FREE"],
        ["answer", "free", "DRAW"], ["question", "theme-direction", "MAP_DIRECTION"],
        ["question", "theme-direction", "MAP_DIRECTION_PHOTO"], ["taskType", "nav", "nav-arrow"],
        ["taskType", "nav", "nav-photo"], ["taskType", "nav", "nav-text"],
        ["taskType", "nav", "nav-exploration"], ["taskType", "theme", "2"],
        ["taskType", "theme", "3"], ["taskType", "theme", "4"],
      ];
      for (const [slot, scope, value] of probes) {
        const id = editorOptionFeatureId(slot, scope, value);
        expect(EDITOR_FEATURE_BY_ID[id]).toBeDefined(`${slot}/${scope}/${value}`);
        expect(EDITOR_FEATURE_BY_ID[id].configurable).toBe(true);
      }
    });
  });

  describe("translations", () => {
    const keysOf = () => [
      ...EDITOR_FEATURES.map((f) => f.labelKey),
      ...EDITOR_FEATURES.map((f) => f.descriptionKey),
      ...EDITOR_FEATURE_GROUPS.map((g) => g.labelKey),
    ];

    for (const code of Object.keys(LANGUAGES)) {
      it(`has text for every catalogue entry and group in ${code}`, () => {
        for (const key of keysOf()) {
          const text = lookup(LANGUAGES[code], key);
          expect(typeof text === "string" && (text as string).trim().length > 0).toBe(true, `${code}: ${key}`);
        }
      });
    }

    it("keeps the new sections identical in structure and placeholders across languages", () => {
      const sections = ["EditorMode", "EditorVisibility", "EditorFeatures"];
      for (const section of sections) {
        const reference = flatten(enJson[section]);
        for (const code of Object.keys(LANGUAGES)) {
          const flat = flatten(LANGUAGES[code][section]);
          expect(Object.keys(flat).sort()).toEqual(Object.keys(reference).sort());
          for (const key of Object.keys(reference)) {
            expect(flat[key].trim().length).toBeGreaterThan(0);
            expect(placeholders(flat[key])).toEqual(placeholders(reference[key]), `${code}: ${section}.${key}`);
          }
        }
      }
    });

    it("keeps every language file's key set in step", () => {
      const reference = Object.keys(flatten(enJson)).sort();
      for (const code of Object.keys(LANGUAGES)) {
        expect(Object.keys(flatten(LANGUAGES[code])).sort()).toEqual(reference);
      }
    });
  });
});

describe("who may manage the editor visibility", () => {
  it("is the administrators only, not a contentAdmin", () => {
    expect([...EDITOR_VISIBILITY_MANAGER_ROLES]).toEqual(["admin"]);
  });
});
