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
  private workspacePath : string = '';
  private svdFilesList : string[] = [];

  public static makefileReader : MakefileReader;
  public static cCppPropReader : cCppPropertiesReader;
  public static debugLaunchReader : DebugLaunchReader;
  public static mainConfigJson : MainConfigJson;

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    this._setWebviewMessageListener(this._panel.webview);

    if (vscode.workspace.workspaceFolders !== undefined) {
      this.workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    CubeMxAdapterPanel.mainConfigJson = new MainConfigJson();
    CubeMxAdapterPanel.makefileReader = new MakefileReader(this.workspacePath + "/Makefile");
    CubeMxAdapterPanel.cCppPropReader = new cCppPropertiesReader(this.workspacePath + "/.vscode/c_cpp_properties.json", CubeMxAdapterPanel.makefileReader);
    CubeMxAdapterPanel.debugLaunchReader = new DebugLaunchReader(this.workspacePath + "/.vscode/launch.json", CubeMxAdapterPanel.makefileReader)

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
            // TODO David will implement
            return;

          case "getAllMakefileInformation":
            this.sendAllVariablesToUi();
            return;

          case "cSrcFiles_clickDeleteButton":
            CubeMxAdapterPanel.makefileReader.deleteValuesInVariable(
              CubeMxAdapterPanel.makefileReader.cSourceMakeVar,
              text.split(",")
            );
            this.sendAllVariablesToUi();
            return;

          case "cppSrcFiles_clickDeleteButton":
            CubeMxAdapterPanel.makefileReader.deleteValuesInVariable(
              CubeMxAdapterPanel.makefileReader.cppSourceMakeVar,
              text.split(",")
            );
            this.sendAllVariablesToUi();
            return;

          case "incFolders_clickDeleteButton":
            CubeMxAdapterPanel.makefileReader.deleteValuesInVariable(
              CubeMxAdapterPanel.makefileReader.cIncludeMakeVar,
              text.split(",")
            );
            this.sendAllVariablesToUi();
            return;

          case "defines_clickDeleteButton":
            CubeMxAdapterPanel.makefileReader.deleteValuesInVariable(
              CubeMxAdapterPanel.makefileReader.cDefineMakeVar,
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
          CubeMxAdapterPanel.mainConfigJson.setCompilerPath(newPath);
        }
        else if (title === "Openocd path") {
          CubeMxAdapterPanel.mainConfigJson.setOpenocdPath(newPath);
        }
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private openCSourceDialog() {
    let _makefileReader = CubeMxAdapterPanel.makefileReader;
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

        let existList = _makefileReader.getVariableList(_makefileReader.cSourceMakeVar);
        list = this.exeptCompareItems(existList, list);
        if(list.length !== 0) {
          this.sendMsgAddPaths("cSrcFiles_addNewLines", list);
          _makefileReader.addValuesInVariable(_makefileReader.cSourceMakeVar, list);
        }
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private openCppSourceDialog() {
    let _makefileReader = CubeMxAdapterPanel.makefileReader;
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

        if(_makefileReader.checkExistVariable(_makefileReader.cppSourceMakeVar)) {
          let existList = _makefileReader.getVariableList(_makefileReader.cppSourceMakeVar);
          list = this.exeptCompareItems(existList, list);
          if(list.length !== 0) {
            this.sendMsgAddPaths("cppSrcFiles_addNewLines", list);
            _makefileReader.addValuesInVariable(_makefileReader.cppSourceMakeVar, list);
          }
        }        
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private openHeaderDialog() {
    let _makefileReader = CubeMxAdapterPanel.makefileReader;
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

        let existList = _makefileReader.getVariableList(_makefileReader.cIncludeMakeVar);
        existList = existList.map((value) => value.replace(/-I/g, ''));
        list = this.exeptCompareItems(existList, list);
        if(list.length !== 0) {
          this.sendMsgAddPaths("incFolders_addNewLines", list);
          _makefileReader.addValuesInVariableWithPrefix(_makefileReader.cIncludeMakeVar, "-I", list);
          // TODO Add into c/cpp prop
        }
      }
    });
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private adaptForVSC() {
    CubeMxAdapterPanel.makefileReader.activateSilentMode();
    CubeMxAdapterPanel.makefileReader.activateEchoForCompilation();
    CubeMxAdapterPanel.cCppPropReader.InitNewConfiguration();
    CubeMxAdapterPanel.debugLaunchReader.InitNewConfiguration();
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private adaptForCpp() {
    let _makefileReader = CubeMxAdapterPanel.makefileReader;
    _makefileReader.addCppCompilerVar();
    _makefileReader.addNewVariableAfter(_makefileReader.cSourceMakeVar, _makefileReader.cppSourceMakeVar);
    _makefileReader.addCppCompilerFlags();
    _makefileReader.addCppObjectsVar();
    _makefileReader.addCppCompileTask();
    _makefileReader.changeLinker();
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
    let _makefileReader = CubeMxAdapterPanel.makefileReader;
    this.sendCmd("cSrcFiles_allClear");
    this.sendCmd("cppSrcFiles_allClear");
    this.sendCmd("incFolders_allClear");
    this.sendCmd("defines_allClear");
    this.sendMsgAddPaths("cSrcFiles_addNewLines", _makefileReader.getCSourcePaths());
    this.sendMsgAddPaths("cppSrcFiles_addNewLines", _makefileReader.getCppSourcePaths());
    this.sendMsgAddPaths("incFolders_addNewLines", _makefileReader.getIncludePaths());
    this.sendMsgAddPaths("defines_addNewLines", _makefileReader.getDefines());

    this.sendMsg("toolChain_UpdatePaths", 
                JSON.stringify({ compilerPath: CubeMxAdapterPanel.mainConfigJson.getCompilerPath(), 
                                openocdPath: CubeMxAdapterPanel.mainConfigJson.getOpenocdPath()}));
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
