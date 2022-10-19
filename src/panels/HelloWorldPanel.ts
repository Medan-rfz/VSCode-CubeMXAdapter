import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";
import * as path from "path";
import { MakefileReader } from "../app/MakefileReader";

export class HelloWorldPanel {
  public static currentPanel: HelloWorldPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private makefileReader: MakefileReader;
  private workspacePath: string = "";

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._setWebviewMessageListener(this._panel.webview);

    if (vscode.workspace.workspaceFolders !== undefined) {
      this.workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    this.makefileReader = new MakefileReader(this.workspacePath + "/Makefile");
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

          case "definesList_clickAddButton":
            //            this.openHeaderDialog();
            return;

          case "getAllMakefileInformation":
            this.sendAllVariablesToUi();
            return;

          case "cSrcFiles_clickDeleteButton":
            this.makefileReader.deleteValuesInVariable(
              this.makefileReader.cSourceMakeVar,
              text.split(",")
            );
            this.sendAllVariablesToUi();
            return;

          case "cppSrcFiles_clickDeleteButton":
            this.makefileReader.deleteValuesInVariable(
              this.makefileReader.cppSourceMakeVar,
              text.split(",")
            );
            this.sendAllVariablesToUi();
            return;

          case "incFiles_clickDeleteButton":
            this.makefileReader.deleteValuesInVariable(
              this.makefileReader.cIncludeMakeVar,
              text.split(",")
            );
            this.sendAllVariablesToUi();
            return;

          case "definesList_clickDeleteButton":
            this.makefileReader.deleteValuesInVariable(
              this.makefileReader.cDefineMakeVar,
              text.split(",")
            );
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
    const opt: vscode.OpenDialogOptions = {
      filters: { "C Source": ["c"] },
      canSelectMany: true,
      title: "Add C source files",
    };

    vscode.window.showOpenDialog(opt).then((value) => {
      if (value !== undefined) {
        let list: string[] = [];
        for (let i = 0; i < value.length; i++) {
          let newRelativePath = path
            .relative(this.workspacePath, value[i].fsPath)
            .replace(/\\/g, "/");
          list.push(newRelativePath);
        }

        this.sendMsgAddPaths("cSrcFiles_addNewLines", list);
        this.makefileReader.addValuesInVariable(this.makefileReader.cSourceMakeVar, list);
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private openCppSourceDialog() {
    const opt: vscode.OpenDialogOptions = {
      filters: { "C++ Source": ["cpp"] },
      canSelectMany: true,
      title: "Add C++ source files",
    };

    vscode.window.showOpenDialog(opt).then((value) => {
      if (value !== undefined) {
        let list: string[] = [];
        for (let i = 0; i < value.length; i++) {
          let newRelativePath = path
            .relative(this.workspacePath, value[i].path)
            .replace(/\\/g, "/");
          list.push(newRelativePath);
        }

        this.sendMsgAddPaths("cppSrcFiles_addNewLines", list);
        this.makefileReader.addValuesInVariable(this.makefileReader.cppSourceMakeVar, list);
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private openHeaderDialog() {
    const opt: vscode.OpenDialogOptions = {
      filters: {},
      canSelectMany: true,
      canSelectFiles: false,
      canSelectFolders: true,
      title: "Add header folder",
    };

    vscode.window.showOpenDialog(opt).then((value) => {
      if (value !== undefined) {
        let list: string[] = [];
        for (let i = 0; i < value.length; i++) {
          let newRelativePath = path
            .relative(this.workspacePath, value[i].path)
            .replace(/\\/g, "/");
          list.push(newRelativePath);
        }

        this.sendMsgAddPaths("incFiles_addNewLines", list);
        this.makefileReader.addValuesInVariable(this.makefileReader.cIncludeMakeVar, list);
      }
    });
  }

  // private openHeaderDialog() {       ADD definesDialog !!!!!!!!
  //   const opt: vscode.OpenDialogOptions = {
  //     filters: {},
  //     canSelectMany: true,
  //     canSelectFiles: false,
  //     canSelectFolders: true,
  //     title: "Add header folder",
  //   };

  //   vscode.window.showOpenDialog(opt).then((value) => {
  //     if (value !== undefined) {
  //       let list: string[] = [];
  //       for (let i = 0; i < value.length; i++) {
  //         let newRelativePath = path
  //           .relative(this.workspacePath, value[i].path)
  //           .replace(/\\/g, "/");
  //         list.push(newRelativePath);
  //       }

  //       this.sendMsgAddPaths("incFiles_addNewLines", list);
  //       this.makefileReader.addValuesInVariable(this.makefileReader.cIncludeMakeVar, list);
  //     }
  //   });
  // }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendCmd(cmd: string) {
    this._panel.webview.postMessage({ command: cmd, text: "" });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendMsgAddPaths(cmd: string, paths: string[]) {
    this._panel.webview.postMessage({ command: cmd, text: paths.toString() });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendAllVariablesToUi() {
    this.sendCmd("cSrcFiles_allClear");
    this.sendCmd("cppSrcFiles_allClear");
    this.sendCmd("incFiles_allClear");
    this.sendCmd("definesList_allClear");
    this.sendMsgAddPaths("cSrcFiles_addNewLines", this.makefileReader.getCSourcePaths());
    this.sendMsgAddPaths("cppSrcFiles_addNewLines", this.makefileReader.getCppSourcePaths());
    this.sendMsgAddPaths("incFiles_addNewLines", this.makefileReader.getIncludePaths());
    this.sendMsgAddPaths("definesList_addNewLines", this.makefileReader.getDefinesPath());
  }
}
