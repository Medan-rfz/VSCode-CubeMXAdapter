import { Component } from "@angular/core";
import { variableViewers } from "./data/variableViewers";
import { IVaribleViewer } from "./models/variableViewer";
import { vscode } from "./utilities/vscode";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./styles/mainStyles.css", "./app.component.css"],
})
export class AppComponent {
  title = "CubeMX adapter";
  cSrcFiles: string[] = [];
  cppSrcFiles: string[] = [];
  headerFolders: string[] = [];
  definesList: string[] = [];
  varViewer: IVaribleViewer[] = variableViewers;
  svdListIsLoad: boolean = false;

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  constructor() {
    this._createListenerCommands();
    this.sendCommand("getAllMakefileInformation");
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private _createListenerCommands() {
    window.addEventListener("message", (event) => {
      const message = event.data;

      switch (message.command) {
        case "addNewCSrcLine":
          this.cSrcFiles.push(message.text);
          break;

        case "addNewCppSrcLine":
          this.cppSrcFiles.push(message.text);
          break;

        case "addNewHeaderFolderLine":
          this.headerFolders.push(message.text);
          break;

        case "addNewDefinesLine":
          this.definesList.push(message.text);
          break;

        case "svdFile_beginListLoad":
          this.svdListIsLoad = true;
          break;

        case "svdFile_endListLoad":
          this.svdListIsLoad = false;
          break;
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public clickAdaptVSC() {
    this.sendCommand("adaptPrjForVSC");
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public clickAdaptCpp() {
    this.sendCommand("adaptPrjForCpp");
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public clickLoadSVDButton() {
    this.sendCommand("svdFiles_clickLoadButton");
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public sendCommand(command : string) {
    vscode.postMessage({
      command: command,
      text: "",
    });
  }
}
