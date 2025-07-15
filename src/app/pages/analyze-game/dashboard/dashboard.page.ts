import { HttpParams } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { GamesService } from "src/app/services/games.service";
import { environment } from "src/environments/environment";

// Angular component for the dashboard page
@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.page.html",
  styleUrls: ["./dashboard.page.scss"],
})
export class DashboardPage implements OnInit {
  // Holds the dashboard URL with token
  dashboardURL: string = null;
  // Holds the sanitized URL for iframe usage
  urlSafe: SafeResourceUrl;

  // Inject GamesService and DomSanitizer
  constructor(
    public gamesService: GamesService,
    private readonly domSanitizer: DomSanitizer
  ) {}

  // Lifecycle hook runs on component initialization
  ngOnInit() {
    // Retrieve access token from local storage
    const token = window.localStorage.getItem("bg_accesstoken");
    // Build dashboard URL with token as query parameter
    this.dashboardURL= `${environment.dashboardURL}?token=${encodeURIComponent(
      token ?? ""
    )}`;

    // Sanitize the URL before using it in an iframe
    this.urlSafe = this.sanitizedURL(this.dashboardURL);
  }

  /**
   * Sanitizes a URL for safe usage in an iframe
   * @param url The URL to sanitize
   * @returns SafeResourceUrl
   */
  sanitizedURL(url: string) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
