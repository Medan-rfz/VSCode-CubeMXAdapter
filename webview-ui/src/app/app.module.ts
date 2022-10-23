import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { VarViewerComponent } from "./components/varViewer.component";
import { SvdViewerComponent } from "./components/svdViewer.component";

@NgModule({
  declarations: [AppComponent, VarViewerComponent, SvdViewerComponent],
  imports: [BrowserModule],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule {}
