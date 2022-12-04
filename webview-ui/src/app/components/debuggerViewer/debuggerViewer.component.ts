import { Component, Input } from "@angular/core";
import { vscode } from "../../utilities/vscode";

@Component ({
    selector: "debugger-viewer",
    templateUrl: "./debuggerViewer.component.html",
    styleUrls: ["./../../styles/mainStyles.css", "./debuggerViewer.component.css"],
})
export class DebuggerViewerComponent {
    title = "Debugger"
    description = "...";
    contentList : string[] = [
        "stlink",
        "jlink",
        "cmsis-dap"
    ];
    selectedOption : string = this.contentList[0];

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    constructor() {
        this._createListenerCommands();
        this.sendCommand("debugger_getSelected"); 
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private _createListenerCommands() {
        window.addEventListener("message", event => {
            const message = event.data;

            switch (message.command) {
                case "debugger_UpdateSelected":
                    this.selectedOption = message.text;

                    break;
            }
        });
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public selectChanged(event : any) {
        this.selectedOption = event.target.selectedOptions[0].value;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public clickApplyButton() {
        this.sendCommandText("debugger_selectedUpdate", this.selectedOption);
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