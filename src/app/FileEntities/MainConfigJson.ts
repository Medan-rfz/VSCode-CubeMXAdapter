import * as fs from 'fs';
import * as vscode from "vscode";

interface mainConfig {
    compilerPath: string;
    openocdPath: string;
}

export class MainConfigJson {

    private filePath : string = __dirname + "./../../Config.json";

    private configEntity : mainConfig = {
        compilerPath : "",
        openocdPath : "",
    };

    constructor() {
        /* Check exist of file */
        if(!fs.existsSync(this.filePath)) {
            let toWriteData = JSON.stringify({ config : this.configEntity }, null, 2);
            fs.writeFileSync(this.filePath, toWriteData, "utf-8");
        }
        else {
            let config = JSON.parse(fs.readFileSync(this.filePath, "utf-8")).config;
            this.configEntity.compilerPath = config.compilerPath;
            this.configEntity.openocdPath = config.openocdPath;
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public setCompilerPath(newPath: string) {
        this.configEntity.compilerPath = newPath;
        fs.writeFileSync(this.filePath, JSON.stringify({ config : this.configEntity }, null, 2), "utf-8");
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public setOpenocdPath(newPath: string) {
        this.configEntity.openocdPath = newPath;
        fs.writeFileSync(this.filePath, JSON.stringify({ config : this.configEntity }, null, 2), "utf-8");
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public getCompilerPath() : string {
        return this.configEntity.compilerPath;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public getOpenocdPath() : string {
        return this.configEntity.openocdPath;
    }
}




