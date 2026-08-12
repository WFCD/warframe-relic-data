import * as console from 'node:console';

enum LogLevel {
  FATAL = -1,
  ERROR,
  LOG,
  DEBUG,
}

const fromString = (logLevelIsh: string): LogLevel => {
  switch (logLevelIsh?.toLowerCase()) {
    case 'bad':
    case 'error':
      return LogLevel.ERROR;
    case 'debug':
      return LogLevel.DEBUG;
    case 'fatal':
      return LogLevel.FATAL;
    case 'info':
    case 'log':
      return LogLevel.LOG;
    default:
      return LogLevel.FATAL;
  }
};

class Logger {
  private readonly logLevel: LogLevel = fromString(process.env.LOG_LEVEL ?? 'fatal');

  debug(message: string) {
    if (this.logLevel === LogLevel.DEBUG) console.debug(message);
  }

  error(message: string) {
    if (this.logLevel >= LogLevel.ERROR) console.error(message);
  }

  fatal(message: string) {
    if (this.logLevel >= LogLevel.FATAL) {
      console.error(`FATAL: ${message}`);
      throw new Error(message);
    }
  }

  log(message: string) {
    if (this.logLevel >= LogLevel.LOG) console.log(message);
  }
}

export default new Logger();
