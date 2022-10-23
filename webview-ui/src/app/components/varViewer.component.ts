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
  selectedOption : string[]  = [];

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  constructor() {
    this._createListenerCommands();
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private _createListenerCommands() {
    window.addEventListener("message", event => {
      const message = event.data;

      switch (message.command) {
        case this.variableInfo.prefixCmd + "_addNewLines":
          this.contentList = this.contentList.concat(message.text.split(','));
          break;

        case this.variableInfo.prefixCmd + "_allClear":
          this.contentList = [];
          break;
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public selectChanged(event : any) {
    let list : string[] = [];
    const values = event.target.selectedOptions;
    const len = values.length;
    for(let i = 0; i < len; i++) {
      list.push(values[i].value);
    }
    this.selectedOption = list;
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
    this.sendCommandText(this.variableInfo.prefixCmd + "_clickDeleteButton", this.selectedOption.toString());
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendCommand(command : string) {
    vscode.postMessage({
      command: command,
      text: "",
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendCommandText(command : string, msgText : string) {
    vscode.postMessage({
      command: command,
      text: msgText,
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
}