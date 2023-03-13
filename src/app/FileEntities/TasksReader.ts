import * as fs from 'fs';
import * as path from 'path';

interface TaskJson {
    label ?: string;
    type ?: string;
    command ?: string;
    group ?: string;
}

export class TasksReader {
    public filePath : string = '';
    private _buildTaskName : string = "Build";
    private _uploadTaskName : string = "Upload";

    private _buildTaskTemplate : TaskJson = {
        label : this._buildTaskName,
        type : "shell",
        command : "make",
        group : "none"
    };

    private _uploadTaskTemplate : TaskJson = {
        label : this._uploadTaskName,
        type : "shell",
        command : "make flashload",
        group : "none"
    };

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    constructor(pathFile : string) {
        this.filePath = pathFile;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public InitNewTasks() {
        let readedData : string;
        let toWriteData : string;

        /* Check exist tasks.json file */
        if(!fs.existsSync(this.filePath)) {
            /* Create of the directory ".vscode" if not exsist it */
            if(!fs.existsSync(path.dirname(this.filePath))) {
                fs.mkdirSync(path.dirname(this.filePath));
            }
            /* Create new file */
            toWriteData = JSON.stringify({tasks : [ this._buildTaskTemplate, this._uploadTaskTemplate ], version : "2.0.0"}, null, 2);
            fs.writeFileSync(this.filePath, toWriteData, "utf-8");
        }
        else {
            readedData = fs.readFileSync(this.filePath, "utf-8");
            let readedJsonObj = JSON.parse(readedData);

            /* Check exist tasks by name */
            if(!this.isTaskExisting(readedJsonObj.tasks, this._buildTaskName)) {
                readedJsonObj.tasks.push(this._buildTaskTemplate);
                toWriteData = JSON.stringify(readedJsonObj, null, 2);
                fs.writeFileSync(this.filePath, toWriteData, "utf-8");
            }
            
            if(!this.isTaskExisting(readedJsonObj.tasks, this._uploadTaskName)) {
                readedJsonObj.tasks.push(this._uploadTaskTemplate);
                toWriteData = JSON.stringify(readedJsonObj, null, 2);
                fs.writeFileSync(this.filePath, toWriteData, "utf-8");
            }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private isTaskExisting(tasksArr : any[], taskName : string) : boolean {
        let res : boolean = false;
        tasksArr.forEach(element => {
            if(element.label === taskName) {
                res = true;
                return;
            }
        });
        return res;
    }  

}