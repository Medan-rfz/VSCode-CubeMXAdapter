import { Component } from "@angular/core";
import { vscode } from "../utilities/vscode";


@Component ({
    selector: "file-viewer",
    templateUrl: "./fileViewer.component.html",
    styleUrls: ["./fileViewer.component.css"],
})
export class FileViewerComponent {

    title : string = "None";
    description : string = "NaN";


    selectCSrcChanged(event : Event) {

    }


    public sendCommand(command : string) {
        vscode.postMessage({
          command: command,
          text: "",
        });
      }
}