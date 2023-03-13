import * as https from 'https';
import * as fs from 'fs';

const gitLabRepoURL = "https://gitlab.com/api/v4/projects/40418378/repository/tree?ref=master&per_page=100&page=${nbrPage}";
const gitLabSvdFilesURL = "https://gitlab.com/api/v4/projects/40418378/repository/files/${svd}/raw?ref=master";

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export async function getListOfSvdFiles() : Promise<string[]> {
    let filesList : string[] = [];
    let tmpBuf : string[] = [];
    let nbrPage = 1;

    do {
        tmpBuf = await getPageOfSvdFiles(nbrPage++);
        filesList.push(...tmpBuf);
    } while(tmpBuf.length !== 0);

    return filesList;
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
async function getPageOfSvdFiles(nbrPage : number) : Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
        let responceData : any = [];
        let filesList : string[] = [];
        https.get(gitLabRepoURL.replace("${nbrPage}", nbrPage.toString()), res => {
            res.on('data', chunk => {
                responceData.push(chunk);
            });

            res.on('end', () => {
                let data  = JSON.parse(Buffer.concat(responceData).toString());
                data.forEach((value : any) => {
                    filesList.push(value.name);
                });
                resolve(filesList);
            });
        });
    });
}

//=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=//
export function downloadSvdFile(workspacePath : string, svdFile : string) {
    let getData : any = [];
    https.get(gitLabSvdFilesURL.replace("${svd}", svdFile), res => {
        res.on('data', chunk => {
            getData.push(chunk);
        });

        res.on('end', () => {
            let data : string = Buffer.concat(getData).toString();
            fs.writeFileSync(workspacePath + "/" + svdFile, data, 'utf-8');
        });
    });
}

