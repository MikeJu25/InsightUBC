import {QueryProcessor} from "./QueryProcessor";
import Decimal from "decimal.js";

export class QueryTransformation {
    public findResultOfTrans(currentResult: any[], data: any[], query: any, body: any, columns: any[]): any[] {
        let that = this;
        let queryClass = new QueryProcessor();
        for (let element of data) {
            if (queryClass.mutualRecursion(body, element) || Object.keys(body).length === 0) {
                currentResult.push(element);
            }
        }
        let groupApply = query["TRANSFORMATIONS"];
        let apply = groupApply["APPLY"];
        let group = groupApply["GROUP"];
        currentResult = that.setGroups(currentResult, group);
        for (let piece of currentResult) {
            for (let part of apply) {
                piece = that.applyTrans(piece, part);
            }
        }
        let tmpList: any[] = [];
        for (let element of currentResult) {
            let currentData: any = {};
            for (let pieces of columns) {
                if (pieces.includes("_")) {
                    let tmp: any[] = pieces.split("_");
                    let dataKey: any = tmp[1];
                    currentData[pieces] = element[dataKey];
                } else {
                    currentData[pieces] = element[pieces];
                }
            }
            tmpList.push(currentData);
        }
        return tmpList;
    }

    public applyTrans(aGroup: any, rule: any): any {
        let that = this;
        let groupMembers = aGroup["members"];
        let overallName = Object.keys(rule)[0];
        let applyPart = rule[overallName];
        let applyKey = Object.keys(applyPart)[0];
        let target = applyPart[applyKey];
        if (applyKey === "AVG") {
            aGroup[overallName] = that.avgHelper(groupMembers, target);
        }
        if (applyKey === "MIN") {
            aGroup[overallName] = that.minHelper(groupMembers, target);
        }
        if (applyKey === "MAX") {
            aGroup[overallName] = that.maxHelper(groupMembers, target);
        }
        if (applyKey === "COUNT") {
            aGroup[overallName] = that.countHelper(groupMembers, target);
        }
        if (applyKey === "SUM") {
            aGroup[overallName] = that.sumHelper(groupMembers, target);
        }
        return aGroup;
    }

    public avgHelper(groupMembers: any[], target: any): any {
        let avg: number = 0;
        let total = new Decimal(0);
        for (let element of groupMembers) {
            let tmp: any[] = target.split("_");
            let dataKey: any = tmp[1];
            let result = new Decimal(element[dataKey]);
            total = Decimal.add(total, result);
        }
        const mess = total.toNumber() / groupMembers.length;
        avg = Number(mess.toFixed(2));
        return avg;
    }

    public sumHelper(groupMembers: any[], target: any): any {
        let total = new Decimal(0);
        for (let element of groupMembers) {
            let tmp: any[] = target.split("_");
            let dataKey: any = tmp[1];
            let result = new Decimal(element[dataKey]);
            total = Decimal.add(total, result);
        }
        return total;
    }

    public minHelper(groupMembers: any[], target: any): any {
        let min: number = 100000;
        for (let element of groupMembers) {
            let tmp: any[] = target.split("_");
            let dataKey: any = tmp[1];
            if (element[dataKey] < min) {
                min = element[dataKey];
            }
        }
        return min;
    }

    public maxHelper(groupMembers: any[], target: any): any {
        let max: number = 0;
        for (let element of groupMembers) {
            let tmp: any[] = target.split("_");
            let dataKey: any = tmp[1];
            if (element[dataKey] > max) {
                max = element[dataKey];
            }
        }
        return max;
    }

    public countHelper(groupMembers: any[], target: any): any {
        let container: any[] = [];
        for (let element of groupMembers) {
            let tmp: any[] = target.split("_");
            let dataKey: any = tmp[1];
            if (!(container.includes(element[dataKey]))) {
                container.push(element[dataKey]);
            }
        }
        return container.length;
    }

    public setGroups(sections: any[], group: any): any[] {
        let that = this;
        let groups: any[] = [];
        for (let element of sections) {
            let groupName: string = "";
            for (let piece of group) {
                let tmp: any[] = piece.split("_");
                let dataKey: any = tmp[1];
                let namePiece = element[dataKey];
                groupName = groupName + namePiece;
            }
            if (that.existOrNot(groupName, groups)) {
                for (let piece of groups) {
                    if (piece["name"] === groupName) {
                        piece["members"].push(element);
                    }
                }
            } else {
                let newGroup: any = {};
                newGroup["name"] = groupName;
                for (let piece of group) {
                    let tmp: any[] = piece.split("_");
                    let dataKey: any = tmp[1];
                    newGroup[dataKey] = element[dataKey];
                }
                newGroup["members"] = [];
                newGroup["members"].push(element);
                groups.push(newGroup);
            }
        }
        return groups;
    }

    public existOrNot(name: string, groups: any[]): boolean {
        for (let element of groups) {
            if (element["name"] === name) {
                return true;
            }
        }
        return false;
    }

    public showResult(currentResult: any[], order: any, columns: any[]): any[] {
        let dir: any = order["dir"];
        let keys: any = order["keys"];
        currentResult.sort(function (firstResult: any, secondResult: any) {
            if (dir === "UP") {
                for (let eachKey of keys) {
                    if ((firstResult[eachKey]) > (secondResult[eachKey])) {
                        return 1;
                    } else if ((secondResult[eachKey]) > (firstResult[eachKey])) {
                        return -1;
                    }
                }
                return 0;
            } else if (dir === "DOWN") {
                for (let eachKey of keys) {
                    if ((firstResult[eachKey]) > (secondResult[eachKey])) {
                        return -1;
                    } else if ((secondResult[eachKey]) > (firstResult[eachKey])) {
                        return 1;
                    }
                }
                return 0;
            }
        });
        return currentResult;
    }
}
