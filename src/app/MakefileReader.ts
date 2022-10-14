import * as fs from 'fs';

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

    constructor(pathFile : string) {
        this.makefilePath = pathFile;
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
        
        indVar = this.getIndexEndLine(makefile, indVar);

        while(true) {
            let line = this.getStringLine(makefile, indVar);
            indVar += line.length;
            let path : string = line.replace(' ', '');
            path = path.replace('\\', '');
            path = path.replace('\r\n', '');
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
            return -1; // TODO Add return status
        } 

        const endLine = this.getStringLine(makefile, indVar);
        let newLines = endLine.replace('\r\n', '\\\r\n');

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
    private getBeginLastLine(varName : string) : number {
        let makefile : string = fs.readFileSync(this.makefilePath, 'utf-8');
        let indVar = makefile.indexOf(varName, 0);
        if(indVar === -1) {
            return -1; // TODO Add return status
        }
        
        while(true) {
            let line = this.getStringLine(makefile, indVar);
            
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
            return -1; // TODO Add return status
        }
        
        while(true) {
            let line = this.getStringLine(makefile, indVar);
            
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
        return (str.slice(0,begin) + subString + str.slice(begin));
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getIndexEndLine(str : string, begin : number) : number {
        return str.indexOf('\n', begin) + 1;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getStringLine(str : string, begin : number) : string {
        let end = this.getIndexEndLine(str, begin);
        return str.substring(begin, end);
    }
};


