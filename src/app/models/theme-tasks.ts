import { QuestionType, AnswerType, TaskMode } from './types';

export const themetasks: ReadonlyArray<any> = [
    {
        name: 'Selbst-Lokalisation',
        type: 'theme-loc',
        // category: "themeSelfLocalization",
        category: 'theme',
        question: {
            type: QuestionType.TEXT,
            text: 'QuestionText.whereAreYouNow'
        },
        answer: {
            type: AnswerType.MAP_POINT
        },
        evaluate: 'evalDistanceToPoint',
        settings: {}
    },
    {
        name: 'Objekt-Lokalisation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        question: {
            type: QuestionType.MAP_FEATURE,
            text: 'QuestionText.findTheHouseChoosePhoto',
        },
        answer: {
            type: AnswerType.MULTIPLE_CHOICE
        },
        evaluate: 'evalMultipleChoice',
        settings: {}
    }, {
        name: 'Objekt-Lokalisation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        question: {
            type: QuestionType.MAP_FEATURE,
            text: 'QuestionText.findTheHouseTakePhoto',
        },
        answer: {
            type: AnswerType.PHOTO
        },
        evaluate: 'evalNone',
        settings: {}
    }, {
        name: 'Objekt-Lokalisation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        questionType: 'textPhoto',
        question: {
            type: QuestionType.MAP_FEATURE_PHOTO,
            text: 'QuestionText.lookForTheHouse',
        },
        answer: {
            type: AnswerType.MAP_POINT
        },
        evaluate: 'evalPointInPolygon',
        settings: {}
    }, {
        name: 'Objekt-Lokalisation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        questionType: 'text',
        question: {
            type: QuestionType.TEXT,
            text: 'QuestionText.lookForSThingTap',
            mode: TaskMode.NO_FEATURE
        },
        answerType: 'mapPoint',
        answer: {
            type: AnswerType.MAP_POINT,
            mode: TaskMode.NO_FEATURE
        },
        evaluate: 'evalPointInPolygon',
        settings: {}
    }, {
        name: 'Objekt-Lokalisation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        questionType: 'text',
        question: {
            type: QuestionType.TEXT,
            text: 'QuestionText.lookForSThingChoosePhoto'
        },
        answerType: 'multipleChoice',
        answer: {
            type: AnswerType.MULTIPLE_CHOICE
        },
        evaluate: 'evalMultipleChoice',
        settings: {}
    }, {
        name: 'Objekt-Lokalisation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        questionType: 'text',
        question: {
            type: QuestionType.TEXT,
            text: 'QuestionText.lookForSThingTakePhoto'
        },
        answerType: 'photo',
        answer: {
            type: AnswerType.PHOTO
        },
        evaluate: 'evalNone',
        settings: {}
    },
    {
        name: 'Richtungsbestimmung',
        type: 'theme-direction',
        // category: "themedirection",
        category: 'theme',
        questionType: 'textMapFeature',
        question: {
            type: QuestionType.MAP_DIRECTION_MARKER,
            text: 'QuestionText.turnDirectionChoosePhoto'
        },
        answerType: 'multipleChoice',
        answer: {
            type: AnswerType.MULTIPLE_CHOICE
        },
        evaluate: 'evalMultipleChoice',
        settings: {}
    }, {
        name: 'Richtungsbestimmung',
        type: 'theme-direction',
        // category: "themedirection",
        category: 'theme',
        questionType: 'textMapFeature',
        question: {
            type: QuestionType.MAP_DIRECTION_MARKER,
            text: 'QuestionText.turnDirection'
        },
        answerType: 'direction',
        answer: {
            type: AnswerType.DIRECTION
        },
        evaluate: 'evalDirection',
        settings: {}
    }, {
        name: 'Richtungsbestimmung',
        type: 'theme-direction',
        // category: "themedirection",
        category: 'theme',
        questionType: 'textOrientation',
        question: {
            type: QuestionType.MAP_DIRECTION,
            text: 'QuestionText.turnDirectionArrow'
        },
        answerType: 'direction',
        answer: {
            type: AnswerType.DIRECTION,
            mode: TaskMode.DIRECTION_ARROW,
        },
        evaluate: 'evalDirection',
        settings: {}
    }, {
        name: 'Richtungsbestimmung',
        type: 'theme-direction',
        // category: "themedirection",
        category: 'theme',
        questionType: 'text',
        question: {
            type: QuestionType.TEXT,
            text: 'QuestionText.whereAreYouLooking'
        },
        answer: {
            type: AnswerType.MAP_DIRECTION,
        },
        answerType: 'mapDirection',
        evaluate: 'evalMapDirection',
        settings: {}
    }, {
        name: 'Richtungsbestimmung',
        type: 'theme-direction',
        // category: "themedirection",
        category: 'theme',
        questionType: 'textPhoto',
        question: {
            type: QuestionType.MAP_DIRECTION_PHOTO,
            text: 'QuestionText.turnDirectionPhoto'
        },
        answerType: 'mapDirection',
        answer: {
            type: AnswerType.MAP_DIRECTION,
        },
        evaluate: 'evalMapDirection',
        settings: {}
    }
];