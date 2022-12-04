import { Component, Input } from "@angular/core";
import { vscode } from "../../utilities/vscode";

@Component ({
    selector: "editable-option",
    templateUrl: "./editableOption.component.html",
    styleUrls: ["./../../styles/mainStyles.css", "./editableOption.component.css"],
})
export class EditableOptionComponent {

    @Input() value: string;
    public isEdit: boolean = false;

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    constructor() {

    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public editClick() {
        this.isEdit = true;
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