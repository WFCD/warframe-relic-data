"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const console = __importStar(require("node:console"));
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["FATAL"] = -1] = "FATAL";
    LogLevel[LogLevel["ERROR"] = 0] = "ERROR";
    LogLevel[LogLevel["LOG"] = 1] = "LOG";
    LogLevel[LogLevel["DEBUG"] = 2] = "DEBUG";
})(LogLevel || (LogLevel = {}));
const fromString = (logLevelIsh) => {
    switch (logLevelIsh?.toLowerCase()) {
        case 'fatal':
            return LogLevel.FATAL;
        case 'error':
        case 'bad':
            return LogLevel.ERROR;
        case 'info':
        case 'log':
            return LogLevel.LOG;
        case 'debug':
            return LogLevel.DEBUG;
        default:
            return LogLevel.FATAL;
    }
};
class Logger {
    logLevel = fromString(process.env.LOG_LEVEL || 'fatal');
    // constructor() {
    //     process.on('uncaughtException', this.fatal);
    //     process.on('unhandledRejection', this.fatal);
    // }
    // unlink() {
    //     process.off('uncaughtException', this.fatal);
    //     process.off('unhandledRejection', this.fatal);
    // }
    log(message) {
        if (this.logLevel >= LogLevel.LOG)
            console.log(message);
    }
    error(message) {
        if (this.logLevel >= LogLevel.ERROR)
            console.error(message);
    }
    debug(message) {
        if (this.logLevel === LogLevel.DEBUG)
            console.debug(message);
    }
    fatal(message) {
        if (this.logLevel >= LogLevel.FATAL) {
            console.error(`FATAL: ${message}`);
            throw new Error(message);
        }
    }
}
exports.default = new Logger();
//# sourceMappingURL=Logger.js.map