import * as vscode from "vscode";
import * as fs from 'fs';
import {MakefileReader} from './MakefileReader';


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

    private configurationTemplate : cCppProp = {
        name : "CubeMXAdapter",
        includePath : [],
        defines : [],
        cStandard : "c17",
        cppStandard : "c++17",
        intelliSenseMode : "gcc-arm"    
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
            /* Create new c_cpp_prop file */
            toWriteData = JSON.stringify({configurations : [ this.configurationTemplate ], version : 4}, null, 2)
            fs.writeFileSync(this.filePath, toWriteData, "utf-8");
        }
        else {
            readedData = fs.readFileSync(this.filePath, "utf-8");
            let readedJsonObj = JSON.parse(readedData);

            /* Check exist configuration */
            if(!this.isConfigurationByName("CubeMXAdapterNew", readedJsonObj.configurations)) {
                readedJsonObj.configurations.push(this.configurationTemplate);
                toWriteData = JSON.stringify(readedJsonObj, null, 2)
                fs.writeFileSync(this.filePath, toWriteData, "utf-8");
            }

            /* Update configuration according to Makefile */
            this.updateConfigFromMakefile();

        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public updateConfigFromMakefile() {
        // TODO
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private isConfigurationByName(name : string, configurations : any[]) : boolean {
        for(let config of configurations) {
            if(config.name === name) { return true; }
        }
        return false;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    
}



