
import { QuestionType, AnswerType, TaskMode } from './types';

export const themetasksMultiplayers3: ReadonlyArray<any> = [
    {
        name: 'Tasktypes.selfLocation',
        type: 'theme-loc',
        // category: "themeSelfLocalization",
        category: 'theme',
        question: [
            {
                type: QuestionType.TEXT,
                text: 'Wo bist du jetzt? Tippe auf die Karte.'
            },
            {
                type: QuestionType.TEXT,
                text: 'Wo bist du jetzt? Tippe auf die Karte.'
            },
            {
                type: QuestionType.TEXT,
                text: 'Wo bist du jetzt? Tippe auf die Karte.'
            }
        ],
        answer: [
            {
                type: AnswerType.MAP_POINT
            },
            {
                type: AnswerType.MAP_POINT
            },
            {
                type: AnswerType.MAP_POINT
            }
        ],
        evaluate: 'evalDistanceToPoint',
        settings: {}
    },
    {
        name: 'Tasktypes.objectLocation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        question: [
            {
                type: QuestionType.MAP_FEATURE,
                text: 'Finde das markierte Haus in deiner Nähe. Wähle das passende Foto.',
            },
            {
                type: QuestionType.MAP_FEATURE,
                text: 'Finde das markierte Haus in deiner Nähe. Wähle das passende Foto.',
            },
            {
                type: QuestionType.MAP_FEATURE,
                text: 'Finde das markierte Haus in deiner Nähe. Wähle das passende Foto.',
            }
        ],
        answer: [
            {
                type: AnswerType.MULTIPLE_CHOICE
            },
            {
                type: AnswerType.MULTIPLE_CHOICE
            },
            {
                type: AnswerType.MULTIPLE_CHOICE
            }
        ],
        evaluate: 'evalMultipleChoice',
        settings: {}
    }, {
        name: 'Tasktypes.objectLocation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        question: [
            {
                type: QuestionType.MAP_FEATURE,
                text: 'Finde das markierte Haus in deiner Nähe. Mache ein Foto.',
            },
            {
                type: QuestionType.MAP_FEATURE,
                text: 'Finde das markierte Haus in deiner Nähe. Mache ein Foto.',
            },
            {
                type: QuestionType.MAP_FEATURE,
                text: 'Finde das markierte Haus in deiner Nähe. Mache ein Foto.',
            }
        ],
        answer: [
            {
                type: AnswerType.PHOTO
            },
            {
                type: AnswerType.PHOTO
            },
            {
                type: AnswerType.PHOTO
            }
        ],
        evaluate: 'evalNone',
        settings: {}
    }, {
        name: 'Tasktypes.objectLocation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        questionType: 'textPhoto',
        question: [
            {
                type: QuestionType.MAP_FEATURE_PHOTO,
                text: 'Suche dieses Haus in deiner Nähe. Finde es auf der Karte und tippe es an.',
            },
            {
                type: QuestionType.MAP_FEATURE_PHOTO,
                text: 'Suche dieses Haus in deiner Nähe. Finde es auf der Karte und tippe es an.',
            },
            {
                type: QuestionType.MAP_FEATURE_PHOTO,
                text: 'Suche dieses Haus in deiner Nähe. Finde es auf der Karte und tippe es an.',
            }
        ],
        answer: [
            {
                type: AnswerType.MAP_POINT
            },
            {
                type: AnswerType.MAP_POINT
            },
            {
                type: AnswerType.MAP_POINT
            }
        ],
        evaluate: 'evalPointInPolygon',
        settings: {}
    }, {
        name: 'Tasktypes.objectLocation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        questionType: 'text',
        question: [
            {
                type: QuestionType.TEXT,
                text: 'Suche [...] in deiner Nähe. Finde es auf der Karte und tippe es an.',
                mode: TaskMode.NO_FEATURE
            },
            {
                type: QuestionType.TEXT,
                text: 'Suche [...] in deiner Nähe. Finde es auf der Karte und tippe es an.',
                mode: TaskMode.NO_FEATURE
            },
            {
                type: QuestionType.TEXT,
                text: 'Suche [...] in deiner Nähe. Finde es auf der Karte und tippe es an.',
                mode: TaskMode.NO_FEATURE
            }
        ],
        answerType: 'mapPoint',
        answer: [
            {
                type: AnswerType.MAP_POINT,
                mode: TaskMode.NO_FEATURE
            },
            {
                type: AnswerType.MAP_POINT,
                mode: TaskMode.NO_FEATURE
            },
            {
                type: AnswerType.MAP_POINT,
                mode: TaskMode.NO_FEATURE
            }
        ],
        evaluate: 'evalPointInPolygon',
        settings: {}
    }, {
        name: 'Tasktypes.objectLocation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        questionType: 'text',
        question: [
            {
                type: QuestionType.TEXT,
                text: 'Suche [...] in deiner Nähe. Wähle das passende Foto.'
            },
            {
                type: QuestionType.TEXT,
                text: 'Suche [...] in deiner Nähe. Wähle das passende Foto.'
            },
            {
                type: QuestionType.TEXT,
                text: 'Suche [...] in deiner Nähe. Wähle das passende Foto.'
            }
        ],
        answerType: 'multipleChoice',
        answer: [
            {
                type: AnswerType.MULTIPLE_CHOICE
            },
            {
                type: AnswerType.MULTIPLE_CHOICE
            },
            {
                type: AnswerType.MULTIPLE_CHOICE
            }
        ],
        evaluate: 'evalMultipleChoice',
        settings: {}
    }, {
        name: 'Tasktypes.objectLocation',
        type: 'theme-object',
        // category: "themeobjectLocalization",
        category: 'theme',
        questionType: 'text',
        question: [
            {
                type: QuestionType.TEXT,
                text: 'Suche [...] in deiner Nähe. Mache ein Foto.'
            },
            {
                type: QuestionType.TEXT,
                text: 'Suche [...] in deiner Nähe. Mache ein Foto.'
            },
            {
                type: QuestionType.TEXT,
                text: 'Suche [...] in deiner Nähe. Mache ein Foto.'
            }
        ],
        answerType: 'photo',
        answer: [
            {
                type: AnswerType.PHOTO
            }, {
                type: AnswerType.PHOTO
            },
            {
                type: AnswerType.PHOTO
            }
        ],
        evaluate: 'evalNone',
        settings: {}
    },
    {
        name: 'Tasktypes.directionDetermination',
        type: 'theme-direction',
        // category: "themedirection",
        category: 'theme',
        questionType: 'textMapFeature',
        question: [
            {
                type: QuestionType.MAP_DIRECTION_MARKER,
                text: 'Drehe dich in die Blickrichtung, die du auf der Karte siehst. Wähle das passende Foto.'
            },
            {
                type: QuestionType.MAP_DIRECTION_MARKER,
                text: 'Drehe dich in die Blickrichtung, die du auf der Karte siehst. Wähle das passende Foto.'
            },
            {
                type: QuestionType.MAP_DIRECTION_MARKER,
                text: 'Drehe dich in die Blickrichtung, die du auf der Karte siehst. Wähle das passende Foto.'
            }
        ],
        answerType: 'multipleChoice',
        answer: [
            {
                type: AnswerType.MULTIPLE_CHOICE
            },
            {
                type: AnswerType.MULTIPLE_CHOICE
            },
            {
                type: AnswerType.MULTIPLE_CHOICE
            }
        ],
        evaluate: 'evalMultipleChoice',
        settings: {}
    }, {
        name: 'Tasktypes.directionDetermination',
        type: 'theme-direction',
        // category: "themedirection",
        category: 'theme',
        questionType: 'textMapFeature',
        question: [
            {
                type: QuestionType.MAP_DIRECTION_MARKER,
                text: 'Drehe dich in die Blickrichtung, die du auf der Karte siehst.'
            },
            {
                type: QuestionType.MAP_DIRECTION_MARKER,
                text: 'Drehe dich in die Blickrichtung, die du auf der Karte siehst.'
            },
            {
                type: QuestionType.MAP_DIRECTION_MARKER,
                text: 'Drehe dich in die Blickrichtung, die du auf der Karte siehst.'
            }
        ],
        answerType: 'direction',
        answer: [
            {
                type: AnswerType.DIRECTION
            },
            {
                type: AnswerType.DIRECTION
            },
            {
                type: AnswerType.DIRECTION
            }
        ],
        evaluate: 'evalDirection',
        settings: {}
    }, {
        name: 'Tasktypes.directionDetermination',
        type: 'theme-direction',
        // category: "themedirection",
        category: 'theme',
        questionType: 'textOrientation',
        question: [
            {
                type: QuestionType.MAP_DIRECTION,
                text: 'Drehe dich, bis die Pfeile in die gleiche Richtung zeigen.'
            },
            {
                type: QuestionType.MAP_DIRECTION,
                text: 'Drehe dich, bis die Pfeile in die gleiche Richtung zeigen.'
            },
            {
                type: QuestionType.MAP_DIRECTION,
                text: 'Drehe dich, bis die Pfeile in die gleiche Richtung zeigen.'
            }
        ],
        answerType: 'direction',
        answer: [
            {
                type: AnswerType.DIRECTION,
                mode: TaskMode.DIRECTION_ARROW,
            },
            {
                type: AnswerType.DIRECTION,
                mode: TaskMode.DIRECTION_ARROW,
            },
            {
                type: AnswerType.DIRECTION,
                mode: TaskMode.DIRECTION_ARROW,
            }
        ],
        evaluate: 'evalDirection',
        settings: {}
    }, {
        name: 'Tasktypes.directionDetermination',
        type: 'theme-direction',
        // category: "themedirection",
        category: 'theme',
        questionType: 'text',
        question: [
            {
                type: QuestionType.TEXT,
                text: 'Wohin siehst du jetzt? Markiere deine Blickrichtung auf der Karte.'
            },
            {
                type: QuestionType.TEXT,
                text: 'Wohin siehst du jetzt? Markiere deine Blickrichtung auf der Karte.'
            },
            {
                type: QuestionType.TEXT,
                text: 'Wohin siehst du jetzt? Markiere deine Blickrichtung auf der Karte.'
            }
        ],
        answer: [
            {
                type: AnswerType.MAP_DIRECTION,
            },
            {
                type: AnswerType.MAP_DIRECTION,
            },
            {
                type: AnswerType.MAP_DIRECTION,
            }
        ],
        answerType: 'mapDirection',
        evaluate: 'evalMapDirection',
        settings: {}
    }, {
        name: 'Tasktypes.directionDetermination',
        type: 'theme-direction',
        // category: "themedirection",
        category: 'theme',
        questionType: 'textPhoto',
        question: [
            {
                type: QuestionType.MAP_DIRECTION_PHOTO,
                text: 'Drehe dich in die Richtung vom Foto. Markiere deine Blickrichtung auf der Karte.'
            },
            {
                type: QuestionType.MAP_DIRECTION_PHOTO,
                text: 'Drehe dich in die Richtung vom Foto. Markiere deine Blickrichtung auf der Karte.'
            },
            {
                type: QuestionType.MAP_DIRECTION_PHOTO,
                text: 'Drehe dich in die Richtung vom Foto. Markiere deine Blickrichtung auf der Karte.'
            }
        ],
        answerType: 'mapDirection',
        answer: [
            {
                type: AnswerType.MAP_DIRECTION,
            },
            {
                type: AnswerType.MAP_DIRECTION,
            },
            {
                type: AnswerType.MAP_DIRECTION,
            }
        ],
        evaluate: 'evalMapDirection',
        settings: {}
    }
];