import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";
import * as path from 'path';
import {MakefileReader} from '../app/MakefileReader';
import * as svdDownloader from '../app/svdDownloader'

export class HelloWorldPanel {
  public static currentPanel: HelloWorldPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private makefileReader : MakefileReader;
  private workspacePath : string = '';
  private svdFilesList : string[] = [];

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._setWebviewMessageListener(this._panel.webview);

    if(vscode.workspace.workspaceFolders !== undefined) {
      this.workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    this.makefileReader = new MakefileReader(this.workspacePath + "/Makefile");

    svdDownloader.getListOfSvdFiles().then(svdList => {
      this.svdFilesList = svdList;
      this.sendMsgAddPaths("svdFiles_UpdateList", this.svdFilesList);
    });
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
          case "adaptPrjForVSC":
            this.adaptForVSC();
            return;

          case "adaptPrjForCpp":
            this.adaptForCpp();
            return;

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

          case "cSrcFiles_clickDeleteButton":
            this.makefileReader.deleteValuesInVariable(this.makefileReader.cSourceMakeVar, text.split(','));
            this.sendAllVariablesToUi();
            return;

          case "cppSrcFiles_clickDeleteButton":
            this.makefileReader.deleteValuesInVariable(this.makefileReader.cppSourceMakeVar, text.split(','));
            this.sendAllVariablesToUi();
            return;

          case "incFiles_clickDeleteButton":
            this.makefileReader.deleteValuesInVariable(this.makefileReader.cIncludeMakeVar, text.split(','));
            this.sendAllVariablesToUi();
            return;

          case "svdFiles_clickLoadButton":
            svdDownloader.downloadSvdFile(this.workspacePath, text);

          case "svdFiles_getList":
            this.sendMsgAddPaths("svdFiles_UpdateList", this.svdFilesList);
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
          let newRelativePath = path.relative(this.workspacePath, value[i].fsPath).replace(/\\/g, '/');
          list.push(newRelativePath);
        }

        let existList = this.makefileReader.getVariableList(this.makefileReader.cSourceMakeVar);
        list = this.exeptCompareItems(existList, list);
        if(list.length !== 0) {
          this.sendMsgAddPaths("cSrcFiles_addNewLines", list);
          this.makefileReader.addValuesInVariable(this.makefileReader.cSourceMakeVar, list);
        }
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
          let newRelativePath = path.relative(this.workspacePath, value[i].fsPath).replace(/\\/g, '/');
          list.push(newRelativePath);
        }

        if(this.makefileReader.checkExistVariable(this.makefileReader.cppSourceMakeVar)) {
          let existList = this.makefileReader.getVariableList(this.makefileReader.cppSourceMakeVar);
          list = this.exeptCompareItems(existList, list);
          if(list.length !== 0) {
            this.sendMsgAddPaths("cppSrcFiles_addNewLines", list);
            this.makefileReader.addValuesInVariable(this.makefileReader.cppSourceMakeVar, list);
          }
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
          let newRelativePath = path.relative(this.workspacePath, value[i].fsPath).replace(/\\/g, '/');
          list.push(newRelativePath);
        }

        let existList = this.makefileReader.getVariableList(this.makefileReader.cIncludeMakeVar);
        existList = existList.map((value) => value.replace(/-I/g, ''));
        list = this.exeptCompareItems(existList, list);
        if(list.length !== 0) {
          this.sendMsgAddPaths("incFiles_addNewLines", list);
          this.makefileReader.addValuesInVariableWithPrefix(this.makefileReader.cIncludeMakeVar, "-I", list);
        }
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private adaptForVSC() {
    this.makefileReader.activateSilentMode();
    this.makefileReader.activateEchoForCompilation();
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private adaptForCpp() {
    this.makefileReader.addCppCompilerVar();
    this.makefileReader.addNewVariableAfter(this.makefileReader.cSourceMakeVar, this.makefileReader.cppSourceMakeVar);
    this.makefileReader.addCppCompilerFlags();
    this.makefileReader.addCppObjectsVar();
    this.makefileReader.addCppCompileTask();
    this.makefileReader.changeLinker();
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendCmd(cmd : string) {
    this._panel.webview.postMessage({command: cmd, text: ''});
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendMsgAddPaths(cmd : string, paths : string[]) {
    if(paths.length !== 0) {
      this._panel.webview.postMessage({command: cmd, text: paths.toString()});
    }
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private sendAllVariablesToUi() {
    this.sendCmd("cSrcFiles_allClear");
    this.sendCmd("cppSrcFiles_allClear");
    this.sendCmd("incFiles_allClear");
    this.sendMsgAddPaths("cSrcFiles_addNewLines", this.makefileReader.getCSourcePaths());
    this.sendMsgAddPaths("cppSrcFiles_addNewLines", this.makefileReader.getCppSourcePaths());
    this.sendMsgAddPaths("incFiles_addNewLines", this.makefileReader.getIncludePaths());
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private exeptCompareItems(existList : string[], addedList : string[]) : string[] {
    let newList : string[] = [];
    for(let addedItem of addedList) {
      newList.push(addedItem);
      for(let existItem of existList) {
        if(addedItem === existItem) { 
          newList.pop(); 
        }
      }
    }
    return newList;
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//


}
