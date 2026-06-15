type LogMeta = Record<string, unknown>;

const formatMessage = (scope: string, message: string): string =>
  `${scope} » ${message}`;

export const logger = {
  info: (scope: string, message: string, meta?: LogMeta): void => {
    if (meta) {
      console.info(formatMessage(scope, message), meta);
    } else {
      console.info(formatMessage(scope, message));
    }
  },
  error: (scope: string, message: string, meta?: LogMeta): void => {
    if (meta) {
      console.error(formatMessage(scope, message), meta);
    } else {
      console.error(formatMessage(scope, message));
    }
  },
};
