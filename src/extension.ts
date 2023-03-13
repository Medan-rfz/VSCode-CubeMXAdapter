import { commands, ExtensionContext } from "vscode";
import { CubeMxAdapterPanel } from "./panels/MainPanel/CubeMxAdapterPanel";

export function activate(context: ExtensionContext) {
  const showCubeMxAdapterCommand = commands.registerCommand("CubeMXadapter.showCubeMxAdapter", () => {
    CubeMxAdapterPanel.render(context.extensionUri);
  });

  // Add command to the extension context
  context.subscriptions.push(showCubeMxAdapterCommand);
}
