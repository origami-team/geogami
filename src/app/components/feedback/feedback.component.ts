import { Map as MapboxMap } from "mapbox-gl";
import { OrigamiGeolocationService } from '../../services/origami-geolocation.service';
import { Subscription } from 'rxjs';
import { Task } from '../../models/task';
import { AnswerType, QuestionType } from '../../models/types';
import { HelperService } from '../../services/helper.service';
import { PlayingGamePage } from '../../pages/play-game/playing-game/playing-game.page';
import { ToastController } from '@ionic/angular';
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { TrackerService } from '../../services/tracker.service';
import { Component } from '@angular/core';
import { Plugins, Capacitor, GeolocationPosition } from '@capacitor/core';


enum FeedbackType {
    Correct,
    Wrong,
    TryAgain,
    Saved,
    Success
}

@Component({
    selector: "app-feedback",
    templateUrl: "./feedback.component.html",
    styleUrls: ["./feedback.component.scss"],
    inputs: []
})
export class FeedbackComponent {
    private positionSubscription: Subscription;
    private task: Task;
    private lastKnownPosition: GeolocationPosition
    private Math: Math = Math;
    private audioPlayer: HTMLAudioElement = new Audio();

    showFeedback: boolean = false;
    private feedback: any = {
        text: '',
        icon: ''
    }
    private feedbackRetry: boolean = false;

    private map: any;
    private geolocationService: OrigamiGeolocationService
    private helperService: HelperService
    private toastController: ToastController
    private trackerService: TrackerService
    private playingGamePage: PlayingGamePage

    constructor() { }

    init(map: any, geolocationService: OrigamiGeolocationService, helperService: HelperService, toastController: ToastController, trackerService: TrackerService, playingGamePage: PlayingGamePage) {
        this.map = map
        this.geolocationService = geolocationService
        this.helperService = helperService
        this.toastController = toastController
        this.trackerService = trackerService
        this.playingGamePage = playingGamePage


        this.audioPlayer.src = 'assets/sounds/zapsplat_multimedia_alert_musical_warm_arp_005_46194.mp3'

        this.positionSubscription = this.geolocationService.geolocationSubscription.subscribe((position: GeolocationPosition) => {
            this.lastKnownPosition = position;

            if (this.task && !PlayingGamePage.showSuccess) {
                if (this.task.answer.type == AnswerType.POSITION) {

                    const waypoint = this.task.answer.position.geometry.coordinates;

                    if (this.userDidArrive(waypoint) && !this.task.settings.confirmation && !this.showFeedback) {
                        this.onWaypointReached();
                    }
                }
            }
        });
    }

    public setTask(task: Task) {
        this.task = task
    }

    public async setAnswer({
        selectedPhoto,
        isCorrectPhotoSelected,
        selectedChoice,
        isCorrectChoiceSelected,
        photo,
        photoURL,
        directionBearing,
        compassHeading,
        clickDirection,
        numberInput,
        textInput
    }) {
        let isCorrect: boolean = true;
        let answer: any = {}

        if (this.task.answer.type == AnswerType.POSITION) {
            const waypoint = this.task.answer.position.geometry.coordinates;
            const arrived = this.userDidArrive(waypoint);
            answer = {
                target: waypoint,
                position: this.lastKnownPosition,
                distance: this.helperService.getDistanceFromLatLonInM(waypoint[1], waypoint[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude),
                correct: arrived
            }
            isCorrect = arrived
            if (!arrived) {
                this.initFeedback(false)
            } else {
                this.onWaypointReached();
            }
        }

        if (this.task.type == "theme-loc") {
            if (this.map.getSource('marker-point')) {
                const clickPosition = this.map.getSource('marker-point')._data.geometry.coordinates;
                const distance = this.helperService.getDistanceFromLatLonInM(clickPosition[1], clickPosition[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude)
                isCorrect = distance < PlayingGamePage.triggerTreshold;
                answer = {
                    clickPosition: clickPosition,
                    distance: distance,
                    correct: isCorrect
                }

                this.initFeedback(distance < PlayingGamePage.triggerTreshold)
            } else {
                const toast = await this.toastController.create({
                    message: "Bitte setze zuerst deine Position",
                    color: "dark",
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();

                isCorrect = false;
                answer = {
                    clickPosition: undefined,
                    distance: undefined,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE) {
            if (selectedPhoto != null) {
                this.initFeedback(isCorrectPhotoSelected);
                isCorrect = isCorrectPhotoSelected
                answer = {
                    selectedPhoto: selectedPhoto,
                    correct: isCorrect
                }
                if (isCorrectPhotoSelected) {
                    isCorrectPhotoSelected = null;
                    selectedPhoto = null;
                }
            } else {
                const toast = await this.toastController.create({
                    message: "Bitte wähle zuerst ein Foto",
                    color: "dark",
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    selectedPhoto: null,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE_TEXT) {
            if (selectedChoice != null) {
                this.initFeedback(isCorrectChoiceSelected);
                isCorrect = isCorrectChoiceSelected
                answer = {
                    selectedChoice: selectedChoice,
                    correct: isCorrect
                }
                if (isCorrectChoiceSelected) {
                    isCorrectChoiceSelected = null;
                    selectedChoice = null;
                }
            } else {
                const toast = await this.toastController.create({
                    message: "Bitte wähle zuerst eine Antwort",
                    color: "dark",
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    selectedChoice: null,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.PHOTO) {
            if (photo == "") {
                const toast = await this.toastController.create({
                    message: "Bitte mache ein Foto",
                    color: "dark",
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();

                isCorrect = false;
                answer = {
                    photo: null,
                    correct: isCorrect
                }
            } else {
                this.initFeedback(true);
                isCorrect = true;
                answer = {
                    photo: photo,
                    correct: isCorrect
                }
                photo = "";
                photoURL = "";
            }
        }

        if (this.task.answer.type == AnswerType.MAP_POINT && this.task.type != "theme-loc") {
            if (this.map.getSource('marker-point')) {
                const clickPosition = this.map.getSource('marker-point')._data.geometry.coordinates;
                const isInPolygon = booleanPointInPolygon(clickPosition, this.task.question.geometry.features[0])
                this.initFeedback(isInPolygon);
                isCorrect = isInPolygon;
                answer = {
                    clickPosition: clickPosition,
                    correct: isCorrect
                }
            } else {
                const toast = await this.toastController.create({
                    message: "Bitte setze zuerst einen Punkt auf der Karte",
                    color: "dark",
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    clickPosition: undefined,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.DIRECTION) {
            this.initFeedback(this.Math.abs(directionBearing - compassHeading) <= 45);
            isCorrect = this.Math.abs(directionBearing - compassHeading) <= 45;
            answer = {
                compassHeading: compassHeading,
                correct: isCorrect
            }
        }

        if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
            if (clickDirection != 0) {
                if (this.task.question.type == QuestionType.MAP_DIRECTION_PHOTO) {
                    this.initFeedback(this.Math.abs(clickDirection - this.task.question.direction.bearing) <= 45);
                    isCorrect = this.Math.abs(clickDirection - this.task.question.direction.bearing) <= 45;
                } else {
                    this.initFeedback(this.Math.abs(clickDirection - compassHeading) <= 45);
                    isCorrect = this.Math.abs(clickDirection - compassHeading) <= 45;
                }
                answer = {
                    clickDirection: clickDirection,
                    correct: isCorrect
                }
            } else {
                const toast = await this.toastController.create({
                    message: "Bitte setze zuerst deine Blickrichtung",
                    color: "dark",
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    compassHeading: undefined,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.NUMBER) {
            if (numberInput != undefined) {
                isCorrect = numberInput == this.task.answer.number
                this.initFeedback(isCorrect);
                answer = {
                    numberInput: numberInput,
                    correct: isCorrect
                }
            } else {
                const toast = await this.toastController.create({
                    message: "Bitte gib zuerst eine Zahl ein",
                    color: "dark",
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    numberInput: undefined,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.TEXT) {
            if (textInput != undefined) {
                this.initFeedback(true);
                isCorrect = true;
                answer = {
                    text: textInput,
                    correct: isCorrect
                }
            } else {
                const toast = await this.toastController.create({
                    message: "Bitte gib zuerst eine Antwort ein",
                    color: "dark",
                    // showCloseButton: true,
                    duration: 2000
                });
                toast.present();
                isCorrect = false;
                answer = {
                    text: undefined,
                    correct: isCorrect
                }
            }
        }

        this.trackerService.addEvent({
            type: "ON_OK_CLICKED",
            correct: isCorrect,
            answer: answer
        });
    }

    public initFeedback(correct: boolean) {
        // feedback is already showing. 
        if (this.showFeedback) {
            return;
        }

        let type: FeedbackType;

        if (this.task.settings.feedback) {
            if (correct) {
                type = FeedbackType.Correct;
            } else if (this.task.settings.multipleTries) {
                type = FeedbackType.TryAgain;
            } else {
                type = FeedbackType.Wrong;
            }
        } else {
            if (this.task.category == 'nav' && !this.task.settings.confirmation) {
                type = FeedbackType.Success
            } else {
                type = FeedbackType.Saved
            }
        }

        switch (type) {
            case FeedbackType.Correct:
                this.feedback.icon = "😊"
                this.feedback.text = "Du hast die Aufgabe richtig gelöst!"
                break;
            case FeedbackType.Wrong:
                this.feedback.icon = "😕"
                this.feedback.text = "Da ist etwas schief gegangen! Weiter geht es mit der nächsten Aufgabe!"
                break;
            case FeedbackType.TryAgain:
                this.feedback.icon = "😕"
                this.feedback.text = "Probiere es noch einmal!"
                this.feedbackRetry = true;
                break;
            case FeedbackType.Saved:
                this.feedback.icon = ""
                this.feedback.text = "Deine Antwort wurde gespeichert!"
                break;
            case FeedbackType.Success:
                this.feedback.icon = ""
                this.feedback.text = "Ziel erreicht!"
                break;
        }
        this.showFeedback = true

        if (type != FeedbackType.TryAgain) {
            if (Capacitor.isNative) {
                Plugins.Haptics.vibrate();
            }
            this.audioPlayer.play()
        }

        if (this.task.settings.multipleTries) {
            setTimeout(() => {
                this.dismissFeedback()
                if (type !== FeedbackType.TryAgain) {
                    this.playingGamePage.nextTask()
                }
            }, 2000)
        }

        if (!this.task.settings.feedback) {
            setTimeout(() => {
                this.dismissFeedback()
                this.playingGamePage.nextTask()
            }, 2000)
        }
    }

    public dismissFeedback() {
        this.showFeedback = false;
        this.feedbackRetry = false;
    }

    public remove(): void {
        this.positionSubscription.unsubscribe();
    }

    public onWaypointReached() {
        this.trackerService.addEvent({
            type: "WAYPOINT_REACHED"
        });
        this.initFeedback(true);
    }

    private userDidArrive(waypoint): boolean {
        const targetDistance = this.helperService.getDistanceFromLatLonInM(
            waypoint[1],
            waypoint[0],
            this.lastKnownPosition.coords.latitude,
            this.lastKnownPosition.coords.longitude
        );
        return targetDistance < PlayingGamePage.triggerTreshold;
    }

    get staticShowSuccess() {
        return PlayingGamePage.showSuccess
    }

    public getMapClickAnswer({
        selectedPhoto,
        isCorrectPhotoSelected,
        selectedChoice,
        isCorrectChoiceSelected,
        photo,
        photoURL,
        directionBearing,
        compassHeading,
        clickDirection,
        numberInput,
        textInput
    }, clickPosition) {
        // -------
        // Feedback in Map Click (needs to be in seperate function later on)
        // -------
        let answer = undefined;

        if (this.task.answer.type == AnswerType.POSITION) {
            const waypoint = this.task.answer.position.geometry.coordinates;
            const arrived = this.userDidArrive(waypoint);
            answer = {
                target: waypoint,
                position: this.lastKnownPosition,
                distance: this.helperService.getDistanceFromLatLonInM(waypoint[1], waypoint[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude),
                correct: arrived
            }
        }

        if (this.task.type == "theme-loc") {
            if (this.map.getSource('marker-point')) {
                const distance = this.helperService.getDistanceFromLatLonInM(clickPosition[1], clickPosition[0], this.lastKnownPosition.coords.latitude, this.lastKnownPosition.coords.longitude)
                answer = {
                    clickPosition: clickPosition,
                    distance: distance,
                    correct: distance < PlayingGamePage.triggerTreshold
                }
            } else {
                answer = {
                    clickPosition: undefined,
                    distance: undefined,
                    correct: false
                }
            }
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE) {
            if (selectedPhoto != null) {
                answer = {
                    selectedPhoto: selectedPhoto,
                    correct: isCorrectPhotoSelected
                }
            } else {
                answer = {
                    selectedPhoto: null,
                    correct: false
                }
            }
        }

        if (this.task.answer.type == AnswerType.MULTIPLE_CHOICE_TEXT) {
            if (selectedChoice != null) {
                answer = {
                    selectedChoice: selectedChoice,
                    correct: isCorrectChoiceSelected
                }
            } else {
                answer = {
                    selectedChoice: null,
                    correct: false
                }
            }
        }

        if (this.task.answer.type == AnswerType.PHOTO) {
            if (photo == "") {
                answer = {
                    photo: null,
                    correct: false
                }
            } else {
                answer = {
                    photo: photo,
                    correct: true
                }
            }
        }

        if (this.task.answer.type == AnswerType.MAP_POINT && this.task.type != "theme-loc") {
            if (this.map.getSource('marker-point')) {
                const isInPolygon = booleanPointInPolygon(clickPosition, this.task.question.geometry.features[0])
                answer = {
                    clickPosition: clickPosition,
                    correct: isInPolygon
                }
            } else {
                answer = {
                    clickPosition: undefined,
                    correct: false
                }
            }
        }

        if (this.task.answer.type == AnswerType.DIRECTION) {
            answer = {
                compassHeading: compassHeading,
                correct: this.Math.abs(directionBearing - compassHeading) <= 45
            }
        }

        if (this.task.answer.type == AnswerType.MAP_DIRECTION) {
            let isCorrect = false;
            if (clickDirection != 0) {
                if (this.task.question.type == QuestionType.MAP_DIRECTION_PHOTO) {
                    isCorrect = this.Math.abs(clickDirection - this.task.question.direction.bearing) <= 45;
                } else {
                    isCorrect = this.Math.abs(clickDirection - compassHeading) <= 45;
                }
                answer = {
                    clickDirection: clickDirection,
                    correct: isCorrect
                }
            } else {
                answer = {
                    compassHeading: undefined,
                    correct: isCorrect
                }
            }
        }

        if (this.task.answer.type == AnswerType.NUMBER) {
            answer = {
                numberInput: numberInput,
                correct: numberInput == this.task.answer.number
            }
        }

        if (this.task.answer.type == AnswerType.TEXT) {
            answer = {
                text: textInput,
                correct: textInput != undefined
            }
        }

        // -------
        // End of Feedback in Map Click (needs to be in seperate function later on)
        // -------

        return answer
    }
}