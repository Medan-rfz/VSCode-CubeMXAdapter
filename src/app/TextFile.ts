import * as fs from 'fs';

export class TextFile {
    private filePath : string = '';
    public lines : string[] = [];

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    constructor(path : string) {
        this.filePath = path;
        this.readFile();
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public getLine(lineNumber : number) : string {
        if((lineNumber <= 0) || (lineNumber > this.lines.length)) { return ''; }
        return this.lines[lineNumber - 1];
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public setLine(lineNumber : number, newData : string) {
        if((lineNumber <= 0) || (lineNumber > this.lines.length)) { return; }
        if(lineNumber <= this.lines.length) {
            this.lines[lineNumber - 1] = newData;
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addLine(lineNumber : number, newLine : string) {
        if((lineNumber <= 0) || (lineNumber > this.lines.length)) { return; }
        if(lineNumber <= this.lines.length) {
            this.lines.splice(lineNumber - 1, 0, newLine);
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addLines(lineNumber : number, newLines : string[]) {
        if((lineNumber <= 0) || (lineNumber > this.lines.length)) { return; }
        if(lineNumber <= this.lines.length) {
            lineNumber--;
            for(let line of newLines) {
                this.lines.splice(lineNumber++, 0, line);
            }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public deleteLine(lineNumber : number) {
        if((lineNumber <= 0) || (lineNumber > this.lines.length)) { return; }
        this.lines.splice(lineNumber-1, 1);
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public findLine(data : string | RegExp, begin : number) : number {
        if((begin <= 0) || (begin > this.lines.length)) { return -1; }
        for(let i = begin - 1; i < this.lines.length; i++) {
            if(this.lines[i].search(data) !== -1) {
                return i + 1;
            }
        }
        return -1;
    }
    
    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public findAllLines(data : string | RegExp) : number[] {
        let res : number[] = [];
        let index = 1;

        while(true) {
            index = this.findLine(data, index);
            if(index === -1) { break; }
            res.push(index++);
        }
        return res;
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