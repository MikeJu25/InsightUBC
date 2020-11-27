import * as chai from "chai";
import {expect} from "chai";
import * as fs from "fs-extra";
import * as chaiAsPromised from "chai-as-promised";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any;  // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string;  // This is injected when reading the file
}

describe("InsightFacade Add/Remove/List Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        diffName: "./test/data/diffName.zip",
        emptyCourse: "./test/data/emptyCourse.zip",
        lessCourse: "./test/data/lessCourse.zip",
        sameId1: "./test/data/sameId1.zip",
        sameId2: "./test/data/sameId2.zip",
        invalidFileType: "./test/data/invalidFileType.zip",
        noSection: "./test/data/noSection.zip",
        coursesDox: "./test/data/courses.docx",
        rooms: "./test/data/rooms.zip",
        // roomsLoss: "./test/data/rooms (loss).zip",
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        chai.use(chaiAsPromised);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs.readFileSync(datasetsToLoad[id]).toString("base64");
        }
        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs after each test, which should make each test independent from the previous one
        Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    // This is a unit test. You should create more like this!
    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    // it("Should add a smaller valid dataset", function () {
    //     const id: string = "lessCourse";
    //     const expected: string[] = [id];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     );
    //     return expect(futureResult).to.eventually.deep.equal(expected);
    // });
    // it("Should add two valid datasets", function () {
    //     const id1: string = "lessCourse";
    //     const id2: string = "sameId1";
    //     const expected: string[] = [id1, id2];
    //     return insightFacade.addDataset(
    //         id1,
    //         datasets[id1],
    //         InsightDatasetKind.Courses,
    //     ).then((result: string[]) => {
    //         return insightFacade.addDataset(
    //             id2,
    //             datasets[id2],
    //             InsightDatasetKind.Courses);
    //     }).then((futureResult: string[]) => {
    //         expect(futureResult).to.eventually.deep.equal(expected);
    //     }).catch((err: any) => {
    //         expect.fail(err, expected, "this test will not fail");
    //     });
    // });
    // it("fail when there is a different folder name ", function () {
    //     const id: string = "diffName";
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((futureResult: string[]) => {
    //         expect.fail("there is a different folder name");
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(InsightError, "The folder name is different");
    //     });
    // });
    //
    // it("fail when there is the next invalid folder name ", function () {
    //     const id: string = "co_ur_ses";
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((futureResult: string[]) => {
    //         expect.fail("there is the next invalid folder name");
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(InsightError, "The folder name is invalid");
    //     });
    // });
    //
    // it("fail when there is a invalid ID ", function () {
    //     const id: string = "courses";
    //     return insightFacade.addDataset(
    //         null,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((futureResult: string[]) => {
    //         expect.fail("there is invalid ID");
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(InsightError, "The ID is invalid");
    //     });
    // });
    //
    // it("fail when file type is invalid ", function () {
    //     const id: string = "invalidFileType";
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((futureResult: string[]) => {
    //         expect.fail("there is invalid file type");
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(InsightError, "The file is invalid");
    //     });
    // });
    // it("fail when zip type is invalid ", function () {
    //     const id: string = "coursesDox";
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((futureResult: string[]) => {
    //         expect.fail("there is invalid zip type");
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(InsightError, "The file is invalid");
    //     });
    // });
    // it("fail when miss key ", function () {
    //     const id: string = "sectionNoKey";
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((futureResult: string[]) => {
    //         expect.fail("the file miss key");
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(InsightError, "The file is invalid");
    //     });
    // });
    //
    // it("fail when adding duplicated Id ", function () {
    //     const id: string = "courses";
    //     const id2: string = "courses";
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((result: string[]) => {
    //         return insightFacade.addDataset(
    //             id2,
    //             datasets[id2],
    //             InsightDatasetKind.Courses);
    //     }).then((futureResult: string[]) => {
    //         expect.fail();
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(InsightError, "The ID of two datasets are duplicated");
    //     });
    // });
    // it("fail when id and the next part are different ", function () {
    //     const id: string = "emptyCourse";
    //     const next: string = "second";
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[next],
    //         InsightDatasetKind.Courses,
    //     ).then((futureResult: string[]) => {
    //         expect.fail("the id and the next part is different");
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(InsightError, "the id and the next part is different");
    //     });
    // });
    // // Below are tests for listDatasets.
    // it("list empty dataset", function () {
    //     return insightFacade.listDatasets().then((result: InsightDataset[]) => {
    //             expect(result.length).to.equal(0);
    //         }
    //     ).catch((err: any) => {
    //         expect.fail(err, 0, "this test should pass");
    //     });
    // });
    //
    // it("list one dataset", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((result: string[]) => {
    //         return insightFacade.listDatasets();
    //     }).then((result1: InsightDataset[]) => {
    //         expect(result1.length).to.equal(1);
    //     }).catch((err: any) => {
    //         expect.fail(err, 1, "this test should pass");
    //     });
    // });
    // it("show one dataset", function () {
    //     const id: string = "courses";
    //     const expected: string[] = [id];
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((result: string[]) => {
    //         return insightFacade.listDatasets();
    //     }).then((result1: InsightDataset[]) => {
    //         expect(result1).to.be.deep.include.members(
    //             [{id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612}]);
    //     });
    // });
    // it("list two datasets", function () {
    //     const id1: string = "lessCourse";
    //     const id2: string = "rooms";
    //     const expected: string[] = [id1, id2];
    //     return insightFacade.addDataset(
    //         id1,
    //         datasets[id1],
    //         InsightDatasetKind.Courses,
    //     ).then((result: string[]) => {
    //         return insightFacade.addDataset(
    //             id2,
    //             datasets[id2],
    //             InsightDatasetKind.Rooms);
    //     }).then((result1: string[]) => {
    //         return insightFacade.listDatasets();
    //     }).then((result2: InsightDataset[]) => {
    //         expect(result2.length).to.equal(2);
    //     }).catch((err: any) => {
    //         expect.fail(err, 2, "this test should pass");
    //     });
    // });
    // // Below are tests for removeDatasets
    // it("remove an existing dataset", function () {
    //     const id: string = "rooms";
    //     const expected: string = id;
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Rooms,
    //     ).then((result: string[]) => {
    //         return insightFacade.removeDataset(id);
    //     }).then((result2: string) => {
    //         expect(result2).to.equal(expected);
    //     }).catch((err: any) => {
    //         expect.fail(err, expected, "this test should pass");
    //     });
    // });
    // it("remove when there is no dataset exist", function () {
    //     const id: string = "courses";
    //     return insightFacade.removeDataset(id).then((result: string) => {
    //         expect.fail();
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(NotFoundError, "No dataset exist");
    //     });
    // });
    // it("remove by a not exist id", function () {
    //     const id: string = "courses";
    //     const id1: string = "lessCourse";
    //     const expected: string = id;
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((result: string[]) => {
    //         return insightFacade.removeDataset(id1);
    //     }).then((result2: string) => {
    //         expect.fail();
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(NotFoundError, "there is no dataset");
    //     });
    // });
    // it("remove by a invalid id", function () {
    //     const id: string = "courses";
    //     const id1: string = "";
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((result: string[]) => {
    //         return insightFacade.removeDataset(id1);
    //     }).then((result2: string) => {
    //         expect.fail();
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(InsightError, "there is no dataset");
    //     });
    // });
    // it("duplicated removed", function () {
    //     const id: string = "courses";
    //     const expected: string = id;
    //     return insightFacade.addDataset(
    //         id,
    //         datasets[id],
    //         InsightDatasetKind.Courses,
    //     ).then((result: string[]) => {
    //         return insightFacade.removeDataset(id);
    //     }).then((result1: string) => {
    //         return insightFacade.removeDataset(id);
    //     }).then((result2: string) => {
    //         expect.fail();
    //     }).catch((err: any) => {
    //         expect(err).to.be.instanceOf(NotFoundError, "reject duplicated will fail");
    //     });
    // });
    it("Should add a valid room dataset", function () {
        const id: string = "rooms";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Should not add dataset: kind error", function () {
        const id: string = "rooms";
        const futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Courses);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: { [id: string]: { path: string, kind: InsightDatasetKind } } = {
        courses: {path: "./test/data/courses.zip", kind: InsightDatasetKind.Courses},
        rooms: {path: "./test/data/rooms.zip", kind: InsightDatasetKind.Rooms},
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        chai.use(chaiAsPromised);
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail("", "", `Failed to read one or more test queries. ${err}`);
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(insightFacade.addDataset(id, data, ds.kind));
        }
        return Promise.all(loadDatasetPromises).catch((err) => {
            return Promise.resolve("HACK TO LET QUERIES RUN");
        });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    const futureResult: Promise<any[]> = insightFacade.performQuery(test.query);
                    return TestUtil.verifyQueryResult(futureResult, test);
                });
            }
        });
    });
});
