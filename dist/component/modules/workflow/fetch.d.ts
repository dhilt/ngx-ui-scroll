declare class Fetch {
    static pendingTop: boolean;
    static pendingBottom: boolean;
    static run(direction: any): Promise<{}>;
    static shouldLoadBottom(): boolean;
    static shouldLoadTop(): boolean;
    static runTop(): Promise<{}>;
    static runBottom(): Promise<{}>;
}
export default Fetch;
