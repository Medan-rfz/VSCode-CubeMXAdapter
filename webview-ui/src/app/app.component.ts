import { Component } from "@angular/core";
import { variableViewers } from "./data/variableViewers";
import { IVaribleViewer } from "./models/variableViewer";
import { MessageSender } from "./utilities/messageSender";

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
    MessageSender.sendCommand("getAllMakefileInformation");
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
    MessageSender.sendCommand("adaptPrjForVSC");
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public clickAdaptCpp() {
    MessageSender.sendCommand("adaptPrjForCpp");
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public clickLoadSVDButton() {
    MessageSender.sendCommand("svdFiles_clickLoadButton");
  }
}
