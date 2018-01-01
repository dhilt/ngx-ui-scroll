declare class Data {
    static scrollerId: any;
    static source: any;
    static startIndex: number;
    static bufferSize: number;
    static padding: number;
    static items: any[];
    static bof: boolean;
    static eof: boolean;
    static position: number;
    static lastIndex: any;
    static setSource(datasource: any): void;
    static setScrollerId(): void;
    static getItemId(index: number): string;
    static getFirstVisibleItemIndex(): number;
    static getFirstVisibleItem(): any;
    static getLastVisibleItemIndex(): number;
    static getLastVisibleItem(): any;
    static initialize(context: any): void;
}
export default Data;
