import * as vscode from "vscode";

export class EventListener {
    private _handlers = new Map<string, ((text: string) => void)>();
    private _webview: vscode.Webview;

    constructor(webview : vscode.Webview) {
        this._webview =webview;
    }

    public addHandler(cmd: string, func: ((text: string) => void)) {
        this._handlers.set(cmd, func);
    }

    public setWebviewMsgListener() {
        this._webview.onDidReceiveMessage((message: any) => {
            const command : string = message.command;
            const text : string = message.text;
            let handler = this._handlers.get(command);
            if(handler !== undefined) {
                handler(text);
            }
        });
    }
} 

