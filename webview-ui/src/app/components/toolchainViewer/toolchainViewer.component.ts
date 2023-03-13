import { Component, Input } from "@angular/core";
import { MessageSender } from "../../utilities/messageSender";

@Component ({
    selector: "toolchain-viewer",
    templateUrl: "./toolchainViewer.component.html",
    styleUrls: ["./../../styles/mainStyles.css", "./toolchainViewer.component.css"],
})
export class ToolchainViewerComponent {
    title = "Toolchain"
    description = "...";
    selectedOption : string;
    compilerPath: "";
    openocdPath: "";

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= -=-=-=-=-=-=-=-=-=-=//
    constructor() {
        this._createListenerCommands();
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private _createListenerCommands() {
        window.addEventListener("message", event => {
            const message = event.data;

            switch (message.command) {
                case "toolChain_UpdatePaths":
                    let paths = JSON.parse(message.text);
                    this.compilerPath = paths.compilerPath;
                    this.openocdPath = paths.openocdPath;
                    break;
                
                case "toolChain_UpdateCompilerPath":
                    this.compilerPath = message.text;
                    break;

                case "toolChain_UpdateOpenocdPath":
                    this.openocdPath = message.text;
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
    public clickChangeCompilerButton() {
        MessageSender.sendCommand("toolChain_clickChangeCompilerPath");
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public clickChangeOpenocdButton() {
        MessageSender.sendCommand("toolChain_clickChangeOpenocdPath");
    }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
}