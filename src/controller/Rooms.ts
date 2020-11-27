import {Room} from "./Room";
import {InsightDatasetKind} from "./IInsightFacade";

export class Rooms {
    public id: string;
    public kind: InsightDatasetKind;
    public numRows: number;
    public roomCollection: Room[];

    constructor() {
        this.id = null;
        this.kind = null;
        this.numRows = 0;
        this.roomCollection = [];
    }
}
