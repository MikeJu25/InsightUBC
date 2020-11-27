/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */


const shouldBeNumber = [
    "avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"
];

CampusExplorer.buildQuery = () => {
    let query = {};
    let currQuery = queryCoreSetter(query);
    queryFiller(currQuery);
    // TODO: implement!
    console.log("CampusExplorer.buildQuery not implemented yet.");
    return currQuery;
};

    function queryCoreSetter(query) {
        let kind = getType();
        let WHERE = extractWhere(kind);
        let COLUMNS = processColumns(kind);
        query = {
                WHERE,
            OPTIONS: {
                COLUMNS
            }
        }
        return query;
    }

    function queryFiller(query) {
        let kind = getType();
        let order = processOrder(kind);
        let orderDescending = processOrderDir(kind);
        console.log("ke");
        let APPLY = extractTrans(kind);
        let GROUP = processGroup(kind);
        if (!(order.length === 0)) {
            if (orderDescending) {
                query.OPTIONS.ORDER = {
                    dir: "DOWN",
                    keys: order
                }
            } else {
                query.OPTIONS.ORDER = {
                    dir: "UP",
                    keys: order
                }
            }
        }
        if (!(APPLY.length === 0)) {
            // query.TRANSFORMATIONS.APPLY = transList;
            // if (!(group.length === 0)) {
            //     query.TRANSFORMATIONS.GROUP = group;
            // }
            query.TRANSFORMATIONS = {
                GROUP,
                APPLY
            }
        }
    }

    function getType() {
        let currType = document.getElementsByClassName("nav-item tab active")[0];
        if (currType.text === "Courses") {
            return "courses";
        } else {
            return "rooms";
        }
    }

    function extractWhere(kind) {
        // let threeChoice = [];
        // let rowList = [];
        // if(kind === "courses") {
        //     let theFirstRow = document.getElementsByClassName("control-group condition-type")[0];
        //     threeChoice = theFirstRow.getElementsByTagName("input");
        //     let allContent = document.getElementsByClassName("conditions-container")[0];
        //     rowList = allContent.getElementsByClassName("control-group condition");
        // } else if(kind === "rooms") {
        //     let theFirstRow = document.getElementsByClassName("control-group condition-type")[1];
        //     threeChoice = theFirstRow.getElementsByTagName("input");
        //     let allContent = document.getElementsByClassName("conditions-container")[1];
        //     rowList = allContent.getElementsByClassName("control-group condition");
        // }
        // let conditions = [];
        // for(let element of rowList) {
        //     let tmp0 = element.getElementsByClassName("control not")[0];
        //     let negate = tmp0.getElementsByTagName("input")[0].checked;
        //     let tmp1 = element.getElementsByClassName("control fields")[0].getElementsByTagName("select")[0];
        //     let selectTarget = tmp1.selectedIndex;
        //     let target = tmp1.options[selectTarget].value.trim().toLowerCase();
        //     let targetName = kind + "_" + target;
        //     let tmp2 = element.getElementsByClassName("control operators")[0].getElementsByTagName("select")[0];
        //     let selectCompare = tmp2.selectedIndex;
        //     let compare = tmp2.options[selectCompare].text.trim().toUpperCase();
        //     let tmp3 = element.getElementsByClassName("control term")[0];
        //     let standard = tmp3.getElementsByTagName("input")[0].value.trim();
        //     if (shouldBeNumber.includes(target)) {
        //         standard = Number(standard);
        //     }
        //     let oneCondition = {};
        //     if (negate) {
        //         let inside = {};
        //         inside[compare] = {};
        //         inside[compare][targetName] = standard;
        //         oneCondition["NOT"] = inside;
        //     } else {
        //         oneCondition[compare] = {};
        //         oneCondition[compare][targetName] = standard;
        //     }
        //     conditions.push(oneCondition);
        // }
        // let preRequest;
        // if (threeChoice[0].checked) {
        //     preRequest = "ALL";
        // } else if (threeChoice[1].checked) {
        //     preRequest = "OR";
        // } else if (threeChoice[2].checked) {
        //     preRequest = "NONE";
        // }
        // let whereObj = {};
        // switch (conditions.length) {
        //     case 0:
        //         break;
        //     case 1:
        //         if(preRequest === "NONE") {
        //             whereObj["NOT"] = conditions[0];
        //         } else {
        //             whereObj = conditions[0];
        //         }
        //         break;
        //     default:
        //         if(preRequest === "NONE") {
        //             whereObj["NOT"] = {};
        //             whereObj["NOT"]["AND"] = conditions;
        //         } else if (preRequest === "ALL"){
        //             whereObj["AND"] = conditions;
        //         } else if (preRequest === "OR"){
        //             whereObj["OR"] = conditions;
        //         }
        //         break;
        // }
        // return whereObj;
            let threeChoice = [];
            let rowList = [];
            if(kind === "courses") {
                let theFirstRow = document.getElementsByClassName("control-group condition-type")[0];
                threeChoice = theFirstRow.getElementsByTagName("input");
                let allContent = document.getElementsByClassName("conditions-container")[0];
                rowList = allContent.getElementsByClassName("control-group condition");
            } else if(kind === "rooms") {
                let theFirstRow = document.getElementsByClassName("control-group condition-type")[1];
                threeChoice = theFirstRow.getElementsByTagName("input");
                let allContent = document.getElementsByClassName("conditions-container")[1];
                rowList = allContent.getElementsByClassName("control-group condition");
            }
            let conditions;
            conditions = getConditions(kind, rowList);
            let preRequest;
            if (threeChoice[0].checked) {
                preRequest = "ALL";
            } else if (threeChoice[1].checked) {
                preRequest = "OR";
            } else if (threeChoice[2].checked) {
                preRequest = "NONE";
            }
            let whereObj;
            whereObj = generateResult(kind, preRequest, conditions);
            return whereObj;
    }

    function getConditions(kind,rowList) {
        let conditions = [];
        for(let element of rowList) {
            let tmp0 = element.getElementsByClassName("control not")[0];
            let negate = tmp0.getElementsByTagName("input")[0].checked;
            let tmp1 = element.getElementsByClassName("control fields")[0].getElementsByTagName("select")[0];
            let selectTarget = tmp1.selectedIndex;
            let target = tmp1.options[selectTarget].value.trim().toLowerCase();
            let targetName = kind + "_" + target;
            let tmp2 = element.getElementsByClassName("control operators")[0].getElementsByTagName("select")[0];
            let selectCompare = tmp2.selectedIndex;
            let compare = tmp2.options[selectCompare].value.trim().toUpperCase();
            let tmp3 = element.getElementsByClassName("control term")[0];
            let standard = tmp3.getElementsByTagName("input")[0].value.trim();
            if (shouldBeNumber.includes(target)) {
                standard = Number(standard);
            }
            let oneCondition = {};
            if (negate) {
                let inside = {};
                inside[compare] = {};
                inside[compare][targetName] = standard;
                oneCondition["NOT"] = inside;
            } else {
                oneCondition[compare] = {};
                oneCondition[compare][targetName] = standard;
            }
            conditions.push(oneCondition);
        }
        return conditions;
    }

    function generateResult(kind, preRequest, conditions) {
        let whereObj = {};
        switch (conditions.length) {
            case 0:
                break;
            case 1:
                if(preRequest === "NONE") {
                    whereObj["NOT"] = conditions[0];
                } else {
                    whereObj = conditions[0];
                }
                break;
            default:
                if(preRequest === "NONE") {
                    whereObj["NOT"] = {};
                    whereObj["NOT"]["AND"] = conditions;
                } else if (preRequest === "ALL"){
                    whereObj["AND"] = conditions;
                } else if (preRequest === "OR"){
                    whereObj["OR"] = conditions;
                }
                break;
        }
        return whereObj;
    }

    function processOrderDir(kind) {
        if (kind === "courses") {
            let content = document.getElementsByClassName("control descending")[0];
            return content.getElementsByTagName("input")[0].checked;
        } else if (kind === "rooms") {
            let content = document.getElementsByClassName("control descending")[1];
            return content.getElementsByTagName("input")[0].checked;
        }
    }

    function processOrder(kind) {
        let Keys = ["avg", "dept", "id", "fail", "pass",
            "audit", "instructor", "name", "type", "seats",
            "title", "uuid", "lat", "lon", "year", "address",
            "shortname", "fullname", "number", "furniture", "href"];
        let order = [];

        function extractContents(temp) {
            let contents = temp.getElementsByTagName("option");
            for (let content of contents) {
                if (content.selected) {
                    let target = content.value.toLowerCase();
                    if (Keys.includes(target)) {
                        order.push(kind + "_" + target);
                    } else {
                        order.push(target);
                    }
                }
            }
        }
        if (kind === "courses") {
            let temp = document.getElementsByClassName("control order fields")[0];  // may be form-group order
            extractContents(temp);
        } else if (kind === "rooms") {
            let temp = document.getElementsByClassName("control order fields")[1];  // may be form-group order
            extractContents(temp);
        }
        return order;
    }

    function processColumns(kind) {
        let columns = [];
        function extractContents(temp) {
            let contents1 = temp.getElementsByClassName("control field");
            for (let content of contents1) {
                if (content.getElementsByTagName("input")[0].checked) {
                    let target = content.getElementsByTagName("input")[0].value;  // double check
                    columns.push(kind + "_" + target);
                }
            }
            let contents2 = temp.getElementsByClassName("control transformation");
            for (let content of contents2) {
                if (content.getElementsByTagName("input")[0].checked) {
                    let target = content.getElementsByTagName("input")[0].value;  // double check
                    columns.push(target);
                }
            }
        }
        if (kind === "rooms") {
            let temp = document.getElementsByClassName("form-group columns")[1].getElementsByClassName("control-group")[0];
            extractContents(temp);
        } else if (kind === "courses") {
            let temp = document.getElementsByClassName("form-group columns")[0].getElementsByClassName("control-group")[0];
            extractContents(temp);
        }
        return columns;
    }

    function extractTrans(kind) {
        let rowList = [];
        if(kind === "courses") {
            let allContent = document.getElementsByClassName("transformations-container")[0];
            rowList = allContent.getElementsByClassName("control-group transformation");
        } else if(kind === "rooms") {
            let allContent = document.getElementsByClassName("transformations-container")[1];
            rowList = allContent.getElementsByClassName("control-group transformation");
        }
        let transList = [];
        for(let element of rowList) {
            let tmp = element.getElementsByClassName("control term")[0];
            let name = tmp.getElementsByTagName("input")[0].value;
            let tmp1 = element.getElementsByClassName("control operators")[0].getElementsByTagName("select")[0];
            let selectKey = tmp1.selectedIndex;
            let key = tmp1.options[selectKey].value.trim().toUpperCase();
            let tmp2 = element.getElementsByClassName("control fields")[0].getElementsByTagName("select")[0];
            let selectTarget = tmp2.selectedIndex;
            let target = tmp2.options[selectTarget].value.trim().toLowerCase();
            let oneRule = {};
            oneRule[name] = {};
            oneRule[name][key] = kind + "_" + target;
            transList.push(oneRule);
        }
        return transList;
    }

    function processGroup(kind) {
        // let pieces = [];
        // if(kind === "courses") {
        //     let allContent = document.getElementsByClassName("form-group groups")[0];
        //     pieces = allContent.getElementsByClassName("control field");
        // } else if(kind === "rooms") {
        //     let allContent = document.getElementsByClassName("form-group groups")[1];
        //     pieces = allContent.getElementsByClassName("control field");
        // }
        // let groups = [];
        // for (let one of pieces) {
        //     let useful = one.getElementsByTagName("input")[0];
        //     if (useful.checked) {
        //         let newOne = useful.value.trim();
        //         groups.push(kind + "_" + newOne);
        //     }
        // }
        // return groups;
        let group = [];
        function extractContents(temp) {
            let contents1 = temp.getElementsByClassName("control field");
            for (let content of contents1) {
                if (content.getElementsByTagName("input")[0].checked) {
                    let target = content.getElementsByTagName("input")[0].value;  // double check
                    group.push(kind + "_" + target);
                }
            }
        }
        if (kind === "rooms") {
            let temp = document.getElementsByClassName("form-group groups")[1].getElementsByClassName("control-group")[0];
            extractContents(temp);
        } else if (kind === "courses") {
            let temp = document.getElementsByClassName("form-group groups")[0].getElementsByClassName("control-group")[0];
            extractContents(temp);
        }
        return group;
    }
