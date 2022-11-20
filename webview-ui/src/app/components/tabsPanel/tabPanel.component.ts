import { Component, Input } from "@angular/core";
import { IVaribleViewer } from "src/app/models/variableViewer";
import { vscode } from "../../utilities/vscode";


@Component ({
    selector: "tab-panel",
    templateUrl: "./tabPanel.component.html",
    styleUrls: ["./tabPanel.component.css"],
})
export class TabPanelComponent {
    @Input() variablesInfo : IVaribleViewer[];
    
    constructor() {
    }

    activateTab(tab: IVaribleViewer){
        this.variablesInfo.forEach(item => item.tabActive = false);
        tab.tabActive = true;
    }
};