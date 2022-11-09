import { Component, Input } from "@angular/core";
import { vscode } from "../../utilities/vscode";

@Component ({
    selector: "toolchain-viewer",
    templateUrl: "./toolchainViewer.component.html",
    styleUrls: ["./toolchainViewer.component.css"],
})
export class ToolchainViewerComponent {
    title = "Toolchain"
    description = "...";
    contentList : string[] = [];
    selectedOption : string;

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= -=-=-=-=-=-=-=-=-=-=//
    constructor() {
        //this.sendCommand("svdFiles_getList");
        this._createListenerCommands();
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private _createListenerCommands() {
        window.addEventListener("message", event => {
            const message = event.data;

            switch (message.command) {
                case "toolChain_UpdateList":
                    this.contentList = message.text.split(',');
                    break;
            }
        });
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public selectChanged(event : any) {
        let list : string[] = [];
        this.selectedOption = event.target.selectedOptions[0].value;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public clickBrowserButton() {
        //this.sendCommandText("svdFiles_clickLoadButton", this.selectedOption);
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