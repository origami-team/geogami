import { Component } from "@angular/core";
import { Inject } from "@angular/core";

import {
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "download-track-dialog",
  templateUrl: "download-track-dialog.html",
  styleUrls: ["./download-track-dialog.scss"],
})
export class downloadTrackDialog {
  // backupType: string; // 'bookmarks' | 'snippets';
  blobUrl: any;
  sanitizedBlobUrl: any;
  filename: string;
  gameName: string;
  players: string;

  constructor(
    private dialogRef: MatDialogRef<downloadTrackDialog>,
    // private router: Router,
    @Inject(MAT_DIALOG_DATA) data,
    private sanitizer: DomSanitizer
  ) {
    this.sanitizedBlobUrl = this.sanitizer.bypassSecurityTrustUrl(data.blobUrl);
    this.blobUrl = data.blobUrl;
    // this.backupType = data.backupType;
    this.gameName = data.gameName;
    this.players = data.players.toString();
    const currentDate = new Date();
    this.filename = `${this.gameName}_${
      this.players
    }_${currentDate.toISOString()}.json`;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
  download() {
    this.dialogRef.close();
  }
}
