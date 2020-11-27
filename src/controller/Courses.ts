import {Course} from "./Course";
import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import * as JSZip from "jszip";
import {JSZipObject} from "jszip";

export class Courses {
    public id: string;
    public kind: InsightDatasetKind;
    public numRows: number;
    public courseCollection: Course[];

    constructor() {
        this.id = null;
        this.kind = null;
        this.numRows = 0;
        this.courseCollection = [];
}

    public addCourses(id: string, content: string, obj: any): Promise<string[]> {
        let current = this;
        return new Promise(function (resolve1, reject) {
            try {
                let allContents: any = [];
                JSZip.loadAsync(content, {base64: true}).then(function (zip1: JSZip) {
                    zip1.forEach(function (relativePath: string, file: JSZipObject) {
                        if (file.dir !== true) {
                            let originFolder: any[] = relativePath.split("/");
                            if (originFolder[0] !== "courses") {
                                reject(new InsightError());
                            }
                            try {
                                allContents.push(file.async("string"));
                            } catch (e) {
                                throw(new InsightError());
                            }
                        }
                    });
                    Promise.all(allContents).then(function (array) {
                        let curr: Course[] = [];
                        try {
                            curr = obj.readFiles(array);
                            if (curr.length === 0) {
                                reject(new InsightError());
                            }
                        } catch (e) {
                            reject(new InsightError());
                        }
                        let idGather = obj.loadCoursesToDisk(id, curr);
                        resolve1(idGather);
                    });
                }).catch(function () {
                    reject(new InsightError());
                });
            } catch (e) {
                return reject(new InsightError());
            }
        });
    }
}
