import * as fs from 'fs';

export class TextFile {
    private filePath : string = '';
    private lines : string[] = [];


    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    constructor(path : string) {
        this.filePath = path;
        // TODO Check exsist file
        this.readFile();
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public getLine(lineNumber : number) : string {
        if(lineNumber <= this.lines.length) {
            return this.lines[lineNumber - 1];
        } else {
            return '';
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public setLine(lineNumber : number, newData : string) {
        if(lineNumber <= this.lines.length) {
            this.lines[lineNumber - 1] = newData;
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addLine(lineNumber : number, newLine : string) {
        if(lineNumber <= this.lines.length) {
            this.lines.splice(lineNumber - 1, 0, newLine);
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public findLine(data : string | RegExp, begin : number) : number {
        if((begin <= 0) || (begin > this.lines.length)) {
            return -1;
        }
        for(let i = begin - 1; i < this.lines.length; i++) {
            if(this.lines[i].search(/C_SOURCES/) !== -1) {
                return i + 1;
            }
        }
        return -1;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public readFile() {
        let data = fs.readFileSync(this.filePath, "utf-8");
        this.lines = data.toString().split("\n");
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public saveFile() {
        let data : string = "";

        this.lines.forEach(element => {
            data += element + "\n";
        });

        fs.writeFileSync(this.filePath, data, 'utf-8');
    }
}