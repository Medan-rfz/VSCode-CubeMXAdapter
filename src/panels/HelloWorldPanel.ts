/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";
import * as path from 'path';
import {MakefileReader} from '../app/MakefileReader';



export class HelloWorldPanel {
  public static currentPanel: HelloWorldPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private makefileReader : MakefileReader;

  private workspacePath : string = '';

  private cSrcList : string[] = [];
  private cppSrcList : string[] = [];
  private incList : string[] = [];

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._setWebviewMessageListener(this._panel.webview);

    if(vscode.workspace.workspaceFolders !== undefined) {
      this.workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
    }

    this.makefileReader = new MakefileReader(this.workspacePath.slice(1) + '/' + 'Makefile');
    // TODO Check exist file

    this.initMakefileVariables();
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public static render(extensionUri: vscode.Uri) {
    if (HelloWorldPanel.currentPanel) {
      HelloWorldPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "showCubeMXadapter",
        "CubeMX adapter",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      HelloWorldPanel.currentPanel = new HelloWorldPanel(panel, extensionUri);
    }
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public dispose() {
    HelloWorldPanel.currentPanel = undefined;
    this._panel.dispose();
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
    const stylesUri = getUri(webview, extensionUri, ["webview-ui", "build", "styles.css"]);
    const runtimeUri = getUri(webview, extensionUri, ["webview-ui", "build", "runtime.js"]);
    const polyfillsUri = getUri(webview, extensionUri, ["webview-ui", "build", "polyfills.js"]);
    const scriptUri = getUri(webview, extensionUri, ["webview-ui", "build", "main.js"]);

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="stylesheet" type="text/css" href="${stylesUri}">
          <title>Hello World</title>
        </head>
        <body>
          <app-root></app-root>
          <script type="module" src="${runtimeUri}"></script>
          <script type="module" src="${polyfillsUri}"></script>
          <script type="module" src="${scriptUri}"></script>
        </body>
      </html>
    `;
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "cSrcFiles_clickAddButton":
            this.openCSourceDialog();
            return;
          
          case "cppSrcFiles_clickAddButton":
            this.openCppSourceDialog();
            return;

          case "incFiles_clickAddButton":
            this.openHeaderDialog();
            return;

          case "getAllMakefileInformation":
            this.sendAllVariablesToUi();
            return;
        }
      },
      undefined,
      this._disposables
    );
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private openCSourceDialog() {
    const opt : vscode.OpenDialogOptions = {
      filters: { 'C Source': ['c'] },
      canSelectMany : true,
      title : "Add C source files"
    };

    vscode.window.showOpenDialog(opt).then((value) => {
      if(value !== undefined) {
        let list : string[] = [];
        for(let i = 0; i < value.length; i++) {
          let newRelativePath = path.relative(this.workspacePath, value[i].path); // BUG back separator
          this.sendMsgAddPath("cSrcFiles_addNewLine", newRelativePath);
          list.push(newRelativePath);
          this.cSrcList.push(newRelativePath);
        }

        this.makefileReader.addValuesInVariable(this.makefileReader.cSourceMakeVar, list);
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private openCppSourceDialog() {
    const opt : vscode.OpenDialogOptions = {
      filters: { 'C++ Source': ['cpp'] },
      canSelectMany : true,
      title : "Add C++ source files"
    };

    vscode.window.showOpenDialog(opt).then((value) => {
      if(value !== undefined) {
        let list : string[] = [];
        for(let i = 0; i < value.length; i++) {
          let newRelativePath = path.relative(this.workspacePath, value[i].path); // BUG back separator
          this.sendMsgAddPath("cppSrcFiles_addNewLine", newRelativePath);
          list.push(newRelativePath);
          this.cppSrcList.push(newRelativePath);
        }
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private openHeaderDialog() {
    const opt : vscode.OpenDialogOptions = {
      filters: { },
      canSelectMany : true,
      canSelectFiles : false,
      canSelectFolders : true,
      title : "Add header folder"
    };

    vscode.window.showOpenDialog(opt).then((value) => {
      if(value !== undefined) {
        let list : string[] = [];
        for(let i = 0; i < value.length; i++) {
          let newRelativePath = path.relative(this.workspacePath, value[i].path); // BUG back separator
          this.sendMsgAddPath("incFiles_addNewLine", newRelativePath);
          list.push(newRelativePath);
          this.incList.push(newRelativePath);
        }
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendMsgAddRelativePath(cmd : string, fullPath : string) {
      this._panel.webview.postMessage({command: cmd, text: path.relative(this.workspacePath, fullPath)});
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendMsgAddPath(cmd : string, path : string) {
      this._panel.webview.postMessage({command: cmd, text: path});
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private initMakefileVariables() {
    this.cSrcList = this.makefileReader.getCSourcePaths();
    this.cppSrcList = this.makefileReader.getCppSourcePaths();
    this.incList = this.makefileReader.getIncludePaths();
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendAllVariablesToUi() {
    this.cSrcList.forEach(element => {
      this.sendMsgAddPath("cSrcFiles_addNewLine", element);
    });

    this.cppSrcList.forEach(element => {
      this.sendMsgAddPath("cppSrcFiles_addNewLine", element);
    });

    this.incList.forEach(element => {
      this.sendMsgAddPath("incFiles_addNewLine", element);
    });
  }
}
