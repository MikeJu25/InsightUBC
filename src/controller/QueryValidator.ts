import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import {Course} from "./Course";
import has = Reflect.has;
import {QueryValidatorHelper} from "./QueryValidatorHelper";

export class QueryValidator {
    public core: any[] = ["WHERE", "OPTIONS", "TRANSFORMATIONS"];
    public coreOpt: any = ["TRANSFORMATIONS"];
    public transformations: any[] = ["GROUP", "APPLY"];
    public logic: any[] = ["AND", "OR"];
    public mcomparater: any[] = ["LT", "GT", "EQ"];
    public negation: any[] = ["NOT"];
    public scomparater: any[] = ["IS"];
    public columns: any = ["COLUMNS"];
    public mApplyTokens: any[] = ["MAX", "MIN", "AVG", "SUM"];
    public sApplyTokens: any[] = ["COUNT"];
    public sort: any[] = ["dir", "keys"];
    public direction: any[] = ["UP", "DOWN"];
    public mfield: any[] = ["courses_avg", "courses_pass", "courses_fail", "courses_audit", "courses_year",
        "rooms_lat", "rooms_lon", "rooms_seats"];

    public sfield: any[] = ["courses_dept", "courses_id", "courses_instructor", "courses_title", "courses_uuid",
        "rooms_fullname", "rooms_shortname", "rooms_number", "rooms_name", "rooms_address", "rooms_type",
        "rooms_furniture", "rooms_href"];

    public options: any[] = ["COLUMNS"];
    public allApplyKeys: any[] = [];

    public checkSyntactic(query: any): boolean {
        try {
            this.coreChecker(query);
        } catch (e) {
            return false;
        }
        return true;
    }

    public coreChecker(query: any): boolean {
        let hasTrans: boolean = false;
        if (!(QueryValidatorHelper.isObject(query))) {
            throw new InsightError("query is not an object");
        }
        let queryCore: any[] = Object.keys(query);
        for (let key of queryCore) {
            if (!(this.core.includes(key))) {
                throw new InsightError("OPTIONS or WHERE missing");
            }
            if (this.coreOpt.includes(key)) {
                hasTrans = true;
            }
        }
        if (queryCore.length > 3) {
            throw new InsightError("Invalid query string");
        }
        let where = query["WHERE"];
        let options = query["OPTIONS"];
        try {
            if (this.validateWhere(where)) {
                if (hasTrans === true) {
                    let transformations = query["TRANSFORMATIONS"];
                    this.validateTransformation(transformations, options);
                    this.validateOptions(options, hasTrans);
                } else {
                    this.validateOptions(options, hasTrans);
                }
            }
        } catch (e) {
            throw new InsightError(e);
        }
        return true;
    }

    public validateWhere(where: any): boolean {
        if (where === undefined) {
            throw new InsightError("WHERE is undefined");
        } else {
            if (!(QueryValidatorHelper.isObject(where))) {
                throw new InsightError("where is not an object");
            }
            if (where.length > 1) {
                throw new InsightError("");
            }
            try {
                this.validateFilter(where);
            } catch (e) {
                throw new InsightError(e);
            }
        }
        return true;
    }

    public validateFilter(where: any): boolean {
        if (!(QueryValidatorHelper.isObject(where))) {
            throw new InsightError("filter is not an object");
        }
        if (where.length > 1) {
            throw new InsightError("Where should only have 1 key");
        }
        try {
            QueryValidatorHelper.filterChecker(where);
            let filter: any[] = Object.keys(where);
            // this.validateFilter(filter);
            if (QueryValidatorHelper.includesOneOf(filter, this.logic)) {
                this.logicChecker(filter, where);
            }
            if (QueryValidatorHelper.includesOneOf(filter, this.mcomparater)) {
                QueryValidatorHelper.mcompChecker(filter, where);
            }
            if (QueryValidatorHelper.includesOneOf(filter, this.negation)) {
                this.negationChecker(filter, where);
            }
            if (QueryValidatorHelper.includesOneOf(filter, this.scomparater)) {
                QueryValidatorHelper.scompChecker(filter, where);
            }
        } catch (e) {
            throw new InsightError(e);
        }
        return true;
    }

    public logicChecker(filter: any, where: any): boolean {
        if (!(QueryValidatorHelper.isObject(where[filter]))) {
            throw new InsightError("AND should be an object");
        }
        let content = where[filter];
        if (content.length === 0) {
            throw new InsightError("AND should be a non-empty array");
        }
        for (let f of content) {
            try {
                this.validateFilter(f);
            } catch (e) {
                throw new InsightError(e);
            }
        }
        return true;
    }

    public mcompProcessor(mcomp: any, where: any): boolean {
        let content: any = where[mcomp];         // mcomp: GT, content: { courses_avg: 98 }, key: courses_avg
        let key = Object.keys(content);
        let key0: string = key[0];
        if ((!(QueryValidatorHelper.includesOneOf(key, this.mfield))) || key.length > 1) {
            throw new InsightError("Invalid mcomparator key");
        }
        if (!(typeof content[key0] === "number")) {
            throw new InsightError("Invalid value type in mcomparator, should be number");
        }
        return true;
    }

    public negationChecker(filter: any, where: any): boolean {
        try {
            this.validateFilter(where[filter]);
        } catch (e) {
            throw new InsightError(e);
        }
        return true;
    }

    public validateOptions(options: any, hasTrans: boolean): boolean {
        if (!(QueryValidatorHelper.isObject(options))) {
            throw new InsightError("OPTIONS is not an object");
        }
        if (options.length > 2) {
            throw new InsightError("Too many arguments in OPTIONS");
        }
        if (options.length === 0) {
            throw new InsightError("No arguments in OPTIONS");
        }
        let content: any[] = Object.keys(options);
        if (content.length > 2) {
            throw new InsightError("too many keys in COLUMNS");
        }
        if (!content.includes("COLUMNS")) {
            throw new InsightError("Missing COLUMNS");
        }
        let columns: any[] = options["COLUMNS"];
        try {
            this.columnChecker(columns, hasTrans);
            if (content.includes("ORDER")) {
                let order: any[] = options["ORDER"];
                QueryValidatorHelper.orderChecker(columns, order, hasTrans);
            }
        } catch (e) {
            throw new InsightError(e);
        }
        return true;
    }

    public validateTransformation(transformations: any, options: any): boolean {
        if (!(QueryValidatorHelper.isObject(transformations))) {
            throw new InsightError("TRANSFORMATIONS is not an object");
        }
        if (transformations.length > 2) {
            throw new InsightError("Too many arguments in TRANSFORMATIONS");
        }
        if (transformations.length === 0) {
            throw new InsightError("No arguments in TRANSFORMATIONS");
        }
        let content: any[] = Object.keys(transformations);
        if (content.length > 2) {
            throw new InsightError("too many keys in TRANSFORMATIONS");
        }
        if ((!content.includes("GROUP")) || (!content.includes("APPLY"))) {
            throw new InsightError("Missing APPLY or GROUP in TRANSFORMATIONS");
        }
        let group: any[] = transformations["GROUP"];
        let apply: any[] = transformations["APPLY"];
        let columns: any[] = options["COLUMNS"];
        try {
            if (QueryValidatorHelper.groupChecker(group, columns)) {
                this.applyChecker(apply);
            }
        } catch (e) {
            throw new InsightError(e);
        }
        return true;
    }

    public applyChecker(apply: any): boolean {
        if (!(Array.isArray(apply))) {
            throw new InsightError("APPLY should be an array");
        }
        // if (apply.length === 0) {
        //     throw new InsightError("Referenced dataset cannot be empty string (APPLY array is empty)");
        // }
        for (let applyRule of apply) {
            // the first and only applyRule is the overallAvg clause
            let applyKeys: any[] = Object.keys(applyRule);
            // applyKeys here is "overallAvg"
            if (applyKeys.length > 1) {
                throw new InsightError("Apply rule should only have 1 key (Query 15)");
            }
            // should be only one applyKey
            let applyKey = applyKeys[0];
            if (this.allApplyKeys.includes(applyKey)) {
                throw new InsightError("Duplicate APPLY key");
            }
            this.allApplyKeys.push(applyKey);
            // applyBody is the AVG clause
            let applyBody = applyRule[applyKey];
            // currApplyToken is "AVG"
            let currApplyTokens: any[] = Object.keys(applyBody);
            if (!(currApplyTokens.length === 1)) {
                throw new InsightError("Apply body should only have 1 key (Query 14)");
            }
            let currApplyToken = currApplyTokens[0];
            if ((!(this.sApplyTokens.includes(currApplyToken))) && (!(this.mApplyTokens.includes(currApplyToken)))) {
                throw new InsightError("Invalid transformation operator (Query 7)");
            }
            // applyTokenKey is "courses_avg"
            let applyTokenKey: any[] = applyBody[currApplyToken];
            if (Array.isArray(applyTokenKey)) {
                throw new InsightError("Invalid apply rule target key (Query 9)");
            }
            if (!(this.mfield.includes(applyTokenKey)) && (!(this.sfield.includes(applyTokenKey)))) {
                throw new InsightError("Invalid key in APPLY TOKEN (Query 16)");
            }
            if (this.sApplyTokens.includes(currApplyToken)) {
                if (this.mfield.includes(applyTokenKey)) {
                    throw new InsightError("Apply Token COUNT can only take string type key");
                }
            } else {
                if (this.sfield.includes(applyTokenKey)) {
                    throw new InsightError("Numerical Apply Token can only take numerical type key");
                }
            }
        }
        return true;
    }

    public columnChecker(columns: any, hasTrans: boolean): boolean {
        if (!(Array.isArray(columns))) {
            throw new InsightError("COLUMNS should be an array");
        }
        if (columns.length === 0) {
            throw new InsightError("Nothing found in COLUMNS");
        }
        for (let ele of columns) {
            if (ele === null) {
                throw new InsightError("Columns key should not be null");
            }
        }
        for (let key of columns) {
            if (hasTrans) {
                if (!(this.mfield.includes(key)) && (!(this.sfield.includes(key)))
                    && (!(this.allApplyKeys.includes(key)))) {
                    throw new InsightError("COLUMNS contains keys neither normal keys nor any keys");
                }
            } else {
                if (!(this.mfield.includes(key)) && (!(this.sfield.includes(key)))) {
                    throw new InsightError("Invalid key in COLUMNS");
                }
            }
        }
        return true;
    }
}
