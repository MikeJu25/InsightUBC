import {IScheduler, SchedRoom, SchedSection, TimeSlot} from "./IScheduler";

export default class Scheduler implements IScheduler {
    public roomAvailableTimeMap: Map<SchedRoom, TimeSlot[]> = new Map<SchedRoom, TimeSlot[]>();
    private allTimes: TimeSlot[] = ["MWF 0800-0900", "MWF 0900-1000", "MWF 1000-1100",
        "MWF 1100-1200", "MWF 1200-1300", "MWF 1300-1400",
        "MWF 1400-1500", "MWF 1500-1600", "MWF 1600-1700",
        "TR  0800-0930", "TR  0930-1100", "TR  1100-1230",
        "TR  1230-1400", "TR  1400-1530", "TR  1530-1700"];

    /**
     * Schedule course sections into rooms
     *
     * @param sections
     * An array of course sections to be scheduled
     *
     * @param rooms
     * An array of rooms for sections to be scheduled into
     *
     * @return Array<[SchedRoom, SchedSection, TimeSlot]>
     * return a timetable, which is an array of [room, section, time slot] assignment tuples
     */
    // public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
    //     let that = this;
    //     let timeTable: Array<[SchedRoom, SchedSection, TimeSlot]> = [];
    //     let sortedSections = this.sortSections(sections);
    //     for (let i of rooms) {
    //         that.roomAvailableTimeMap.set(i, this.allTimes);
    //     }
    //     for (let j of sortedSections) {
    //         let availableRooms = this.getRoomsAvailable(j, rooms);
    //         let anElement: [SchedRoom, SchedSection, TimeSlot];
    //         let occupiedTime = this.getSectionBookedTime(j, timeTable);
    //         for (let element of availableRooms) {
    //             let fittedRoom = this.findFitRoom(j, availableRooms);
    //             let fittedTime = this.findFitTime(this.roomAvailableTimeMap.get(fittedRoom), occupiedTime);
    //             if (typeof fittedTime !== null) {
    //                 if (this.roomAvailableTimeMap.get(fittedRoom).indexOf(fittedTime) > -1) {
    //                     this.roomAvailableTimeMap.get(fittedRoom)
    //                         .splice(this.roomAvailableTimeMap.get(fittedRoom).indexOf(fittedTime), 1);
    //                 }
    //                 anElement = [fittedRoom, j, fittedTime];
    //                 timeTable.push(anElement);
    //                 break;
    //             } else {
    //                 if (availableRooms.indexOf(fittedRoom) > -1) {
    //                     availableRooms
    //                         .splice(availableRooms.indexOf(fittedRoom), 1);
    //                 }
    //             }
    //         }
    //     }
    //     return timeTable;
    // }

    public schedule(sections: SchedSection[], rooms: SchedRoom[]): Array<[SchedRoom, SchedSection, TimeSlot]> {
        let timeTable: Array<[SchedRoom, SchedSection, TimeSlot]> = [];
        let sortedSections = this.sortSections(sections);
        this.roomAvailableTimeMap = new Map<SchedRoom, TimeSlot[]>();
        for (let i of rooms) {
            this.roomAvailableTimeMap.set(i, this.allTimes);
        }
        for (let j of sortedSections) {
            let availableRooms = this.getRoomsAvailable(j, rooms);
            let anElement: [SchedRoom, SchedSection, TimeSlot] = null;
            let occupiedTime = this.getSectionBookedTime(j, timeTable);
            anElement = this.generateElement(availableRooms, anElement, occupiedTime, j, timeTable);
            if (anElement !== null) {
                timeTable.push(anElement);
            }
        }
        return timeTable;
    }

    public generateElement(availableRooms: any[], anElement: any, occupiedTime: any[], j: any,
                           timeTable: Array<[SchedRoom, SchedSection, TimeSlot]>) {
        while (availableRooms.length !== 0) {
            let fittedRoom = this.findFitRoom(j, availableRooms, timeTable);
            let fittedTime = this.findFitTime(this.roomAvailableTimeMap.get(fittedRoom), occupiedTime);
            let bookedRooms = [];
            let b = false;
            if (typeof fittedTime !== null) {
                if (this.roomAvailableTimeMap.get(fittedRoom).indexOf(fittedTime) > -1) {
                    this.roomAvailableTimeMap.get(fittedRoom)
                        .splice(this.roomAvailableTimeMap.get(fittedRoom).indexOf(fittedTime), 1);
                }
                for (let element of timeTable) {
                    bookedRooms.push(element[0]);
                }
                for (let room of bookedRooms) {
                    if (room.rooms_number === fittedRoom.rooms_number) {
                        for (let element of timeTable) {
                            if (room.rooms_number === element[0].rooms_number) {
                                if (element[2] === fittedTime) {
                                    b = true;
                                }
                            }
                        }
                    }
                }
                if (b === false) {
                    anElement = [fittedRoom, j, fittedTime];
                    return anElement;
                } else {
                    if (availableRooms.indexOf(fittedRoom) > -1) {
                        availableRooms
                            .splice(availableRooms.indexOf(fittedRoom), 1);
                    }
                }
            } else {
                if (availableRooms.indexOf(fittedRoom) > -1) {
                    availableRooms
                        .splice(availableRooms.indexOf(fittedRoom), 1);
                }
            }
        }
        return null;
    }

    // return the most fitable room whose capacity is cloesest to the section's enrollment
    public findFitRoom(course: any, roomList: any[], timeTable: Array<[SchedRoom, SchedSection, TimeSlot]>) {
        let neededSeats = this.getSectionSeats(course);
       // let initialRoomSeat = this.getRoomCapacity(roomList[0]);
       // let justify = initialRoomSeat - neededSeats;
       // let EValue = this.calculateEValue(initialRoomSeat, neededSeats);
        let fitRoom: SchedRoom;
        let score: number = 0;
        for (let element of roomList) {
            let roomSeats = this.getRoomCapacity(element);
            // if (this.calculateEValue(roomSeats, neededSeats) < EValue) {
            //     fitRoom = element;
            //     justify = roomSeats - neededSeats;
            // }
            let EValue = this.calculateEValue(roomSeats, neededSeats);
            let maxDistance = this.calculateMaxDistance(element, timeTable);
            let tempScore = this.evaluateRoom(EValue, maxDistance);
            if (tempScore > score) {
                score = tempScore;
                fitRoom = element;
            }
        }
        return fitRoom;
    }

    public calculateEValue(roomSeats: number, neededSeats: number): number {
        return neededSeats / roomSeats;
    }

    public calculateMaxDistance(targetRoom: SchedRoom, timeTable: Array<[SchedRoom, SchedSection, TimeSlot]>): number {
        let roomAdded = [];
        let maxDistance = 0;
        for (let element of timeTable) {
            roomAdded.push(element[0]);
        }
        for (let room of roomAdded) {
            let tempDistance = this.getDistance(room, targetRoom);
            if (tempDistance > maxDistance) {
                maxDistance = tempDistance;
            }
        }
        return maxDistance;
    }

    public evaluateRoom(EValue: number, maxDistance: number): number {
        return 0.7 * EValue + 0.3 * (1 - (maxDistance / 1372));
    }

    // return any of the available time slot that is not occupied by other sections of this course, given all possible
    // time slots
    public findFitTime(times: any[], occupied: any[]) {
        for (let piece of times) {
            if (!occupied.includes(piece)) {
                return piece;
            }
        }
    }

    /**
     * sort sections from with most seats to the least
     *
     * @param toBeSorted
     * An array of course sections to be scheduled
     *
     * @return SchedSection[]
     * return a list of sorted sections
     */
    public sortSections(toBeSorted: SchedSection[]): SchedSection[] {
        return toBeSorted.sort((a, b) => {
            let Alarger: boolean = false;
            let Blarger: boolean = false;
            if (this.getSectionSeats(a) > this.getSectionSeats(b)) {
                Alarger = true;
            } else {
                Blarger = true;
            }
            return Alarger ? -1 : Blarger ? 1 : 0;
        });
    }

    // private after test
    public getSectionSeats(section: SchedSection): number {
        return section.courses_pass + section.courses_fail + section.courses_audit;
    }

    public getRoomCapacity(room: SchedRoom): number {
        return room.rooms_seats;
    }

    /**
     * get all the possible rooms that can accomodate the section
     *
     * @return SchedRoom[]
     * return a list of all possible rooms
     */
    public getRoomsAvailable(section: SchedSection, rooms: SchedRoom[]): SchedRoom[] {
        let availableRooms = [];
        let sectionSeats = this.getSectionSeats(section);
        for (let i of rooms) {
            let roomCapacity = this.getRoomCapacity(i);
            if (sectionSeats <= roomCapacity) {
                availableRooms.push(i);
            }
        }
        return availableRooms;
    }

    /**
     *
     * @return TimeSlot[]
     * return a list of all timeSlots that different sections of this course have booked
     */
    public getSectionBookedTime(section: SchedSection, times: Array<[SchedRoom, SchedSection, TimeSlot]>): TimeSlot[] {
        let bookedTime: TimeSlot[] = [];
        for (let i of times) {
            let tempSection = i[1];
            let tempTime = i[2];
            if (tempSection.courses_dept === section.courses_dept) {
                if (tempSection.courses_id === section.courses_id) {
                    // if two sections are of the same course
                    bookedTime.push(tempTime);
                }
            }
        }
        return bookedTime;
    }

    public getAvailableTime(room: SchedRoom, map: Map<SchedRoom, TimeSlot[]>): TimeSlot[] {
        return map.get(room);
    }

    public getDistance(room1: SchedRoom, room2: SchedRoom): number {
        let lat1 = room1.rooms_lat;
        let lat2 = room2.rooms_lat;
        let lon1 = room1.rooms_lon;
        let lon2 = room2.rooms_lon;
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // in metres
    }
}
