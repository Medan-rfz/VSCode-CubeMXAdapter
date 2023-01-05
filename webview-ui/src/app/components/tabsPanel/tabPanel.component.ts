import { Component, Input } from "@angular/core";
import { IVaribleViewer } from "src/app/models/variableViewer";


@Component ({
    selector: "tab-panel",
    templateUrl: "./tabPanel.component.html",
    styleUrls: ["./../../styles/mainStyles.css", "./tabPanel.component.css"],
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