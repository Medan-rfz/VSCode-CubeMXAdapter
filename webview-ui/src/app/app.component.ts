import { Component } from "@angular/core";
import { vscode } from "./utilities/vscode";
import * as vscodeLib from "vscode";
//import * as tetsExp from "../../../src/app/Handlers";


@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "CubeMXAdapt";
  cSrcFiles : string[] = [];

  constructor() {
    this._createListenerCommands();
  };

  cSrcAddClick() {
    vscode.postMessage({
      command: "cSrcAddBattonClick",
      text: "",
    });
  }

  private _createListenerCommands() {
    window.addEventListener('message', event => {
      const message = event.data;

      switch (message.command) {
        case 'addNewCSrcLine':
          this.cSrcFiles.push(message.text);
          break;
      }
    });
  }
}

