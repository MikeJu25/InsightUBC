import {type} from "os";

export class Building {
    public fullname: string;
    public shortname: string;
    public address: string;
    public lat: number;
    public lon: number;

    constructor() {
        this.fullname = null;
        this.shortname = null;
        this.address = null;
        this.lat = 0;
        this.lon = 0;
    }

    public loadBuilding(asTree: any): any[] {
        let that = this;
        if (asTree === null) {
            return null;
        }
        if (asTree["nodeName"] === "tbody") {
            let buildingList: Building[] = [];
            for (let element of asTree["childNodes"]) {
                if (element["nodeName"] === "tr") {
                    let tmpBuilding = new Building();
                    tmpBuilding = this.buildConstructor(element, tmpBuilding);
                    if (this.checkValid(tmpBuilding)) {
                        buildingList.push(tmpBuilding);
                    }
                }
            }
            if (buildingList.length !== 0) {
                return buildingList;
            } else {
                return null;
            }
        } else {
            let childs = asTree["childNodes"];
            if (!(childs === null) && (!(childs === undefined))) {
                for (let element of childs) {
                    let temp = this.loadBuilding(element);
                    if (temp !== null) {
                        return temp;
                    }
                }
            }
            return null;
        }
    }

    public buildConstructor(line: any, currBuilding: any): any {
        let that = this;
        if (typeof line === "undefined") {
            return null;
        }
        let codeNode = that.findNode("views-field views-field-field-building-code", line);
        if (that.checkTheType(codeNode)) {
            currBuilding.shortname = String(codeNode["childNodes"][0]["value"]).trim();
        }
        let titleNode = that.findNode("views-field views-field-title", line);
        if (that.fullNameCheck(titleNode)) {
            let newElement = titleNode["childNodes"][1];
            currBuilding.fullname = String(newElement["childNodes"][0]["value"]).trim();
        }
        let addressNode = that.findNode("views-field views-field-field-building-address", line);
        if (that.checkTheType(addressNode)) {
            currBuilding.address = String(addressNode["childNodes"][0]["value"]).trim();
        }
        return currBuilding;
    }

    public checkTheType(input: any): boolean {
        let standard = false;
        if (typeof input["childNodes"] !== "undefined") {
            if (typeof input["childNodes"][0] !== "undefined") {
                if (typeof input["childNodes"][0]["value"] !== "undefined") {
                    return true;
                }
            }
        }
        return standard;
    }

    public fullNameCheck(input: any): boolean {
        let standard = false;
        if (typeof input["childNodes"] !== "undefined") {
            if (typeof input["childNodes"][1] !== "undefined") {
                if (typeof input["childNodes"][1]["childNodes"] !== "undefined") {
                    if (typeof input["childNodes"][1]["childNodes"][0] !== "undefined") {
                        if (typeof input["childNodes"][1]["childNodes"][0]["value"] !== "undefined") {
                            return true;
                        }
                    }
                    return true;
                }
            }
        }
        return standard;
    }

    public checkValid(building: Building): boolean {
        if (typeof building.address !== "undefined" && typeof building.fullname !== "undefined") {
            if (typeof building.shortname !== "undefined") {
                if (building.shortname !== null) {
                    if (building.fullname !== null) {
                        if (building.address !== null) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }


    public findNode(tag: any, input: any): any {
        let that = this;
        if (typeof input["attrs"] !== "undefined") {
            for (let element of input["attrs"]) {
                if (element["value"] === tag) {
                    return input;
                }
            }
        }
        if (typeof input["childNodes"] !== "undefined") {
            for (let element of input["childNodes"]) {
                let tmp = that.findNode(tag, element);
                if ((tmp !== null) && (typeof tmp !== "undefined")) {
                    return tmp;
                }
            }
        }

    }
}
