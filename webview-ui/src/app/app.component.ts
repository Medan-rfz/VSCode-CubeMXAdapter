import { Component } from "@angular/core";
import { variableViewers } from "./data/variableViewers";
import { IVaribleViewer } from "./models/variableViewer";
import { vscode } from "./utilities/vscode";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "CubeMX adapter";
  cSrcFiles: string[] = [];
  cppSrcFiles: string[] = [];
  headerFolders: string[] = [];
  definesList: string[] = [];
  varViewer: IVaribleViewer[] = variableViewers;

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
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public sendCommand(command: string) {
    vscode.postMessage({
      command: command,
      text: "",
    });
  }
}
