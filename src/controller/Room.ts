import {Building} from "./Building";
import * as JSZip from "jszip";
import {InsightError} from "./IInsightFacade";
import {QueryProcessor} from "./QueryProcessor";

export class Room {
    public fullname: string;
    public shortname: string;
    public number: string;
    public name: string;
    public address: string;
    public lat: number;
    public lon: number;
    public type: string;
    public furniture: string;
    public href: string;
    public seats: number;

    constructor() {
        this.fullname = null;
        this.shortname = null;
        this.number = null;
        this.name = null;
        this.address = null;
        this.lat = 0;
        this.lon = 0;
        this.type = null;
        this.furniture = null;
        this.href = null;
        this.seats = 0;
    }

    public loadRooms(asTree: any, building: any): any[] {
        let that = this;
        if (asTree === null || typeof  asTree === "undefined") {
            return null;
        }
        if (typeof asTree["nodeName"] === "undefined") {
            return null;
        }
        if (asTree["nodeName"] === "tbody") {
            let rooms: Room[] = [];
            for (let element of asTree["childNodes"]) {
                if (element["nodeName"] === "tr") {
                    let tmpRoom = new Room();
                    tmpRoom = this.roomConstructor(element, tmpRoom, building);
                    if (tmpRoom !== null) {
                        rooms.push(tmpRoom);
                    }
                }
            }
            if (rooms.length !== 0) {
                return rooms;
            } else {
                return null;
            }
        } else {
            let children = asTree["childNodes"];
            if ((!(typeof children === "undefined"))) {
                for (let element of children) {
                    let temp = this.loadRooms(element, building);
                    if (temp !== null) {
                        return temp;
                    }
                }
            }
            return null;
        }
    }

    // public static roomConstructor(line: any, currRoom: any, building: any): any {
    //     let attributes = line["attrs"];
    //     currRoom.shortname = building.shortName;
    //     for (let element of attributes) {
    //         if (element["value"] === "views-field views-field-field-room-furniture") {
    //             currRoom.furniture = String(element["childNodes"][0]["value"]).trim();
    //         }
    //         if (element["value"] === "views-field views-field-field-room-number") {
    //             let newElement = element["childNodes"][1];
    //             currRoom.number = String(newElement["childNodes"][0]["value"]).trim();
    //         }
    //         if (element["value"] === "views-field views-field-field-room-capacity") {
    //             currRoom.seats = String(element["childNodes"][0]["value"]).trim();
    //         }
    //         if (element["value"] === "views-field views-field-field-room-type") {
    //             currRoom.type = String(element["childNodes"][0]["value"]).trim();
    //         }
    //         if (element["value"] === "views-field views-field-nothing") {
    //             let newElements = element["childNodes"];
    //             for (let piece of newElements) {
    //                 let newAttribute = piece["attrs"][0];
    //                 if (newAttribute["name"] === "href") {
    //                     currRoom.href = newAttribute["value"];
    //                 }
    //             }
    //         }
    //     }
    //     let offSpring = line["childNodes"];
    //     for (let piece of offSpring) {
    //         currRoom = this.roomConstructor(piece, currRoom, building);
    //     }
    //     currRoom.name = currRoom.shortname.concat("_", currRoom.number);
    //     currRoom.fullName = building.fullName;
    //     currRoom.address = building.address;
    //     currRoom.lat = building.lat;
    //     currRoom.lon = building.lon;
    //     return currRoom;
    // }

    public roomConstructor(line: any, currRoom: any, building: any): any {
        let bild = new Building();
        if (typeof line === "undefined") {
            return null;
        }
        let furnitureNode = bild.findNode("views-field views-field-field-room-furniture", line);
        if (bild.checkTheType(furnitureNode)) {
            currRoom.furniture = String(furnitureNode["childNodes"][0]["value"]).trim();
        }
        let numberNode = bild.findNode("views-field views-field-field-room-number", line);
        if (bild.fullNameCheck(numberNode)) {
            let newElement = numberNode["childNodes"][1];
            currRoom.number = String(newElement["childNodes"][0]["value"]).trim();
        }
        let typeNode = bild.findNode("views-field views-field-field-room-type", line);
        if (bild.checkTheType(typeNode)) {
            currRoom.type = String(typeNode["childNodes"][0]["value"]).trim();
        }
        let capacityNode = bild.findNode("views-field views-field-field-room-capacity", line);
        if (bild.checkTheType(capacityNode)) {
            currRoom.seats = Number(capacityNode["childNodes"][0]["value"]);
        }
        let nothingNode = bild.findNode("views-field views-field-nothing", line);
        if (typeof nothingNode["childNodes"] !== "undefined") {
            for (let element of nothingNode["childNodes"]) {
                if ((typeof element !== "undefined") && (typeof element["attrs"] !== "undefined")) {
                    if (element["attrs"][0]["name"] === "href") {
                        currRoom.href = element["attrs"][0]["value"];
                    }
                }
            }
        }
        currRoom.shortname = building.shortname;
        currRoom.name = currRoom.shortname.concat("_", currRoom.number);
        currRoom.fullname = building.fullname;
        currRoom.address = building.address;
        currRoom.lat = building.lat;
        currRoom.lon = building.lon;
        return currRoom;
    }

    public addRooms(id: string, content: string, obj: any): Promise<string[]> {
        let current = this;
        return new Promise(function (resolve1, reject) {
            let allContents: Array<Promise<any>> = [];
            let zip: JSZip;
            JSZip.loadAsync(content, {base64: true}).then(function (zip1: JSZip) {
                zip = zip1;
                return zip.file("rooms/index.htm").async("string");
            }).then((directory) => {
                let parse5 = require("parse5");
                return parse5.parse(directory);
            }).then((document) => {
                let bil = new Building();
                obj.buildings = bil.loadBuilding(document);
                return obj.buildings;
            }).then((buildingArr) => {
                return obj.getGeoLocation(buildingArr); // skip those buildings with error location
            }).then((buildingArrLoc) => {
                if ((buildingArrLoc === null) || (buildingArrLoc === undefined)) {
                    return null;
                }
                for (let b of buildingArrLoc) {
                    let tag: any = b.shortname;
                    let path = "rooms/campus/discover/buildings-and-classrooms/";
                    let target = path + tag;
                    let newPromise = zip.files[target].async("string").then((astOfRoom) => {
                        let parse5 = require("parse5");
                        let tmpData = parse5.parse(astOfRoom);
                        if (tmpData === null) {
                            return [];
                        }
                        let rooms: any[] = [];
                        let tempRoom = new Room();
                        rooms = tempRoom.loadRooms(tmpData, b);
                        return rooms;
                    });
                    allContents.push(newPromise);
                }
                Promise.all(allContents).then(function (result: any) {
                    let newArray: any[] = current.selectHelper(result);
                    let idGather = obj.loadRoomsToDisk(id, newArray);
                    resolve1(idGather);
                }).catch(function () {
                    reject(new InsightError());
                });
            }).catch(function () {
                reject(new InsightError());
            });
        });
    }

    public selectHelper(result: any[]): any[] {
        let aNewArray: any[] = [];
        for (let element of result) {
            if (element !== null) {
                for (let piece of element) {
                    aNewArray.push(piece);
                }
            }
        }
        return aNewArray;
    }

    public static findResult(currentResult: any[], data: any[], columns: any[], body: any): any[] {
        let queryClass = new QueryProcessor();
        for (let element of data) {
            if (queryClass.mutualRecursion(body, element)) {
                let currentData: any = {};
                for (let pieces of columns) {
                    let tmp: any[] = pieces.split("_");
                    let dataKey: any = tmp[1];
                    currentData[pieces] = element[dataKey];
                }
                currentResult.push(currentData);
            }
        }
        return currentResult;
    }
}
