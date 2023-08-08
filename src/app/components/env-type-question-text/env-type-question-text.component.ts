import { Component, Input, OnInit } from "@angular/core";
import { Platform } from "@ionic/angular";

@Component({
  selector: "env-type-question-text",
  templateUrl: "./env-type-question-text.component.html",
})
export class EnvTypeQuestionTextComponent implements OnInit {
  @Input() isVirtualWorld: boolean;
  @Input() virEnvType: string;
  @Input() questionText: string;


  constructor(public platform: Platform) {}      //* used in html

  ngOnInit() {    
  }
}
