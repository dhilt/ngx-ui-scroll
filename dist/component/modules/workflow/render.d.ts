declare class Render {
    static renderPending: boolean;
    static run(items?: any, direction?: any): Promise<{}>;
    static setElements(items: any): void;
}
export default Render;
