import {TextFile} from './TextFile';

export class MakefileReader {
    public asmSourceMakeVar : string = "ASM_SOURCES";
    public cSourceMakeVar : string = "C_SOURCES";
    public cppSourceMakeVar : string = "CPP_SOURCES";
    public asmIncludeMakeVar : string = "AS_INCLUDES";
    public cIncludeMakeVar : string = "C_INCLUDES";
    public asmDefineMakeVar : string = "AS_DEFS";
    public cDefineMakeVar : string = "C_DEFS";
    public debugMakeVar : string = "DEBUG";
    public optimizationMakeVar : string = "OPT";

    public makefilePath : string = '';
    public file : TextFile;

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    constructor(pathFile : string) {
        this.makefilePath = pathFile;

        //let file = new TextFile(this.makefilePath);
    }

    /* Getter block */
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public getCSourcePaths() : string[] {
        return this.getVariableList(this.cSourceMakeVar);
    }

    public getCppSourcePaths() : string[] {
        return this.getVariableList(this.cppSourceMakeVar);
    }

    public getIncludePaths() : string[] {
        let list : string[] = this.getVariableList(this.cIncludeMakeVar);
        list.forEach((value, index, list) => {
            list[index] = value.replace('-I', '');
        });
        return list;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getVariableList(varName : string) : string[] {
        let list : string[] = [];
        let file = new TextFile(this.makefilePath);
        const re = new RegExp(varName + ' {0,10}=');
        let variable = file.findLine(re, 1) + 1;
        if(variable === 0) { return list; }

        while(true) {
            let line = file.getLine(variable++).replace(/ |\r|\n/g, '');
            let endFlag = (line[line.length-1] === '\\') ? false : true;
            line = line.replace(/\\/g, '');
            list.push(line);
            if(endFlag) {return list;}
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addValuesInVariable(varName : string, values : string[]) {
        let file = new TextFile(this.makefilePath);
        const re = new RegExp(varName + '.{0,2}=');
        let variable = file.findLine(re, 1) + 1;
        if(variable === 0) { return; }

        while(true) {
            let line = file.getLine(variable++).replace(/ |\r|\n/g, '');
            if(line[line.length-1] !== '\\') { 
                file.setLine(variable-1, line + ' \\');
                break;
            }
        }

        values.forEach((value, index, array) => {
            if(index < (array.length - 1)) { file.addLine(variable++, value + ' \\'); }
            else { file.addLine(variable++, value); }
        });

        file.saveFile();
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public deleteValuesInVariable(varName : string, values : string[]) {
        let file = new TextFile(this.makefilePath);
        const re = new RegExp(varName + '.{0,2}=');
        let variable = file.findLine(re, 1) + 1;
        if(variable === 0) { return; }

        while(true) {
            let line = file.getLine(variable++).replace(/ |\r|\n/g, '');
            let endFlag = (line[line.length-1] === '\\') ? false : true;
            line = line.replace(/\\/g, '');

            for(let str of values) {
                if(line === str) { file.deleteLine(--variable); }
            }
            
            if(endFlag) {return;}
        }
    }
};


