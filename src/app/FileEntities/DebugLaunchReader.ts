import * as vscode from "vscode";
import * as fs from 'fs';
import {MakefileReader} from './MakefileReader';
import * as path from 'path';


interface LaunchJson {
    name ?: string;
    type ?: string;
    request ?: string;
    cwd ?: string;
    servertype ?: string;
    executable ?: string;
    svdFile ?: string;
    configFiles ?: string[];
    preLaunchTask ?: string;
}

export class DebugLaunchReader {
    public filePath : string = '';
    private _makefileReader : MakefileReader;
    private _configName : string = "CubeMXAdapter";
    private _executableFile : string = "";
    private _svdFile : string = "";
    private _openocdTarget : string = "";

    private configurationTemplate : LaunchJson = {
        name : this._configName,
        type : "cortex-debug",
        request : "launch",
        cwd : "${workspaceRoot}",
        servertype : "openocd",
        executable : this._executableFile,
        svdFile : this._svdFile,
        configFiles : [
            "interface/stlink.cfg",
            "target/stm32f1x.cfg"
        ],
        preLaunchTask : "Load",
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

        /* Check exist launch.json file */
        if(!fs.existsSync(this.filePath)) {
            /* Create of the directory ".vscode" if not exsist it */
            if(!fs.existsSync(path.dirname(this.filePath))) {
                fs.mkdirSync(path.dirname(this.filePath));
            }

            /* Create new launch file */
            toWriteData = JSON.stringify({configurations : [ this.configurationTemplate ], version : "0.2.0"}, null, 2);
            fs.writeFileSync(this.filePath, toWriteData, "utf-8");
            this.updateConfigFromMakefile();
        }
        else {
            readedData = fs.readFileSync(this.filePath, "utf-8");
            let readedJsonObj = JSON.parse(readedData);

            /* Check exist configuration */
            if(!this.isConfigurationByName(readedJsonObj.configurations)) {
                readedJsonObj.configurations.push(this.configurationTemplate);
                toWriteData = JSON.stringify(readedJsonObj, null, 2);
                fs.writeFileSync(this.filePath, toWriteData, "utf-8");
            }
            this.updateConfigFromMakefile();
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public updateConfigFromMakefile() {
        if(fs.existsSync(this.filePath)) {
            let projetName = this._makefileReader.getVariableSingle("TARGET");
            let duildDir = this._makefileReader.getVariableSingle("BUILD_DIR");
            
            let readedJsonObj = JSON.parse(fs.readFileSync(this.filePath, "utf-8"));

            const indConfig = this.getConfigIndex(readedJsonObj.configurations);
            readedJsonObj.configurations[indConfig].executable = "./" + duildDir + "/" + projetName + ".elf";
            //readedJsonObj.configurations[indConfig].defines = defines;

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

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//


}