import * as vscode from "vscode";
import { getUri } from "../../utilities/getUri";
import * as path from 'path';
import {MakefileReader} from '../../app/MakefileReader';
import * as svdDownloader from '../../app/SvdDownloader';
import {cCppPropertiesReader} from '../../app/CCppProperties';
import {DebugLaunchReader} from '../../app/DebugLaunchReader';
import {MainConfigJson} from '../../app/MainConfigJson';

export class CubeMxAdapterPanel {
  public static currentPanel: CubeMxAdapterPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private makefileReader : MakefileReader;
  private cCppPropReader : cCppPropertiesReader;
  private debugLaunchReader : DebugLaunchReader;
  private mainConfigJson : MainConfigJson;
  private workspacePath : string = '';
  private svdFilesList : string[] = [];

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
    this.cCppPropReader = new cCppPropertiesReader(this.workspacePath + "/.vscode/c_cpp_properties.json", this.makefileReader);
    this.debugLaunchReader = new DebugLaunchReader(this.workspacePath + "/.vscode/launch.json", this.makefileReader)
    this.mainConfigJson = new MainConfigJson();

    svdDownloader.getListOfSvdFiles().then(svdList => {
      this.svdFilesList = svdList;
      this.sendMsgAddPaths("svdFiles_UpdateList", this.svdFilesList);
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public static render(extensionUri: vscode.Uri) {
    if (CubeMxAdapterPanel.currentPanel) {
      CubeMxAdapterPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "showCubeMXadapter",
        "CubeMX adapter",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      CubeMxAdapterPanel.currentPanel = new CubeMxAdapterPanel(panel, extensionUri);
    }
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  public dispose() {
    CubeMxAdapterPanel.currentPanel = undefined;
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
          <title>CubeMX adapter</title>
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

          case "toolChain_clickChangeCompilerPath":
            this.openToolchainPathDialog("toolChain_UpdateCompilerPath", "Compiler path");
            return;

          case "toolChain_clickChangeOpenocdPath":
            this.openToolchainPathDialog("toolChain_UpdateOpenocdPath", "Openocd path");
            return;

          case "cSrcFiles_clickAddButton":
            this.openCSourceDialog();
            return;

          case "cppSrcFiles_clickAddButton":
            this.openCppSourceDialog();
            return;

          case "incFolders_clickAddButton":
            this.openHeaderDialog();
            return;

          case "defines_clickAddButton":
            // this.openHeaderDialog();
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

          case "incFolders_clickDeleteButton":
            this.makefileReader.deleteValuesInVariable(
              this.makefileReader.cIncludeMakeVar,
              text.split(",")
            );
            this.sendAllVariablesToUi();
            return;

          case "defines_clickDeleteButton":
            this.makefileReader.deleteValuesInVariable(
              this.makefileReader.cDefineMakeVar,
              text.split(",")
            );
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
  private openToolchainPathDialog(cmd: string, title: string) {
    const opt: vscode.OpenDialogOptions = {
      filters: {},
      canSelectMany: false,
      canSelectFiles: false,
      canSelectFolders: true,
      title: title,
    };

    vscode.window.showOpenDialog(opt).then((value) => {
      if(value !== undefined) {
        let newPath = value[0].fsPath.replace(/\\/g, '/');
        this.sendMsg(cmd, newPath);

        if(title === "Compiler path") {
          this.mainConfigJson.setCompilerPath(newPath);
        }
        else if (title === "Openocd path") {
          this.mainConfigJson.setOpenocdPath(newPath);
        }
      }
    });
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
    const opt: vscode.OpenDialogOptions = {
      filters: { "C++ Source": ["cpp"] },
      canSelectMany: true,
      title: "Add C++ source files",
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
    const opt: vscode.OpenDialogOptions = {
      filters: {},
      canSelectMany: true,
      canSelectFiles: false,
      canSelectFolders: true,
      title: "Add header folder",
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
          this.sendMsgAddPaths("incFolders_addNewLines", list);
          this.makefileReader.addValuesInVariableWithPrefix(this.makefileReader.cIncludeMakeVar, "-I", list);
          // TODO Add into c/cpp prop
        }
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private adaptForVSC() {
    this.makefileReader.activateSilentMode();
    this.makefileReader.activateEchoForCompilation();
    this.cCppPropReader.InitNewConfiguration();
    this.debugLaunchReader.InitNewConfiguration();
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
  private sendMsg(cmd: string, msg: string) {
    this._panel.webview.postMessage({command: cmd, text: msg});
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
    this.sendCmd("incFolders_allClear");
    this.sendCmd("defines_allClear");
    this.sendMsgAddPaths("cSrcFiles_addNewLines", this.makefileReader.getCSourcePaths());
    this.sendMsgAddPaths("cppSrcFiles_addNewLines", this.makefileReader.getCppSourcePaths());
    this.sendMsgAddPaths("incFolders_addNewLines", this.makefileReader.getIncludePaths());
    this.sendMsgAddPaths("defines_addNewLines", this.makefileReader.getDefines());

    this.sendMsg("toolChain_UpdatePaths", 
      JSON.stringify({ compilerPath: this.mainConfigJson.getCompilerPath(), openocdPath: this.mainConfigJson.getOpenocdPath()}));
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
