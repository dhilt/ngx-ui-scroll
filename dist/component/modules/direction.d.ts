declare class Direction {
    static top: string;
    static bottom: string;
    static opposite(direction: string): string;
    static byScrollTop(): string;
    static isValid(value: any): boolean;
}
export default Direction;
