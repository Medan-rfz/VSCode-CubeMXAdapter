import { IVaribleViewer } from "../models/variableViewer";

export const variableViewers: IVaribleViewer[] = [
  {
    title: "C sources",
    description: "This section is responsible for connecting C source files to the current project",
    isButtonAdd: true,
    isButtonEdit: false,
    isButtonDelete: true,
    prefixCmd: "cSrcFiles",
    tabActive: true,
  },
  {
    title: "C++ sources",
    description: "This section is responsible for connecting C++ source files to the current project",
    isButtonAdd: true,
    isButtonEdit: false,
    isButtonDelete: true,
    prefixCmd: "cppSrcFiles",
    tabActive: false,
  },
  {
    title: "Headers",
    description: "This section is responsible for connecting the includ folders to the current project",
    isButtonAdd: true,
    isButtonEdit: false,
    isButtonDelete: true,
    prefixCmd: "incFolders",
    tabActive: false,
  },
  {
    title: "Defines",
    description: "This section is responsible for adding defines to the current project",
    isButtonAdd: true,
    isButtonEdit: false,
    isButtonDelete: true,
    prefixCmd: "defines",
    tabActive: false,
  },
];
