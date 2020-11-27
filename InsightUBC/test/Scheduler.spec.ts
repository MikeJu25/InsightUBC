import Scheduler from "../src/scheduler/Scheduler";
import {SchedRoom, SchedSection, TimeSlot} from "../src/scheduler/IScheduler";
import InsightFacade from "../src/controller/InsightFacade";
import Server from "../src/rest/Server";
import Log from "../src/Util";
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import {expect} from "chai";
import * as assert from "assert";
// import  from "../src/scheduler/IScheduler"

describe("tests for scheduler", function () {
    let scheduler: Scheduler;
    let section1: SchedSection;

    let section2: SchedSection;

    let section3: SchedSection;

    let section4: SchedSection;

    let room1: SchedRoom;

    let room2: SchedRoom;

    let room3: SchedRoom;

    let room4: SchedRoom;

    let timeSlot1: TimeSlot = "MWF 0800-0900";

    let timeSlot2: TimeSlot = "MWF 0900-1000";

    before(function () {
        scheduler = new Scheduler();
    });

    after(function () {
       // may add logging
    });

    beforeEach(function () {
        section1 = {courses_dept: "cpsc", courses_id: "304", courses_uuid: "1000", courses_pass: 200,
            courses_fail: 2, courses_audit: 3,           // 205
            courses_avg: 85, courses_year: 2012};
        section2 = {courses_dept: "cpsc", courses_id: "304", courses_uuid: "1001", courses_pass: 100,
            courses_fail: 2, courses_audit: 1,            // 103
            courses_avg: 84, courses_year: 2020};
        section3 = {courses_dept: "biol", courses_id: "112", courses_uuid: "1002", courses_pass: 120,
            courses_fail: 5, courses_audit: 10,            // 135
            courses_avg: 84, courses_year: 2020};
        section4 = {courses_dept: "cpsc", courses_id: "310", courses_uuid: "1003", courses_pass: 300,
            courses_fail: 0, courses_audit: 0,            // 300
            courses_avg: 84, courses_year: 2020};
        room1 = {
            rooms_shortname: "ESB",
            rooms_number: "1014",
            rooms_seats: 103,
            rooms_lat: 49.2699,
            rooms_lon: -123.25318,
        };
        room2 = {
            rooms_shortname: "ESB",
            rooms_number: "1015",
            rooms_seats: 204,
            rooms_lat: 49.2699,
            rooms_lon: -123.25318,
        };
        room3 = {
            rooms_shortname: "ESB",
            rooms_number: "1016",
            rooms_seats: 381,
            rooms_lat: 49.2699,
            rooms_lon: -123.25318,
        };
        room4 = {
            rooms_shortname: "ICCS",
            rooms_number: "014",
            rooms_seats: 306,
            rooms_lat: 49.26958,
            rooms_lon: -123.25741,
    };
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
    });

    it("should correctly schedule one section to one room", function () {
        let sections: SchedSection[] = [];
        sections.push(section1);
        let rooms: SchedRoom[] = [];
        rooms.push(room3);
        let result = scheduler.schedule(sections, rooms);
        let expectedResult = [[room3, section1, timeSlot1]];
        expect(result).to.be.equal(expectedResult);
    });

    it("should correctly schedule two sections to one room", function () {
        let sections: SchedSection[] = [];
        sections.push(section1);
        sections.push(section2);
        let rooms: SchedRoom[] = [];
        rooms.push(room1);
        let result = scheduler.schedule(sections, rooms);
        let expectedResult = [[room1, section2, timeSlot1]];
        expect(result).to.be.equal(expectedResult);
    });

    it("should correctly schedule two sections of same course to two rooms", function () {
        let sections: SchedSection[] = [];
        sections.push(section1);
        sections.push(section2);
        let rooms: SchedRoom[] = [];
        rooms.push(room1);
        rooms.push(room4);
        const result: Array<[SchedRoom, SchedSection, TimeSlot]> = scheduler.schedule(sections, rooms);
        const expectedResult: Array<[SchedRoom, SchedSection, TimeSlot]> =
            [[room4, section1, timeSlot1], [room1, section2, timeSlot2]];
        return expect(result).equal(expectedResult);
    });

    it("should correctly schedule one sections to two rooms", function () {
        let sections: SchedSection[] = [];
        sections.push(section1);
        let rooms: SchedRoom[] = [];
        rooms.push(room3);
        rooms.push(room4);
        let result = scheduler.schedule(sections, rooms);
        let expectedResult = [[room4, section1, timeSlot1]];
        assert.equal(result, expectedResult);
    });

    it("should correctly schedule four sections to four rooms", function () {
        let sections: SchedSection[] = [];
        sections.push(section1);
        sections.push(section2);
        sections.push(section3);
        sections.push(section4);
        let rooms: SchedRoom[] = [];
        rooms.push(room1);
        rooms.push(room2);
        rooms.push(room3);
        rooms.push(room4);
        let result = scheduler.schedule(sections, rooms);
        let expectedResult = [[room3, section1, timeSlot1]];
        expect(result).to.be.equal(expectedResult);
    });
});
