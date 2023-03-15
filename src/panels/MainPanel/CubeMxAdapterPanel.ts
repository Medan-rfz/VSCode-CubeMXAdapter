import * as vscode from "vscode";
import * as fs from 'fs';
import { getUri } from "../../utilities/getUri";
import {MakefileReader} from '../../app/FileEntities/MakefileReader';
import {cCppPropertiesReader} from '../../app/FileEntities/CCppProperties';
import {DebugLaunchReader} from '../../app/FileEntities/DebugLaunchReader';
import {TasksReader} from '../../app/FileEntities/TasksReader';
import {MainConfigJson} from '../../app/FileEntities/MainConfigJson';
import {EventListener} from '../../app/Events/EventListener';
import {MessageSender} from "../../app/MessageSender";
import * as eventHandlers from "../../app/Events/EventHandlers";
import { IDeviceInfo } from "../../app/IDeviceInfo";

export class CubeMxAdapterPanel {
  public static currentPanel: CubeMxAdapterPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];
  private eventListener : EventListener;
  public static workspacePath : string = '';
  public static devInfo: IDeviceInfo = {
    Name: "",
    Debugger: "",
    OpenocdCfg: "",
    debuggerCfg: "",
    svdFile: "",
  };

  public static makefileReader : MakefileReader;
  public static cCppPropReader : cCppPropertiesReader;
  public static debugLaunchReader : DebugLaunchReader;
  public static mainConfigJson : MainConfigJson;
  public static tasksReader : TasksReader;

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;
    this._panel.onDidDispose(this.dispose, null, this._disposables);
    this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

    MessageSender.setWebview(this._panel.webview);

    if (vscode.workspace.workspaceFolders !== undefined) {
      CubeMxAdapterPanel.workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }

    /* Check of existing makefile */
    if (!fs.existsSync(CubeMxAdapterPanel.workspacePath + "/Makefile")) {
      vscode.window.showErrorMessage("Makefile was not found!\n The directory does not meet the requirements of the project CubeMX!");
    }

    this.eventListener = new EventListener(this._panel.webview);
    this._setWebviewMessageListener();

    CubeMxAdapterPanel.mainConfigJson = new MainConfigJson();
    CubeMxAdapterPanel.makefileReader = new MakefileReader(CubeMxAdapterPanel.workspacePath + "/Makefile");
    CubeMxAdapterPanel.cCppPropReader = new cCppPropertiesReader(CubeMxAdapterPanel.workspacePath + "/.vscode/c_cpp_properties.json");
    CubeMxAdapterPanel.debugLaunchReader = new DebugLaunchReader(CubeMxAdapterPanel.workspacePath + "/.vscode/launch.json");
    CubeMxAdapterPanel.tasksReader = new TasksReader(CubeMxAdapterPanel.workspacePath + "/.vscode/tasks.json");
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
  private _setWebviewMessageListener() {
    this.eventListener.addHandler("adaptPrjForVSC", eventHandlers.adaptToVSC);
    this.eventListener.addHandler("adaptPrjForCpp", eventHandlers.adaptToCpp);
    this.eventListener.addHandler("toolChain_clickChangeCompilerPath", eventHandlers.toolchainChangeCompilerPath);
    this.eventListener.addHandler("toolChain_clickChangeOpenocdPath", eventHandlers.toolchainChangeOpenocdPath);
    this.eventListener.addHandler("cSrcFiles_clickAddButton", eventHandlers.addCSourceFiles);
    this.eventListener.addHandler("cppSrcFiles_clickAddButton", eventHandlers.addCppSourceFiles);
    this.eventListener.addHandler("incFolders_clickAddButton", eventHandlers.addHeaderFolders);
    this.eventListener.addHandler("defines_clickAddButton", eventHandlers.addDefine);
    this.eventListener.addHandler("cSrcFiles_clickDeleteButton", eventHandlers.deleteCSourceFile);
    this.eventListener.addHandler("cppSrcFiles_clickDeleteButton", eventHandlers.deleteCppSourceFile);
    this.eventListener.addHandler("incFolders_clickDeleteButton", eventHandlers.deleteHeaderFolders);
    this.eventListener.addHandler("defines_clickDeleteButton", eventHandlers.deleteDefines);
    this.eventListener.addHandler("svdFiles_clickLoadButton", eventHandlers.loadSVDFile);
    this.eventListener.addHandler("debugger_selectedUpdate", eventHandlers.writeUpdatedDebugger);
    this.eventListener.addHandler("getAllMakefileInformation", eventHandlers.sendAllVariablesToUi);
    this.eventListener.setWebviewMsgListener();
  }

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//


}
