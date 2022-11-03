import { TextFile } from "./TextFile";

export class MakefileReader {
    public asmSourceMakeVar : string = "ASM_SOURCES";
    public cSourceMakeVar : string = "C_SOURCES";
    public cppSourceMakeVar : string = "CXX_SOURCES";
    public asmIncludeMakeVar : string = "AS_INCLUDES";
    public cIncludeMakeVar : string = "C_INCLUDES";
    public asmDefineMakeVar : string = "AS_DEFS";
    public cDefineMakeVar : string = "C_DEFS";
    public debugMakeVar : string = "DEBUG";
    public optimizationMakeVar : string = "OPT";

    public makefilePath : string = '';

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
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
            list[index] = value.replace(/^-I/g, '');
        });
        return list;
    }

    public getDefines(): string[] {
        let list: string[] = this.getVariableList(this.cDefineMakeVar);
        list.forEach((value, index, list) => {
            list[index] = value.replace(/^-D/g, '');
        });
        return list;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public getVariableList(varName : string) : string[] {
        let list : string[] = [];
        let file = new TextFile(this.makefilePath);
        let lineIndex = this.getInxFirstLineOfVariable(file, varName);
        if(lineIndex === -1) { return []; }
        let line = file.getLine(lineIndex-1).replace(/ |\r|\n/g, '');
        if(line[line.length-1] !== '\\') { return []; }

        while(true) {
            line = file.getLine(lineIndex++).replace(/ |\r|\n/g, '');
            let endFlag = (line[line.length-1] === '\\') ? false : true;
            line = line.replace(/\\/g, '');
            list.push(line);
            if(endFlag) { return list; }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addValuesInVariable(varName : string, values : string[]) {
        let file = new TextFile(this.makefilePath);
        let lineIndex = this.getInxLastLineOfVariable(file, varName);
        file.setLine(lineIndex, file.getLine(lineIndex).replace(/\r|\n/g, '') + ' \\');
        lineIndex++;

        values.forEach((value, index, array) => {
            if(index < (array.length - 1)) { file.addLine(lineIndex++, value + ' \\'); }
            else { file.addLine(lineIndex++, value); }
        });

        file.saveFile();
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addValuesInVariableWithPrefix(varName : string, prefix : string, values : string[]) {
        let file = new TextFile(this.makefilePath);
        let lineIndex = this.getInxLastLineOfVariable(file, varName);
        file.setLine(lineIndex, file.getLine(lineIndex).replace(/\r|\n/g, '') + ' \\');
        lineIndex++;

        values.forEach((value, index, array) => {
            value = prefix + value;
            if(index < (array.length - 1)) { file.addLine(lineIndex++, value + ' \\'); }
            else { file.addLine(lineIndex++, value); }
        });
        file.saveFile();
        return;
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public deleteValuesInVariable(varName : string, values : string[]) {
        let file = new TextFile(this.makefilePath);
        let lineIndex = this.getInxFirstLineOfVariable(file, varName);

        while(true) {
            let line = file.getLine(lineIndex++).replace(/\s|\r|\n|^-I|^-D/g, '');
            let endFlag = (line[line.length-1].match(/\\$/) !== null) ? false : true;
            line = line.replace(/\\/g, '');
            for(let str of values) {
                if(line === str) {
                    file.deleteLine(--lineIndex);
                    if(endFlag) {
                        file.setLine(lineIndex-1, file.getLine(lineIndex-1).replace(/\\/g, ''));
                    }
                }
            }
            if(endFlag) {
                file.saveFile();
                return;
            }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getInxFirstLineOfVariable(openedFile : TextFile, varName : string) : number {
        const re = new RegExp("^" + varName + "\\s*=", 'g');
        let index = openedFile.findLine(re, 1) + 1;
        if(index === 0) { return -1; }
        else { return  index; }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    private getInxLastLineOfVariable(openedFile : TextFile, varName : string) : number {
        const re = new RegExp("^" + varName + "\\s*=", 'g');
        let index = openedFile.findLine(re, 1);
        if(index === -1) { return -1; }

        while(true) {
            let line = openedFile.getLine(index++).replace(/\s|\r|\n/g, '');
            if(line[line.length-1].match(/\\$/) === null) { return index - 1; }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public checkExistVariable(varName : string) : boolean {
        let file = new TextFile(this.makefilePath);
        if(this.getInxFirstLineOfVariable(file, varName) !== -1) { return true; }
        else { return false; }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public getVariableListFromFile(file : TextFile, varName : string) : string[] {
        let list : string[] = [];
        const re = new RegExp("^" + varName + "\\s*=", 'g');
        let lineIndex = file.findLine(re, 1) + 1;
        if(lineIndex === 0) { return list; }

        while(true) {
            let line = file.getLine(lineIndex++).replace(/ |\r|\n/g, '');
            let endFlag = (line[line.length-1].match(/\\$/) !== null) ? false : true;
            line = line.replace(/\\/g, '');
            list.push(line);
            if(endFlag) { return list; }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addNewVariableAfter(afterVar : string, newVar : string) {
        let file = new TextFile(this.makefilePath);
        let indexVar = this.getInxFirstLineOfVariable(file, newVar);
        if(indexVar === -1) {
            let lineIndex = this.getInxLastLineOfVariable(file, afterVar) + 1;
            file.addLines(lineIndex, ["", "", newVar + " ="]);
            file.saveFile();
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public activateSilentMode() {
        let file = new TextFile(this.makefilePath);
        let indexAllMark = file.findLine(/^.SILENT:/g, 1);
        if(indexAllMark === -1) {
            indexAllMark = file.findLine(/^all:/g, 1);
            file.addLine(indexAllMark, ".SILENT:");
            file.saveFile();
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public activateEchoForCompilation() {
        let file = new TextFile(this.makefilePath);
        let index = file.findLine(/\$\(CC\)\s-c/g, 1);
        if(index !== -1) {
            if(file.getLine(index+1).match(/^\t@echo \$\(CC\): \$</) === null) {
                file.addLine(index+1, "\t@echo $(CC): $<");
                file.saveFile();
            }
        }

        index = file.findLine(/\$\(AS\)\s-c/g, 1);
        if(index !== -1) {
            if(file.getLine(index+1).match(/^\t@echo \$\(AS\): \$</) === null) {            
                file.addLine(index+1, "\t@echo $(AS): $<");
                file.saveFile();
            }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addCppCompilerVar() {
        let file = new TextFile(this.makefilePath);
        let index = file.findLine(/^CC\s*=/g, 1);
        if(index !== -1) {
            if(file.findLine(/CXX = \$\(GCC_PATH\)\/\$\(PREFIX\)g\+\+/g, 1) === -1) {
                file.addLine(index+1, "CXX = $(GCC_PATH)/$(PREFIX)g++");
                file.saveFile();
            }
        }
        index = file.findLine(/^CC\s*=/g, index+1);
        if(index !== -1) {
            if(file.findLine(/CXX = \$\(PREFIX\)g\+\+/g, 1) === -1) {
                file.addLine(index+1, "CXX = $(PREFIX)g++");
                file.saveFile();
            }
        }        
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addCppCompilerFlags() {
        let file = new TextFile(this.makefilePath);
        let index = file.findLine(/^ASFLAGS\s*=/g, 1);
        if(index !== -1) {
            let check = file.findLine(/^CXXFLAGS\s*=/g, 1);
            if(check === -1) {
                file.addLines(index+1, [
                    "",
                    "CXXFLAGS = $(MCU) $(C_DEFS) $(C_INCLUDES) $(OPT) -Wall -fdata-sections -ffunction-sections",
                    "ifeq ($(DEBUG), 1)",
                    "CXXFLAGS += -g -gdwarf-2",
                    "endif",
                    "CXXFLAGS += -MMD -MP -MF\"$(@:%.o=%.d)\"",
                    ""
                ]);
                file.saveFile();
            }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addCppObjectsVar() {
        let file = new TextFile(this.makefilePath);
        let index = file.findLine(/^vpath %.c/g, 1)+1;

        if(index !== -1) {
            if(file.findLine(/^vpath %.cpp/g, 1) === -1) {
                file.addLines(index, [
                    "OBJECTS += $(addprefix $(BUILD_DIR)/,$(notdir $(CXX_SOURCES:.cpp=.o)))",
                    "vpath %.cpp $(sort $(dir $(CXX_SOURCES)))"
                ]);
                file.saveFile();
            }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public addCppCompileTask() {
        let file = new TextFile(this.makefilePath);
        let index = file.findLine(/\$\(BUILD_DIR\)\/%.o: %.s/g, 1);
        if(index !== -1) {
            if(file.findLine(/\$\(BUILD_DIR\)\/%.o: %.cpp/g, 1) === - 1) {
                file.addLines(index, [
                    "$(BUILD_DIR)/%.o: %.cpp Makefile | $(BUILD_DIR)",
                    "\t$(CXX) -c $(CFLAGS) -Wa,-a,-ad,-alms=$(BUILD_DIR)/$(notdir $(<:.cpp=.lst)) $< -o $@",
                    "\t@echo $(CXX): $<",
                    ""
                ]);
                file.saveFile();
            }
        }
    }

    //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
    public changeLinker() {
        let file = new TextFile(this.makefilePath);
        let index = file.findLine(/^\$\(BUILD_DIR\)\/\$\(TARGET\)\.elf:/g, 1);
        if(index !== -1) {
            index++;
            file.setLine(index, file.getLine(index).replace(/\$\(CC\)/, '$(CXX)'));
            file.saveFile();
        }
    }    
};
