import * as vscode from "vscode";
import * as fs from 'fs';
import {MakefileReader} from './MakefileReader';
import * as path from 'path';
import { CubeMxAdapterPanel } from "../../panels/MainPanel/CubeMxAdapterPanel";


interface cCppProp {
    name?: string;
    includePath ?: string[];
    defines ?: string[];
    compilerPath ?: string;
    cStandard ?: string;
    cppStandard ?: string;
    intelliSenseMode ?: string;
}

export class cCppPropertiesReader {
    public filePath : string = '';
    private _makefileReader : MakefileReader;
    private _configName : string = "CubeMXAdapter";

    private configurationTemplate : cCppProp = {
        name : this._configName,
        includePath : [],
        defines : [],
        cStandard : "c17",
        cppStandard : "c++17",
        intelliSenseMode : "gcc-arm",
        compilerPath : CubeMxAdapterPanel.mainConfigJson.getCompilerPath() + "/arm-none-eabi-gcc.exe",
    };

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    constructor(pathFile : string, makefileReader : MakefileReader) {
        this.filePath = pathFile;
        this._makefileReader = makefileReader;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public InitNewConfiguration() {
        let readedData : string;
        let toWriteData : string;

        /* Check exist c_cpp_properties.json file */
        if(!fs.existsSync(this.filePath)) {
            /* Create of the directory ".vscode" if not exsist it */
            if(!fs.existsSync(path.dirname(this.filePath))) {
                fs.mkdirSync(path.dirname(this.filePath));
            }

            /* Create new c_cpp_prop file */
            toWriteData = JSON.stringify({configurations : [ this.configurationTemplate ], version : 4}, null, 2)
            fs.writeFileSync(this.filePath, toWriteData, "utf-8");
            this.updateConfigFromMakefile();
        }
        else {
            readedData = fs.readFileSync(this.filePath, "utf-8");
            let readedJsonObj = JSON.parse(readedData);

            /* Check exist configuration */
            if(!this.isConfigurationByName(readedJsonObj.configurations)) {
                readedJsonObj.configurations.push(this.configurationTemplate);
                toWriteData = JSON.stringify(readedJsonObj, null, 2)
                fs.writeFileSync(this.filePath, toWriteData, "utf-8");
            }
            this.updateConfigFromMakefile();
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public updateConfigFromMakefile() {
        if(fs.existsSync(this.filePath)) {
            let includes = this._makefileReader.getIncludePaths();
            let defines = this._makefileReader.getDefines();
            let readedJsonObj = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));

            const indConfig = this.getConfigIndex(readedJsonObj.configurations);
            readedJsonObj.configurations[indConfig].includePath = includes;
            readedJsonObj.configurations[indConfig].defines = defines;

            let toWriteData = JSON.stringify(readedJsonObj, null, 2)
            fs.writeFileSync(this.filePath, toWriteData, "utf-8");
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private isConfigurationByName(configurations : any[]) : boolean {
        for(let config of configurations) {
            if(config.name === this._configName) { return true; }
        }
        return false;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getConfigIndex(configurations : any[]) : number {
        let index = 0;
        for(let config of configurations) {
            if(config.name === this._configName) { return index; }
            index++;
        }
        return -1;
    }
}

