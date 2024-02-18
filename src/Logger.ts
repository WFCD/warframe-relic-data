import * as console from 'node:console';

enum LogLevel {
  FATAL = -1,
  ERROR,
  LOG,
  DEBUG,
}

const fromString = (logLevelIsh: string): LogLevel => {
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
  private readonly logLevel: LogLevel = fromString(process.env.LOG_LEVEL || 'fatal');

  log(message: string) {
    if (this.logLevel >= LogLevel.LOG) console.log(message);
  }

  error(message: string) {
    if (this.logLevel >= LogLevel.ERROR) console.error(message);
  }

  debug(message: string) {
    if (this.logLevel === LogLevel.DEBUG) console.debug(message);
  }

  fatal(message: string) {
    if (this.logLevel >= LogLevel.FATAL) {
      console.error(`FATAL: ${message}`);
      throw new Error(message);
    }
  }
}

export default new Logger();
