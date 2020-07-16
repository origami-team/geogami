import {
    Component, OnInit, Input, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter
} from "@angular/core";

import { QuestionType, TaskMode } from './../../../../models/types'
import { PopoverComponent } from 'src/app/popover/popover.component';
import { PopoverController } from '@ionic/angular';
import { AudioRecorderService } from 'src/app/services/audio-recorder.service';
import { environment } from 'src/environments/environment';
import { MediaCapture, MediaFile, CaptureError, CaptureImageOptions, CaptureAudioOptions } from '@ionic-native/media-capture/ngx';


@Component({
    selector: "app-audio-recorder",
    templateUrl: "./audio-recorder.component.html",
    styleUrls: ["./audio-recorder.component.scss"]
})
export class AudioRecorderComponent implements OnInit {
    @Input() audioSource: string;

    @Output() audioSourceChange: EventEmitter<any> = new EventEmitter<any>();
    recording: boolean = false

    constructor(public popoverController: PopoverController, private audioRecorder: AudioRecorderService) { }

    ngOnInit() {

    }

    startStopRec() {
        if (this.recording) {
            this.stopRecord()
        } else {
            this.startRecord()
        }
    }

    startRecord() {
        this.audioRecorder.start()
        this.recording = true;
    }

    stopRecord() {
        this.recording = false
        this.audioRecorder.stop().then(({ filename }) => {
            this.audioSource = `${environment.apiURL}/audio/${filename}`
            this.audioSourceChange.emit(this.audioSource)
        })
    }

    deleteAudio() {
        this.audioSource = undefined;
        this.audioSourceChange.emit(this.audioSource)
    }

    async showPopover(ev: any, text: string) {
        console.log(ev);
        const popover = await this.popoverController.create({
            component: PopoverComponent,
            event: ev,
            translucent: true,
            componentProps: { text }
        });
        return await popover.present();
    }
}