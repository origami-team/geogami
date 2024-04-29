import { HttpParams } from "@angular/common/http";
import { Component, OnInit, SecurityContext } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-playing-virenv",
  templateUrl: "./playing-virenv.page.html",
  styleUrls: ["./playing-virenv.page.scss"],
})
export class PlayingVirenvPage implements OnInit {
  webGLURL: string = null;
  url: string = null;
  urlSafe: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private readonly domSanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      if (params) {
        // console.log("🚀 ~ PlayingVirenvPage ~ this.route.params.subscribe ~ params:", params);

        let queryParamsString = new HttpParams({
          fromObject: JSON.parse(params.queryParams),
        }).toString();

        // console.log("🚀 ~ PlayingVirenvPage ~ this.route.params.subscribe ~ queryParamsString:", queryParamsString);

        this.webGLURL = `${environment.webglURL}?`.concat(queryParamsString);

        // The url needs to be sanitized, before used in iframe
        this.urlSafe = this.sanitizedURL(this.webGLURL);
        console.log(
          "🚀 ~ PlayingVirenvPage ~ this.route.params.subscribe ~ webGLURL:",
          this.urlSafe
        );
      } else {
        console.log("🚀 ~ url is missing");
      }
    });
  }

  /* To sanitize url before being shown in iframe */
  sanitizedURL(url: string) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(this.webGLURL);
  }
}
