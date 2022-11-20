import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { VarViewerComponent } from "./components/varViewer/varViewer.component";
import { SvdViewerComponent } from "./components/svdViewer/svdViewer.component";
import { ToolchainViewerComponent } from "./components/toolchainViewer/toolchainViewer.component";
import { TabPanelComponent } from "./components/tabsPanel/tabPanel.component";

@NgModule({
  declarations: [AppComponent, VarViewerComponent, SvdViewerComponent, ToolchainViewerComponent,
                TabPanelComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
