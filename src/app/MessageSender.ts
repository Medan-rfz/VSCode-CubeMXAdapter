import * as vscode from "vscode";
import {CubeMxAdapterPanel} from "../panels/MainPanel/CubeMxAdapterPanel";

export class MessageSender {

    private static _webview : vscode.Webview | undefined = undefined;

    public static setWebview(webview : vscode.Webview) {
        MessageSender._webview = webview;
    }
    
    public static sendCmd(cmd: string) {
        if(MessageSender._webview) {
            MessageSender._webview.postMessage({command: cmd, text: ""});
        }
    }

    public static sendMsg(cmd: string, msg: string) {
        if(MessageSender._webview) {
            MessageSender._webview.postMessage({command: cmd, text: msg});
        }
    }

    public static sendMsgAddPaths(cmd : string, paths : string[]) {
        if(MessageSender._webview && paths.length !== 0) {
            MessageSender._webview.postMessage({command: cmd, text: paths.toString()});
        }
    }

}

