import { Component, Input } from "@angular/core";
import { MessageSender } from "../../utilities/messageSender";

interface EditableValue {
    value: string;
    isSelected: boolean;
    isEditMode: boolean;
}

@Component ({
    selector: "editable-list",
    templateUrl: "./editableList.component.html",
    styleUrls: ["./../../styles/mainStyles.css", "./editableList.component.css"],
})
export class EditableListComponent {

    selectedOption : string = "";

    valuesList : EditableValue[] = [];

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    constructor() {
        this._createListenerCommands();

        this.valuesList.push({value:"test1", isEditMode:false, isSelected:false});
        this.valuesList.push({value:"test1", isEditMode:false, isSelected:false});
        this.valuesList.push({value:"test1", isEditMode:false, isSelected:false});
        this.valuesList.push({value:"test1", isEditMode:false, isSelected:false});
        this.valuesList.push({value:"test1", isEditMode:false, isSelected:false});
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private _createListenerCommands() {
        window.addEventListener("message", event => {
            const message = event.data;

            // switch (message.command) {
            //     case "":
                
            //         break;
            // }
        });
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public labelDoubleClick(event : any) {

    }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
}