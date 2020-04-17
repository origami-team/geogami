import { QuestionType, AnswerType, TaskMode } from './types'

export const themetasks: ReadonlyArray<any> = [
    {
        name: "Selbst-Lokalisation",
        type: "theme-loc",
        // category: "themeSelfLocalization",
        category: "theme",
        question: {
            type: QuestionType.TEXT,
            text: "Wo bist du jetzt? Tippe auf die Karte."
        },
        answer: {
            type: AnswerType.MAP_POINT
        },
        evaluate: "evalDistanceToPoint",
        settings: {}
    },
    {
        name: "Objekt-Lokalisation",
        type: "theme-object",
        // category: "themeobjectLocalization",
        category: "theme",
        question: {
            type: QuestionType.MAP_FEATURE,
            text: "Finde das markierte Haus in deiner Nähe. Wähle das passende Foto.",
        },
        answer: {
            type: AnswerType.MULTIPLE_CHOICE
        },
        evaluate: "evalMultipleChoice",
        settings: {}
    }, {
        name: "Objekt-Lokalisation",
        type: "theme-object",
        // category: "themeobjectLocalization",
        category: "theme",
        question: {
            type: QuestionType.MAP_FEATURE,
            text: "Finde das markierte Haus in deiner Nähe. Mache ein Foto.",
        },
        answer: {
            type: AnswerType.PHOTO
        },
        evaluate: "evalNone",
        settings: {}
    }, {
        name: "Objekt-Lokalisation",
        type: "theme-object",
        // category: "themeobjectLocalization",
        category: "theme",
        questionType: "textPhoto",
        question: {
            type: QuestionType.MAP_FEATURE_PHOTO,
            text: "Suche dieses Haus in deiner Nähe. Finde es auf der Karte und tippe es an.",
        },
        answer: {
            type: AnswerType.MAP_POINT
        },
        evaluate: "evalPointInPolygon",
        settings: {}
    }, {
        name: "Objekt-Lokalisation",
        type: "theme-object",
        // category: "themeobjectLocalization",
        category: "theme",
        questionType: "text",
        question: {
            type: QuestionType.TEXT,
            text: "Suche [...] in deiner Nähe. Finde es auf der Karte und tippe es an.",
            mode: TaskMode.NO_FEATURE
        },
        answerType: "mapPoint",
        answer: {
            type: AnswerType.MAP_POINT,
            mode: TaskMode.NO_FEATURE
        },
        evaluate: "evalPointInPolygon",
        settings: {}
    }, {
        name: "Objekt-Lokalisation",
        type: "theme-object",
        // category: "themeobjectLocalization",
        category: "theme",
        questionType: "text",
        question: {
            type: QuestionType.TEXT,
            text: "Suche [...] in deiner Nähe. Wähle das passende Foto."
        },
        answerType: "multipleChoice",
        answer: {
            type: AnswerType.MULTIPLE_CHOICE
        },
        evaluate: "evalMultipleChoice",
        settings: {}
    }, {
        name: "Objekt-Lokalisation",
        type: "theme-object",
        // category: "themeobjectLocalization",
        category: "theme",
        questionType: "text",
        question: {
            type: QuestionType.TEXT,
            text: "Suche [...] in deiner Nähe. Mache ein Foto."
        },
        answerType: "photo",
        answer: {
            type: AnswerType.PHOTO
        },
        evaluate: "evalNone",
        settings: {}
    },
    {
        name: "Richtungsbestimmung",
        type: "theme-direction",
        // category: "themedirection",
        category: "theme",
        questionType: "textMapFeature",
        question: {
            type: QuestionType.MAP_DIRECTION_MARKER,
            text: "Drehe dich in die Blickrichtung, die du auf der Karte siehst. Wähle das passende Foto."
        },
        answerType: "multipleChoice",
        answer: {
            type: AnswerType.MULTIPLE_CHOICE
        },
        evaluate: "evalMultipleChoice",
        settings: {}
    }, {
        name: "Richtungsbestimmung",
        type: "theme-direction",
        // category: "themedirection",
        category: "theme",
        questionType: "textMapFeature",
        question: {
            type: QuestionType.MAP_DIRECTION_MARKER,
            text: "Drehe dich in die Blickrichtung, die du auf der Karte siehst."
        },
        answerType: "direction",
        answer: {
            type: AnswerType.DIRECTION
        },
        evaluate: "evalDirection",
        settings: {}
    }, {
        name: "Richtungsbestimmung",
        type: "theme-direction",
        // category: "themedirection",
        category: "theme",
        questionType: "textOrientation",
        question: {
            type: QuestionType.MAP_DIRECTION,
            text: "Drehe dich, bis die Pfeile in die gleiche Richtung zeigen."
        },
        answerType: "direction",
        answer: {
            type: AnswerType.DIRECTION,
            mode: TaskMode.DIRECTION_ARROW,
        },
        evaluate: "evalDirection",
        settings: {}
    }, {
        name: "Richtungsbestimmung",
        type: "theme-direction",
        // category: "themedirection",
        category: "theme",
        questionType: "text",
        question: {
            type: QuestionType.TEXT,
            text: "Wohin siehst du jetzt? Markiere deine Blickrichtung auf der Karte."
        },
        answer: {
            type: AnswerType.MAP_DIRECTION,
        },
        answerType: "mapDirection",
        evaluate: "evalMapDirection",
        settings: {}
    }, {
        name: "Richtungsbestimmung",
        type: "theme-direction",
        // category: "themedirection",
        category: "theme",
        questionType: "textPhoto",
        question: {
            type: QuestionType.MAP_DIRECTION_PHOTO,
            text: "Drehe dich in die Richtung vom Foto. Markiere deine Blickrichtung auf der Karte."
        },
        answerType: "mapDirection",
        answer: {
            type: AnswerType.MAP_DIRECTION,
        },
        evaluate: "evalMapDirection",
        settings: {}
    }
]