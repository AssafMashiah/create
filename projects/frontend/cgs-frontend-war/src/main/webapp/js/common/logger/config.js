define([], function () {
    var LogLevels = {
        ERROR: 'ERROR',
        WARN: 'WARN',
        INFO: 'INFO',
        AUDIT: 'AUDIT',
        DEBUG: 'DEBUG'
    };

    var LoggerConfig = {
        // We use this to sync time between client and server
        serverTimeSyncUrl: 'cgs/logging/serverDateTime?timezone=utc&dateformat=dd/MM/YYYY HH:mm:ss',

        LogLevels: LogLevels,

        // Log level
        logLevel: LogLevels.DEBUG,

        // When interval passes we flush all logs to server
        flushInterval: 30000, // milliseconds - 30 seconds

        // Logs database constants
        db: {
            version: 1, // Number should always increase if we're changing the schema, otherwise it will not work.
            name: 't2k-logs',
            schema: {
                logs: {
                    key: {
                        keyPath: 'id',
                        autoIncrement: true
                    }
                }
            }
        },

        logCategory: {
            LOGGER: "LOGGER",
            GENERAL: "GENERAL",
            EDITOR: "EDITOR",
            SAVE: "SAVE",

            CLIPBOARD: "CLIPBOARD",
            FILES: "FILES",
            ASSETS: "ASSETS",
            REPO: "REPO",
            APPLETS: "APPLETS",
            COURSE: "COURSE",
            PLUGIN: "PLUGIN",
            LESSON: "LESSON",
            PUBLISH: "PUBLISH",
            STANDARDS: "STANDARDS",
            DIALOG: "DIALOG",
            LOCK: "LOCK",
            NOTIFICATIONS: "NOTIFICATIONS",
            BUSY: "BUSY-INDICATOR",
            FILE_UPLOAD: "FILE_UPLOAD",
            CONNECTION: "CONNECTION"
        }
    };

    return LoggerConfig;
});
