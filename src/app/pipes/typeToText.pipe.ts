import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "typeToText" })
export class TypeToTextPipe implements PipeTransform {
  textMappingsObject: object = {
    MAP_FEATURE: "QuestionType.isShownOnMap",
    MAP_FEATURE_PHOTO: "QuestionType.isDisplayedAsPhoto",
    TEXT: "QuestionType.withDiscribedText",
    MULTIPLE_CHOICE: "QuestionType.bySelectingPhoto",
    MAP_POINT: "QuestionType.byMarkingObject",
    PHOTO: "QuestionType.byTakingPhoto",
  };

  textMappingsDirection: object = {
    MAP_DIRECTION_MARKER: "QuestionType.isShownOnMap",
    MAP_DIRECTION_PHOTO: "QuestionType.isDisplayedWithPhoto",
    MAP_DIRECTION: "QuestionType.isIndicatedByArrow",
    TEXT: "QuestionType.correspondToDirection",
    MULTIPLE_CHOICE: "QuestionType.bySelectingPhoto",
    DIRECTION: "QuestionType.byTakingLineOfSight"
  };

  textMappingsFree: object = {
    TEXT: "QuestionType.text",
    PHOTO: "QuestionType.textPhoto",
    MAP_FEATURE_FREE: "QuestionType.textMapMarking",
    MULTIPLE_CHOICE: "QuestionType.bySelectingPhoto",
    MULTIPLE_CHOICE_TEXT: "QuestionType.bySelectingText",
    NUMBER: "QuestionType.byEnteringNumber",
    DRAW: "QuestionType.byMapping",
  };

  transform(value: string, taskType: string, answer: boolean): string {
    if (taskType == "theme-object") {
      return this.textMappingsObject[value];
    }

    if (value == "MAP_DIRECTION" && answer) {
      return "QuestionType.byMarkingDirectionOnMap";
    }

    if (taskType == "free") {
      if (value === "PHOTO" && answer) {
        return "QuestionType.byTakingPhoto";
      }
      if (value === "TEXT" && answer) {
        return "QuestionType.byEnteringText";
      }
      return this.textMappingsFree[value];
    }

    return this.textMappingsDirection[value];
  }
}
