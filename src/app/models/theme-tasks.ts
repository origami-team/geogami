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
            text: "Finde das markierte Haus in deiner Umgebung. Wähle das passende Foto.",
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
            text: "Finde das markierte Haus in deiner Umgebung. Mache ein Foto.",
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
            text: "Suche dieses Haus in deiner Umgebung. Finde es auf der Karte und tippe es an.",
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
            text: "Suche [...] in deiner Umgebung. Finde es auf der Karte und tippe es an.",
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
            text: "Suche [...] in deiner Umgebung. Wähle das passende Foto"
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
            text: "Suche [...] in deiner Umgebung. Mache ein Foto"
        },
        answerType: "photo",
        answer: {
            type: AnswerType.PHOTO
        },
        evaluate: "evalNone",
        settings: {}
    },
    {
        name: "Richtungssuche",
        type: "theme-direction",
        // category: "themedirection",
        category: "theme",
        questionType: "textMapFeature",
        question: {
            type: QuestionType.MAP_DIRECTION_MARKER,
            text: "Drehe dich in die Richtung, die auf der Karte zu sehen ist. Wähle das passende Foto dazu."
        },
        answerType: "multipleChoice",
        answer: {
            type: AnswerType.MULTIPLE_CHOICE
        },
        evaluate: "evalMultipleChoice",
        settings: {}
    }, {
        name: "Richtungssuche",
        type: "theme-direction",
        // category: "themedirection",
        category: "theme",
        questionType: "textMapFeature",
        question: {
            type: QuestionType.MAP_DIRECTION_MARKER,
            text: "Drehe dich in die angezeigte Richtung."
        },
        answerType: "direction",
        answer: {
            type: AnswerType.DIRECTION
        },
        evaluate: "evalDirection",
        settings: {}
    }, {
        name: "Richtungssuche",
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
        name: "Richtungssuche",
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
        name: "Richtungssuche",
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