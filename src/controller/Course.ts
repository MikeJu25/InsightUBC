export class Course {
    public dept: string;
    public id: string;
    public avg: number;
    public instructor: string;
    public title: string;
    public pass: number;
    public fail: number;
    public audit: number;
    public uuid: string;
    public year: number;

    constructor() {
        this.dept = null;
        this.id = null;
        this.avg = 0;
        this.instructor = null;
        this.title = null;
        this.pass = 0;
        this.fail = 0;
        this.audit = 0;
        this.uuid = null;
        this.year = 0;
    }
    // // getters
    // public getDept(): string {
    //     return this.dept;
    // }
    //
    // public getID(): string {
    //     return this.id;
    // }
    //
    // public getAvg(): number {
    //     return this.avg;
    // }
    //
    // public getInstructor(): string {
    //     return this.instructor;
    // }
    //
    // public getTitle(): string {
    //     return this.title;
    // }
    // public getPass(): number {
    //     return this.pass;
    // }
    // public getFail(): number {
    //     return this.fail;
    // }
    //
    // public getAudit(): number {
    //     return this.audit;
    // }
    //
    // public getUUID(): string {
    //     return this.uuid;
    // }
    //
    // public getYear(): number {
    //     return this.year;
    // }
    //
    // // setters
    // public setDept(dept: string) {
    //     this.dept = dept;
    // }
    //
    // public setID(courseID: string) {
    //     this.id = courseID;
    // }
    //
    // public setAvg(avg: number) {
    //     this.avg = avg;
    // }
    //
    // public setInstructor(instructor: string) {
    //     this.instructor = instructor;
    // }
    //
    // public setTitle(title: string) {
    //     this.title = title;
    // }
    // public setPass(pass: number) {
    //     this.pass = pass;
    // }
    // public setFail(fail: number) {
    //     this.fail = fail;
    // }
    //
    // public setAudit(audit: number) {
    //     this.audit = audit;
    // }
    //
    // public setUUID(uuid: string) {
    //     this.uuid = uuid;
    // }
    //
    // public setYear(year: number) {
    //     this.year = year;
    // }
}
