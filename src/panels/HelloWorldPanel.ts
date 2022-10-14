/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import { getUri } from "../utilities/getUri";
import * as path from 'path';
import {MakefileReader} from '../app/MakefileReader';

/**
 * This class manages the state and behavior of HelloWorld webview panels.
 *
 * It contains all the data and methods for:
 *
 * - Creating and rendering HelloWorld webview panels
 * - Properly cleaning up and disposing of webview resources when the panel is closed
 * - Setting the HTML (and by proxy CSS/JavaScript) content of the webview panel
 * - Setting message listeners so data can be passed between the webview and extension
 */
export class HelloWorldPanel {
  public static currentPanel: HelloWorldPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private makefileReader : MakefileReader;

  private workspacePath : string = '';

  /**
   * The HelloWorldPanel class private constructor (called only from the render method).
   *
   * @param panel A reference to the webview panel
   * @param extensionUri The URI of the directory containing the extension
   */
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

  /**
   * Renders the current webview panel if it exists otherwise a new webview panel
   * will be created and displayed.
   *
   * @param extensionUri The URI of the directory containing the extension.
   */
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

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
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

  /**
   * Defines and returns the HTML that should be rendered within the webview panel.
   *
   * @remarks This is also the place where references to the Angular webview build files
   * are created and inserted into the webview HTML.
   *
   * @param webview A reference to the extension webview
   * @param extensionUri The URI of the directory containing the extension
   * @returns A template string literal containing the HTML that should be
   * rendered within the webview panel
   */
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

  /**
   * Sets up an event listener to listen for messages passed from the webview context and
   * executes code based on the message that is recieved.
   *
   * @param webview A reference to the extension webview
   * @param context A reference to the extension context
   */
  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const command = message.command;
        const text = message.text;

        switch (command) {
          case "cSrcAddBattonClick":
            this.openCSourceDialog();
            return;
          
          case "cppSrcAddBattonClick":
            this.openCppSourceDialog();
            return;

          case "headerAddBattonClick":
            this.openHeaderDialog();
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
          this.sendMsgAddPath("addNewCSrcLine", newRelativePath);
          list.push(newRelativePath);
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
        for(let i = 0; i < value.length; i++) {
          this.sendMsgAddPath("addNewCppSrcLine", value[i].path);
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
        for(let i = 0; i < value.length; i++) {
          this.sendMsgAddPath("addNewHeaderFolderLine", value[i].path);
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
    let cSrcList = this.makefileReader.getCSourcePaths();
    let cppSrcList = this.makefileReader.getCppSourcePaths();
    let cIncList = this.makefileReader.getIncludePaths();

    cSrcList.forEach(element => {
      this.sendMsgAddPath("addNewCSrcLine", element);
    });

    cppSrcList.forEach(element => {
      this.sendMsgAddPath("addNewCppSrcLine", element);
    });

    cIncList.forEach(element => {
      this.sendMsgAddPath("addNewHeaderFolderLine", element);
    });
  }
}
