import { Component, Input } from "@angular/core";
import { MessageSender } from "../../utilities/messageSender";

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
        MessageSender.sendCommand("debugger_getSelected"); 
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
        MessageSender.sendCommandText("debugger_selectedUpdate", this.selectedOption);
    }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
}