import Log from "../Util";
import {IInsightFacade, InsightDataset, InsightDatasetKind, ResultTooLargeError} from "./IInsightFacade";
import {InsightError, NotFoundError} from "./IInsightFacade";
import * as fs from "fs-extra";
import {Courses} from "./Courses";
import {Course} from "./Course";
import * as JSZip from "jszip";
import {JSZipObject} from "jszip";
import {QueryProcessor} from "./QueryProcessor";
import {QueryValidator} from "./QueryValidator";
import {QueryTransformation} from "./QueryTransformation";
import {isObject, isString} from "util";
import {Room} from "./Room";
import {Rooms} from "./Rooms";
import {Building} from "./Building";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    public  coursesCollection: Courses[];
    public  idCollection: string[];
    public  roomCollection: Room[];
    public  roomsCollection: Rooms[];
    public  buildings: Building[];
    public room: Room;
    public courses: Courses;

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
        this.coursesCollection = [];
        this.idCollection = [];
        this.buildings = [];
        this.roomCollection = [];
        this.roomsCollection = [];
        this.room = new Room();
        this.courses = new Courses();
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        let current = this;
        return new Promise(function (resolve1, reject) {
            if (current.idCollection.length !== 0) {
                if (current.idCollection.includes(id)) {
                    return reject(new InsightError());
                }
            }
            let str: boolean;
            str = current.idValidity(id);
            if (str === false) {
                return reject(new InsightError());
            }
            if (kind === InsightDatasetKind.Courses) {
                return current.courses.addCourses(id, content, current).then(function (result: any[]) {
                    resolve1(result);
                }).catch(function (error: any) {
                    reject(new InsightError());
                });
            } else if (kind === InsightDatasetKind.Rooms) {
                return current.room.addRooms(id, content, current).then(function (result2) {
                    resolve1(result2);
                }).catch(function (error: any) {
                    reject(new InsightError());
                });
            }
        });
    }

    public getGeoLocation(buildings: any[]): Promise<any> {
        let array: any[] = [];
        return new Promise<any>((resolve, reject) => {
            let newArray: any[] = [];
            for (let building of buildings) {
                let http = require("http");
                let addr = encodeURI(building.address);
                let web = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team";
                let destination = web.concat("154/", addr);
                let promise = new Promise(function (resolve2, reject1) {
                    http.get(destination, (res: any) => {
                        let origin = "";
                        res.on("data", (chunk: string) => {
                            origin += chunk;
                        });
                        res.on("end", () => {
                            try {
                                const result = JSON.parse(origin);
                                building.lat = result["lat"];
                                building.lon = result["lon"];
                                resolve2(building);
                            } catch (e) {
                                resolve2();
                            }
                        });
                    }).on("error", (err: any) => {
                        resolve2();
                    });
                });
                array.push(promise);
            }
            Promise.all(array).then((result: any) => {
                resolve(result);
            });
        });
    }

    public readFiles(input: any): Course[] {
        let curr: Course[] = [];
        for (let element of input) {
            let cour = JSON.parse(element);
            let courMid = cour["result"];
            for (let ele of courMid) {
                let tmp = Object.entries(ele);
                let adjust: boolean = false;
                for (let entry of tmp) {
                    if (entry[1] === "overall") {
                        adjust = true;
                    }
                }
                let currCour = new Course();
                currCour.audit = ele["Audit"];
                currCour.avg = ele["Avg"];
                currCour.dept = ele["Subject"];
                currCour.fail = ele["Fail"];
                currCour.id = ele["Course"];
                currCour.instructor = ele["Professor"];
                currCour.pass = ele["Pass"];
                currCour.title = ele["Title"];
                currCour.uuid = ele["id"].toString();
                if (adjust === true) {
                    currCour.year = 1900;
                } else {
                    currCour.year = Number(ele["Year"]);
                }
                curr.push(currCour);
            }
        }
        return curr;
    }

    public loadCoursesToDisk(id: string, curr: Course[]): string[] {
        let current = this;
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("./data");
        }
        fs.writeFileSync("./data/".concat(id, ".json"), JSON.stringify(curr));
        let currCourses = new Courses();
        currCourses.id = id;
        currCourses.kind = InsightDatasetKind.Courses;
        currCourses.courseCollection = curr;
        currCourses.numRows = curr.length;
        current.coursesCollection.push(currCourses);
        current.idCollection.push(id);
        return current.idCollection;
    }

    public idValidity(id: string) {
        if (id === null) {
            return false;
        } else if ((typeof id === "undefined") || (id.includes("_")) || (id === "")) {
            return false;
        } else {
            return true;
        }
    }

    public loadRoomsToDisk(id: string, curr: Room[]): string[] {
        let current = this;
        if (!fs.existsSync("./data")) {
            fs.mkdirSync("./data");
        }
        fs.writeFileSync("./data/".concat(id, ".json"), JSON.stringify(curr));
        let currRooms = new Rooms();
        currRooms.id = id;
        currRooms.kind = InsightDatasetKind.Rooms;
        currRooms.roomCollection = curr;
        currRooms.numRows = curr.length;
        current.roomsCollection.push(currRooms);
        current.idCollection.push(id);
        return current.idCollection;
    }

    public removeDataset(id: string): Promise<string> {
        let that = this;
        return new Promise<string>((resolve1, reject) => {
            if (id === null) {
                return reject(new InsightError());
            }
            if ((typeof id === "undefined") || (id.includes("_")) || (id === "")) {
                reject(new InsightError());
            }
            if (that.idCollection.includes(id)) {
                for (let str of that.idCollection) {      // of or in??
                    if (str === id) {
                        for (let c of that.coursesCollection) {
                            if (c.id === str) {
                                const index = that.coursesCollection.indexOf(c);
                                if (index > -1) {
                                    that.coursesCollection.splice(index, 1);
                                }
                            }
                        }
                        for (let c of that.roomsCollection) {
                            if (c.id === str) {
                                const index = that.roomsCollection.indexOf(c);
                                if (index > -1) {
                                    that.roomsCollection.splice(index, 1);
                                }
                            }
                        }
                        let tempPath = "./data/".concat(id, ".json");
                        if (fs.existsSync(tempPath)) {
                            fs.remove(tempPath);
                            return resolve1(str);
                        } else {
                            return reject(new NotFoundError());
                        }
                    }
                }
            } else {
                reject(new NotFoundError());
            }
        });
    }

    public performQuery(query: any): Promise<any[]> {
        let that = this;
        return new Promise<any[]>(function (resolve1, reject) {
            let firstStep = new QueryValidator();
            if (!(firstStep.checkSyntactic(query))) {
                return reject(new InsightError());
            }
            let data: any[] = [];
            let body: any = query["WHERE"];
            let options: any = query["OPTIONS"];
            let columns: any[] = options["COLUMNS"];
            let order: any = options["ORDER"];
            let useless: any[] = columns[0].split("_");
            let dataName: string = useless[0];
            try {
                let dataSet = fs.readFileSync("./data/".concat(dataName, ".json")).toString();
                data = JSON.parse(dataSet);
            } catch (e) {
                reject(new InsightError("there is an error when loading data file"));
            }
            let currentResult: any[] = [];
            let transObject = new QueryTransformation();
            if (!("TRANSFORMATIONS" in query)) {
                currentResult = Room.findResult(currentResult, data, columns, body);
            } else {
                currentResult = transObject.findResultOfTrans(currentResult, data, query, body, columns);
            }
            if (currentResult.length <= 5000) {
                if ((!(order === null)) && isString(order)) {
                    currentResult.sort(function (firstResult: any, secondResult: any) {
                        if ((firstResult[order]) > (secondResult[order])) {
                            return 1;
                        } else if ((secondResult[order]) > (firstResult[order])) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                } else if ((!(order === null)) && isObject(order)) {
                    currentResult = transObject.showResult(currentResult, order, columns);
                }
                resolve1(currentResult);
            } else {
                reject(new ResultTooLargeError());
            }
        });
    }

    public listDatasets(): Promise<InsightDataset[]> {
        let result: InsightDataset[] = [];
        let temp: InsightDatasetKind.Courses;
        return new Promise<InsightDataset[]>((resolve1) => {
            for (let c of this.coursesCollection) {
                let kind = c.kind;
                let id = c.id;
                let numRows = c.numRows;
                let tempCourse: InsightDataset = {id, kind, numRows};
                result.push(tempCourse);
            }
            for (let c of this.roomsCollection) {
                let kind = c.kind;
                let id = c.id;
                let numRows = c.numRows;
                let tempRooms: InsightDataset = {id, kind, numRows};
                result.push(tempRooms);
            }
            resolve1(result);
        });
    }
}
