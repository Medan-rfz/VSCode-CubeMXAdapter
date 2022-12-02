import * as vscode from "vscode";
import * as path from "path";
import {CubeMxAdapterPanel} from "../../panels/MainPanel/CubeMxAdapterPanel";
import {MessageSender} from "../../app/MessageSender";
import * as svdDownloader from "../../app/SvdDownloader";


//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function adaptToVSC(text: string) {
    CubeMxAdapterPanel.makefileReader.activateSilentMode();
    CubeMxAdapterPanel.makefileReader.activateEchoForCompilation();
    CubeMxAdapterPanel.cCppPropReader.InitNewConfiguration();
    CubeMxAdapterPanel.debugLaunchReader.InitNewConfiguration();
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function adaptToCpp(text: string) {
    let _makefileReader = CubeMxAdapterPanel.makefileReader;
    _makefileReader.addCppCompilerVar();
    _makefileReader.addNewVariableAfter(_makefileReader.cSourceMakeVar, _makefileReader.cppSourceMakeVar);
    _makefileReader.addCppCompilerFlags();
    _makefileReader.addCppObjectsVar();
    _makefileReader.addCppCompileTask();
    _makefileReader.changeLinker();
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function toolchainChangeCompilerPath(text: string) {
    const opt: vscode.OpenDialogOptions = {
        filters: {},
        canSelectMany: false,
        canSelectFiles: false,
        canSelectFolders: true,
        title: "Compiler path",
    };

    vscode.window.showOpenDialog(opt).then((value) => {
        if(value !== undefined) {
        let newPath = value[0].fsPath.replace(/\\/g, '/');
        MessageSender.sendMsg("toolChain_UpdateCompilerPath", newPath);
        CubeMxAdapterPanel.mainConfigJson.setCompilerPath(newPath);
        }
    });
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function toolchainChangeOpenocdPath(text: string) {
    const opt: vscode.OpenDialogOptions = {
        filters: {},
        canSelectMany: false,
        canSelectFiles: false,
        canSelectFolders: true,
        title: "Openocd path",
    };

    vscode.window.showOpenDialog(opt).then((value) => {
        if(value !== undefined) {
        let newPath = value[0].fsPath.replace(/\\/g, '/');
        MessageSender.sendMsg("toolChain_UpdateOpenocdPath", newPath);
        CubeMxAdapterPanel.mainConfigJson.setCompilerPath(newPath);
        }
    });
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function addCSourceFiles(text: string) {
	let _makefileReader = CubeMxAdapterPanel.makefileReader;
	const opt: vscode.OpenDialogOptions = {	filters: { "C Source": ["c"] }, canSelectMany: true, title: "Add C source files"};

	vscode.window.showOpenDialog(opt).then((value) => {
		if (value !== undefined) {
			let list: string[] = [];
			for (let i = 0; i < value.length; i++) {
				let newRelativePath = path
				.relative(CubeMxAdapterPanel.workspacePath, value[i].fsPath)
				.replace(/\\/g, "/");
				list.push(newRelativePath);
			}

			let existList = _makefileReader.getVariableList(_makefileReader.cSourceMakeVar);
			list = exeptCompareItems(existList, list);
			if(list.length !== 0) {
				MessageSender.sendMsgAddPaths("cSrcFiles_addNewLines", list);
				_makefileReader.addValuesInVariable(_makefileReader.cSourceMakeVar, list);
			}
		}
	});
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function addCppSourceFiles(text: string) {
	let _makefileReader = CubeMxAdapterPanel.makefileReader;
	const opt: vscode.OpenDialogOptions = {	filters: { "C++ Source": ["cpp"] }, canSelectMany: true, title: "Add C++ source files"};

	vscode.window.showOpenDialog(opt).then((value) => {
		if(value !== undefined) {
			let list : string[] = [];
			for(let i = 0; i < value.length; i++) {
				let newRelativePath = path.relative(CubeMxAdapterPanel.workspacePath, value[i].fsPath).replace(/\\/g, '/');
				list.push(newRelativePath);
			}

			if(_makefileReader.checkExistVariable(_makefileReader.cppSourceMakeVar)) {
				let existList = _makefileReader.getVariableList(_makefileReader.cppSourceMakeVar);
				list = exeptCompareItems(existList, list);
				if(list.length !== 0) {
				MessageSender.sendMsgAddPaths("cppSrcFiles_addNewLines", list);
				_makefileReader.addValuesInVariable(_makefileReader.cppSourceMakeVar, list);
				}
			}        
		}
	});
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function addHeaderFolders(text: string) {
	let _makefileReader = CubeMxAdapterPanel.makefileReader;
	const opt: vscode.OpenDialogOptions = {	filters: {}, canSelectMany: true, canSelectFiles: false,
											canSelectFolders: true, title: "Add header folder"};

	vscode.window.showOpenDialog(opt).then((value) => {
		if(value !== undefined) {
			let list : string[] = [];
			for(let i = 0; i < value.length; i++) {
				let newRelativePath = path.relative(CubeMxAdapterPanel.workspacePath, value[i].fsPath).replace(/\\/g, '/');

				list.push(newRelativePath);
			}

			let existList = _makefileReader.getVariableList(_makefileReader.cIncludeMakeVar);
			existList = existList.map((value) => value.replace(/-I/g, ''));
			list = exeptCompareItems(existList, list);
			if(list.length !== 0) {
				MessageSender.sendMsgAddPaths("incFolders_addNewLines", list);
				_makefileReader.addValuesInVariableWithPrefix(_makefileReader.cIncludeMakeVar, "-I", list);
				CubeMxAdapterPanel.cCppPropReader.updateConfigFromMakefile();
			}
		}
	});
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function addDefine(text: string) {
	let _makefileReader = CubeMxAdapterPanel.makefileReader;
	vscode.window.showInputBox().then((value) => {
		if(value !== undefined) {
			let list : string[] = [value];
			MessageSender.sendMsgAddPaths("defines_addNewLines", list);
			_makefileReader.addValuesInVariableWithPrefix(_makefileReader.cDefineMakeVar, "-D", list);
			CubeMxAdapterPanel.cCppPropReader.updateConfigFromMakefile();
		}
	});
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function deleteCSourceFile(text: string) {
	CubeMxAdapterPanel.makefileReader.deleteValuesInVariable(
		CubeMxAdapterPanel.makefileReader.cSourceMakeVar,
		text.split(",")
		);
	sendAllVariablesToUi(text);
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function deleteCppSourceFile(text: string) {
	CubeMxAdapterPanel.makefileReader.deleteValuesInVariable(
		CubeMxAdapterPanel.makefileReader.cppSourceMakeVar,
		text.split(",")
		);
	sendAllVariablesToUi(text);
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function deleteHeaderFolders(text: string) {
	CubeMxAdapterPanel.makefileReader.deleteValuesInVariable(
		CubeMxAdapterPanel.makefileReader.cIncludeMakeVar,
		text.split(",")
		);
	sendAllVariablesToUi(text);
	CubeMxAdapterPanel.cCppPropReader.updateConfigFromMakefile();
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function deleteDefines(text: string) {
	CubeMxAdapterPanel.makefileReader.deleteValuesInVariable(
		CubeMxAdapterPanel.makefileReader.cDefineMakeVar,
		text.split(",")
		);
	sendAllVariablesToUi(text);
	CubeMxAdapterPanel.cCppPropReader.updateConfigFromMakefile();
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function sendAllVariablesToUi(text: string) {
let _makefileReader = CubeMxAdapterPanel.makefileReader;
MessageSender.sendCmd("cSrcFiles_allClear");
MessageSender.sendCmd("cppSrcFiles_allClear");
MessageSender.sendCmd("incFolders_allClear");
MessageSender.sendCmd("defines_allClear");
MessageSender.sendMsgAddPaths("cSrcFiles_addNewLines", _makefileReader.getCSourcePaths());
MessageSender.sendMsgAddPaths("cppSrcFiles_addNewLines", _makefileReader.getCppSourcePaths());
MessageSender.sendMsgAddPaths("incFolders_addNewLines", _makefileReader.getIncludePaths());
MessageSender.sendMsgAddPaths("defines_addNewLines", _makefileReader.getDefines());

MessageSender.sendMsg("toolChain_UpdatePaths", 
			JSON.stringify({compilerPath: CubeMxAdapterPanel.mainConfigJson.getCompilerPath(), 
							openocdPath: CubeMxAdapterPanel.mainConfigJson.getOpenocdPath()}));
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function loadSVDFile(text: string) {
	svdDownloader.downloadSvdFile(CubeMxAdapterPanel.workspacePath, text);
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function updateSVDList(text: string) {
	svdDownloader.getListOfSvdFiles().then(svdList => {
		MessageSender.sendMsgAddPaths("svdFiles_UpdateList", svdList);
	});
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function sendSelectedDebugger(text: string) {
	MessageSender.sendMsg("debugger_UpdateSelected", "cmsis-dap");	// TODO
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function writeUpdatedDebugger(text: string) {
	// TODO
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
function exeptCompareItems(existList : string[], addedList : string[]) : string[] {
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







