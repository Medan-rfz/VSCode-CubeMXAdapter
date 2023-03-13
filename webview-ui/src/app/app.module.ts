import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from '@angular/forms';

import { AppComponent } from "./app.component";
import { VarViewerComponent } from "./components/varViewer/varViewer.component";
import { ToolchainViewerComponent } from "./components/toolchainViewer/toolchainViewer.component";
import { TabPanelComponent } from "./components/tabsPanel/tabPanel.component";
import { DebuggerViewerComponent } from "./components/debuggerViewer/debuggerViewer.component";
import {EditableListComponent} from "./components/editableList/editableList.component";

@NgModule({
  declarations: [AppComponent, VarViewerComponent, ToolchainViewerComponent,
                TabPanelComponent, DebuggerViewerComponent, EditableListComponent],
  imports: [BrowserModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
