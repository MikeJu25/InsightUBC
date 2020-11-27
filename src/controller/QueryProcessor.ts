export class QueryProcessor {
    public logic: any[] = ["AND", "OR"];
    public mcomparater: any[] = ["LT", "GT", "EQ"];

    public mutualRecursion(body: any[], data: any[]): boolean {
        let getKeys: any[] = Object.keys(body);
        let theKeyName: any = getKeys[0];
        let content: any[] = body[theKeyName];
        if (this.logic.includes(theKeyName)) {
            return this.logical(theKeyName, content, data);
        }
        if (this.mcomparater.includes(theKeyName)) {
            return this.mComporison(theKeyName, content, data);
        }
        if (theKeyName === "IS") {
            return this.IS(content, data);
        }
        if (theKeyName === "NOT") {
            return (!this.mutualRecursion(content, data));
        }
    }

    public IS(content: any[], data: any[]): boolean {
        let getKeysIs: any[] = Object.keys(content);
        let theKeyNameIs: any = getKeysIs[0];
        let tmp: any[] = theKeyNameIs.split("_");
        let dataKey: any = tmp[1];
        let contentIs: string = content[theKeyNameIs];
        if ((contentIs.charAt(0) === "*")) {
            if ((contentIs.charAt(contentIs.length - 1)) !== "*") {
                let newContent = contentIs.substring(1);
                let length: number = newContent.length;
                let current: string = data[dataKey];
                return (current.substring((current.length - length), current.length) === newContent);
            } else if ((contentIs.charAt(contentIs.length - 1)) === "*") {
                let newContent1 = contentIs.substring(1, (contentIs.length - 1));
                let current1: string = data[dataKey];
                return (current1.includes(newContent1));
            }
        } else {
            if ((contentIs.charAt(contentIs.length - 1)) === "*") {
                let newContent2 = contentIs.substring(0, (contentIs.length - 1));
                let length2: number = newContent2.length;
                let current2: string = data[dataKey];
                return (current2.substring(0, length2) === newContent2);
            } else {
                return (data[dataKey] === contentIs);
            }
        }
    }

    public mComporison(key: any, content: any[], data: any[]): boolean {
        let getKeys: any[] = Object.keys(content);
        let theKeyName: any = getKeys[0];
        let tmp: any[] = theKeyName.split("_");
        let dataKey: any = tmp[1];
        if (key === "GT") {
            let newContent: number = content[theKeyName];
            return (data[dataKey] > newContent);
        }
        if (key === "LT") {
            let newContent: number = content[theKeyName];
            return (data[dataKey] < newContent);
        }
        if (key === "EQ") {
            let newContent: string = content[theKeyName];
            return (data[dataKey] === newContent);
        }
    }

    public logical(key: any, content: any[], data: any[]): boolean {
        if (key === "AND") {
            for (let element of content) {
                if (!(this.mutualRecursion(element, data))) {
                    return false;
                }
            }
            return true;
        }
        if (key === "OR") {
            for (let element of content) {
                if ((this.mutualRecursion(element, data))) {
                    return true;
                }
            }
            return false;
        }
    }
}
