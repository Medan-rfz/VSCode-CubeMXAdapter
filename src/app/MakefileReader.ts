import * as fs from 'fs';
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
    //public file : TextFile; // TODO


    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    constructor(pathFile : string) {
        this.makefilePath = pathFile;
        //this.file = new TextFile(pathFile); // TODO
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
        let makefile : string = fs.readFileSync(this.makefilePath, 'utf-8');
        let indVar = makefile.indexOf(varName, 0);
        if(indVar === -1) {
            return list;
        }
        
        indVar = this.getIndexBeginNextLine(makefile, indVar);

        while(true) {
            let line = this.getLine(makefile, indVar);
            indVar += line.length;
            let path : string = line.replace(/ /g, '');
            path = path.replace(/\\/g, '');
            path = path.replace(/\r\n/g, '');
            list.push(path);
            
            if(line.substring(line.length - 3) !== '\\\r\n') {
                break;
            }            
        }

        return list;
    }
    
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addValuesInVariable(varName : string, values : string[]) {
        let makefile : string = fs.readFileSync(this.makefilePath, 'utf-8');
        let indVar = this.getBeginLastLineFromStr(makefile, varName);
        if(indVar === -1) {
            return -1;
        } 

        const endLine = this.getLine(makefile, indVar);
        let newLines = endLine.replace(/\r\n/g, '\\\r\n');

        values.forEach((newLine, index, array) => {
            if(index !== (values.length - 1)) {
                newLines += newLine + ' \\\r\n';
            }
            else {
                newLines += newLine + ' \r\n';
            }
        });

        makefile = makefile.replace(endLine, newLines);
        fs.writeFileSync(this.makefilePath, makefile, 'utf-8');
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public deleteValuesInVariable(varName : string, values : string[]) {
        let makefile : string = fs.readFileSync(this.makefilePath, 'utf-8');
        let indVar = makefile.indexOf(varName, 0);
        if(indVar === -1) {
            return -1;
        }

        indVar = this.getIndexBeginLine(makefile, 1111);

        //indVar = this.getIndexBeginNextLine(makefile, indVar);

        //makefile = this.deleteLine(makefile, indVar);
        //fs.writeFileSync(this.makefilePath, makefile, 'utf-8');

        // values.forEach((newLine, index, array) => {

        
        // });
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getBeginLastLine(varName : string) : number {
        let makefile : string = fs.readFileSync(this.makefilePath, 'utf-8');
        let indVar = makefile.indexOf(varName, 0);
        if(indVar === -1) {
            return -1;
        }
        
        while(true) {
            let line = this.getLine(makefile, indVar);
            
            if(line.substring(line.length - 3) !== '\\\r\n') {
                return indVar;
            }

            indVar += line.length;
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getBeginLastLineFromStr(makefile : string, varName : string) : number {
        let indVar = makefile.indexOf(varName, 0);
        if(indVar === -1) {
            return -1;
        }
        
        while(true) {
            let line = this.getLine(makefile, indVar);
            
            if(line.substring(line.length - 3) !== '\\\r\n') {
                return indVar;
            }

            indVar += line.length;
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private writeSubstringInFile(substring : string, index : number) {
        let file : string = fs.readFileSync(this.makefilePath, 'utf-8');
        file = this.insertSubstring(file, substring, index);
        fs.writeFileSync(this.makefilePath, file, 'utf-8');
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private insertSubstring(str : string, subString : string, begin : number) : string {
        return str.slice(0,begin) + subString + str.slice(begin);
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private deleteSubstring(str : string, subString : string, begin : number) : string {
        return str.replace(subString, '');
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getIndexBeginLine(str : string, index : number) : number {
        let beginInd = index;
        while(beginInd >= 0) {
            if(str[beginInd--] === '\n') {
                return beginInd + 1;
            }
        };
        return -1;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getIndexBeginNextLine(str : string, index : number) : number {
        return str.indexOf('\n', index) + 1;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getLine(str : string, begin : number) : string {
        let end = this.getIndexBeginNextLine(str, begin);
        return str.substring(begin, end);
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private deleteLine(str : string, begin : number) : string {
        let end = this.getIndexBeginNextLine(str, begin);
        return str.slice(0,begin) + str.slice(end);
    }
};


