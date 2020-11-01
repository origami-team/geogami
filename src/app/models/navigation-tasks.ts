import { QuestionType, AnswerType, TaskMode } from './types'


export const navtasks: ReadonlyArray<any> = [
    {
        category: "nav",
        type: "nav-flag",
        name: "Navigation zur Zielfahne",
        question: {
            type: QuestionType.TEXT,
            text: "Gehe zur Fahne."
        },
        answer: {
            type: AnswerType.POSITION,
            position: undefined
        },
        evaluate: "distanceToPoint",
        settings: {},
        iBeacon: false,
        beaconInfo: {
            uuid: undefined,
            minor: undefined
        }
    }, {
        category: "nav",
        type: "nav-arrow",
        name: "Navigation mit Richtungspfeil",
        question: {
            type: QuestionType.TEXT,
            text: "Folge dem Pfeil bis zum Ziel."
        },
        answer: {
            type: AnswerType.POSITION,
            mode: TaskMode.NAV_ARROW,
            position: undefined
        },
        evaluate: "distanceToPoint",
        settings: {},
        iBeacon: false,
        beaconInfo: {
            uuid: undefined,
            minor: undefined
        }
    }, {
        category: "nav",
        type: "nav-text",
        name: "Navigation mit Textanweisung",
        question: {
            type: QuestionType.NAV_INSTRUCTION,
            text: ""
        },
        answer: {
            type: AnswerType.POSITION,
            position: undefined
        },
        evaluate: "distanceToPoint",
        settings: {},
        iBeacon: false,
        beaconInfo: {
            uuid: undefined,
            minor: undefined
        }
    },
    {
        category: "nav",
        type: "nav-flag-with-answer",
        name: "Navigation zur Zielfahne mit Antwort",
        // category: "themeobjectLocalization",
        question: {
            type: QuestionType.MAP_FEATURE,
            text: "(Gehe zur Fahne und beantworte die Frage) \nWelche der folgenden Aussagen ist Studentenblumen ?",
        },
        answer: {
            type: AnswerType.MULTIPLE_CHOICE
        },
        evaluate: "evalMultipleChoice",
        settings: {},
        iBeacon: false,
        beaconInfo: {
            uuid: undefined,
            minor: undefined
        }
    },
    {
        category: "nav",
        type: "nav-flag-with-answer",
        name: "Navigation zur Zielfahne mit Antwort",
        question: {
            type: QuestionType.MAP_FEATURE,
            text: "Folge dem Pfeil bis zum Ziel und Mache ein Foto für die Tagetes Pflanze.",
        },
        answer: {
            type: AnswerType.PHOTO
        },
        evaluate: "evalNone",
        settings: {},
        iBeacon: false,
        beaconInfo: {
            uuid: undefined,
            minor: undefined
        }
    },
    {
        category: "nav",
        type: "nav-flag-with-answer",
        name: "Navigation zur Zielfahne mit Antwort",
        question: {
            type: QuestionType.MAP_FEATURE,
            text: "(Gehe zur Fahne und beantworte die Frage) \nStudentenblumen gehören zu welchen Pflanzenfamilien ?",
        },
        answer: {
            type: AnswerType.MULTIPLE_CHOICE_TEXT
        },
        evaluate: "evalNone",
        settings: {},
        iBeacon: false,
        beaconInfo: {
            uuid: undefined,
            minor: undefined
        }
    }
]