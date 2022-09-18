declare class Logger {
    private readonly logLevel;
    log(message: string | unknown): void;
    error(message: string | unknown): void;
    debug(message: string | unknown): void;
    fatal(message: string): void;
}
declare const _default: Logger;
export default _default;
