import {InsightError, ResultTooLargeError} from "./IInsightFacade";


export class QueryValidatorHelper {
    public core: any[] = ["WHERE", "OPTIONS", "TRANSFORMATIONS"];
    public coreOpt: any = ["TRANSFORMATIONS"];
    public transformations: any[] = ["GROUP", "APPLY"];
    public static logic: any[] = ["AND", "OR"];
    public static mcomparater: any[] = ["LT", "GT", "EQ"];
    public static negation: any[] = ["NOT"];
    public static scomparater: any[] = ["IS"];
    public columns: any = ["COLUMNS"];
    public static mApplyTokens: any[] = ["MAX", "MIN", "AVG", "SUM"];
    public static sApplyTokens: any[] = ["COUNT"];
    public static sort: any[] = ["dir", "keys"];
    public static direction: any[] = ["UP", "DOWN"];
    public static mfield: any[] = ["courses_avg", "courses_pass", "courses_fail", "courses_audit", "courses_year",
        "rooms_lat", "rooms_lon", "rooms_seats"];

    public static sfield: any[] = ["courses_dept", "courses_id", "courses_instructor", "courses_title", "courses_uuid",
        "rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address", "rooms_type",
        "rooms_furniture", "rooms_href"];

    public options: any[] = ["COLUMNS"];
    public allApplyKeys: any[] = [];

    public static includesOneOf(arrTBC: any[], arrGiven: any[]): boolean {
        for (let elem of arrGiven) {
            if (arrTBC.includes(elem)) {
                return true;
            }
        }
        return false;
    }

    public static filterChecker(filter: any): boolean {
        let content: any[] = Object.keys(filter);
        if (content.length !== 0) {
            // throw new InsightError("nothing in where");
            let mCompOp: any = content[0];
            if (!((this.logic.includes(mCompOp)) || (this.mcomparater.includes(mCompOp))
                || (this.negation.includes(mCompOp)) || (this.scomparater.includes(mCompOp)))) {
                throw new InsightError("Invalid filter key");
            }
        }
        return true;
    }

    // "APPLY": [
    //                 {
    //                     "overallAvg": {
    //                         "AVG": "courses_avg"
    //                     }
    //                 }
    //             ]

    public static mcompChecker(filter: any, where: any): boolean {
        // let mComp: any = Object.keys(filter);
        // let content: any = Object.keys(mComp);
        if (!(this.isObject(filter))) { // || (!(this.isObject(content)))) {
            throw new InsightError("mcomparator is not an object");
        }
        try {
            this.mcompProcessor(filter, where);
        } catch (e) {
            throw new InsightError(e);
        }
        return true;
    }

    public static mcompProcessor(mcomp: any, where: any): boolean {
        let content: any = where[mcomp];         // mcomp: GT, content: { courses_avg: 98 }, key: courses_avg
        let key = Object.keys(content);
        let key0: string = key[0];
        if ((!(this.includesOneOf(key, this.mfield))) || key.length > 1) {
            throw new InsightError("Invalid mcomparator key");
        }
        if (!(typeof content[key0] === "number")) {
            throw new InsightError("Invalid value type in mcomparator, should be number");
        }
        return true;
    }

    public static groupChecker(group: any, columns: any): boolean {
        if (!(Array.isArray(group))) {
            throw new InsightError("GROUP should be an array");
        }
        if (group.length === 0) {
            throw new InsightError("GROUP must be a non-empty array");
        }
        let groupKeys: string[] = [];
        for (let key of group) {
            if (!(this.mfield.includes(key)) && (!(this.sfield.includes(key)))) {
                throw new InsightError("Invalid key in GROUP");
            }
            groupKeys.push(key);
        }
        // if (!(groupKeys.includes(columns))) {
        //     throw new InsightError("GROUP key must be in COLUMNS");
        // }
        let temp: boolean = false;
        for (let key of groupKeys) {
            if (columns.includes(key)) {
                temp = true;
            }
        }
        if (temp === false) {
            throw new InsightError("GROUP key must be in COLUMNS");
        }
        return true;
    }

    public static orderChecker(columns: any, order: any, hasTrans: boolean): boolean {
        // "ORDER": {
        //                 "dir": "DOWN",
        //                 "keys": [
        //                     "maxSeats"
        //                 ]
        //             }
        let columnsKeys: any[] = [];
        // if (!(hasTrans)) {
        //     // if (!(typeof order === "string")) {
        //     //     throw new InsightError("Order key must be a string");
        //     // }
        //     for (let key of columns) {
        //         columnsKeys.push(key);
        //     }
        //     if (!(columnsKeys.includes(order))) {
        //         throw new InsightError("ORDER key must be in COLUMNS");
        //     }
        // } else {
        for (let key of columns) {
            columnsKeys.push(key);
        }
        let currSort: any[] = Object.keys(order);
        let complexOrder: boolean = false;
        // if (!(currSort.length === 2)) {
        //         throw new InsightError("there should only be 2 arguments in sort");
        //     }
        for (let s of currSort) {
            if (this.sort.includes(s)) {
                if (!(currSort.length === 2)) {
                    throw new InsightError("there should only be 2 arguments in sort");
                }
                complexOrder = true;
            } else {
                if (complexOrder === true) {
                    throw new InsightError("ORDER missing 'keys' or 'dir' key");
                } else {
                    if (!(typeof order === "string")) {
                        throw new InsightError("Order key must be a string");
                    }
                    if (!(columnsKeys.includes(order))) {
                        throw new InsightError("ORDER key must be in COLUMNS");
                    }
                }
            }
        }
        if (complexOrder === true) {
            let dir: any = order["dir"];
            if (!(this.direction.includes(dir))) {
                throw new InsightError("Invalid ORDER direction");
            }
            // keys is [maxSeats]
            let keys: any[] = order["keys"];
            if (!(Array.isArray(keys)) || (keys.length === 0)) {
                throw new InsightError("ORDER keys must be a non-empty array");
            }
            for (let key of keys) {
                if (!(columnsKeys.includes(key))) {
                    throw new InsightError("All ORDER keys must be in COLUMNS");
                }
            }
        }
        return true;
    }

    public static scompChecker(filter: any, where: any): boolean {
        let content: any = where[filter];       // key: corses_title
        let key = Object.keys(content);
        let key0: string = key[0];
        if ((!(QueryValidatorHelper.includesOneOf(key, this.sfield))) || key.length > 1) {
            throw new InsightError("Invalid scomparator key");
        }
        let str = content[key0];
        if (!(typeof str === "string")) {
            throw new InsightError("Invalid value type in mcomparator, should be string");
        }
        if (str.includes("*")) {
            if (!(str.charAt(0) === "*")) {
                if (!((str.charAt(str.length - 1)) === "*")) {
                    throw new InsightError("* can only be the first or last characters of input strings");
                }
            }
        }
        return true;
    }

    public static isObject(target: any[]): boolean {
        return (typeof target === "object");
        // return Object.prototype.toString.call(target).indexOf("Object") > -1;
    }
}
