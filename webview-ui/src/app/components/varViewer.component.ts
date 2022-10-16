import { Component, Input } from "@angular/core";
import { IVaribleViewer } from "../models/variableViewer";
import { vscode } from "../utilities/vscode";

@Component ({
    selector: "var-viewer",
    templateUrl: "./varViewer.component.html",
    styleUrls: ["./varViewer.component.css"],
})
export class VarViewerComponent {
  @Input() variableInfo : IVaribleViewer;
  contentList : string[] = [];

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  constructor() {
    this._createListenerCommands();
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private _createListenerCommands() {
    window.addEventListener("message", event => {
      const message = event.data;

      switch (message.command) {
        case this.variableInfo.prefixCmd + "_addNewLine":
          this.contentList.push(message.text);
          break;
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  selectCSrcChanged(event : Event) {

  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public clickAddButton() {
    this.sendCommand(this.variableInfo.prefixCmd + "_clickAddButton");
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public clickEditButton() {
    this.sendCommand(this.variableInfo.prefixCmd + "_clickEditButton");
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public clickDeleteButton() {
    this.sendCommand(this.variableInfo.prefixCmd + "_clickDeleteButton");
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendCommand(command : string) {
    vscode.postMessage({
      command: command,
      text: "",
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
}