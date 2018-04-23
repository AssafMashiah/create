define(['log4javascript', 'BrowserDbToAjaxAppender', 'common/logger/config'],
    function (log4javascript, BrowserDbToAjaxAppender, config) {

        var browserDbToAjaxAppender;

        var Logger = function () {
            this.init();
        };

        Logger.prototype = {
            category: config.logCategory,
            LogLevels: config.LogLevels,

            init: function () {
                // Create the logger
                this.log4javascriptLogger = log4javascript.getLogger();

                // Only for initialization - We set the level in userModel.init on main.js
                this.setLogLevel(config.logLevel);

                // Create appenders and add them to logger
                createAppenders.call(this);

                // Create the custom AUDIT log level
                createAuditLevel.call(this);
            },

            setLogLevel: function (logLevel) {
                this.log4javascriptLogger.setLevel(log4javascript.Level[logLevel]);
            },

            sendLogsToServer: function () {
                browserDbToAjaxAppender.sendLogsToServer();
            }
        };

        var createAppenders = function () {
            // Create appenders and add them to logger
            browserDbToAjaxAppender = new log4javascript.BrowserDbToAjaxAppender();
            var browserConsoleAppender = new log4javascript.BrowserConsoleAppender();
            this.log4javascriptLogger.addAppender(browserDbToAjaxAppender);
            this.log4javascriptLogger.addAppender(browserConsoleAppender);
        };

        var createAuditLevel = function () {
            // Add audit level
            log4javascript.Level.AUDIT = new log4javascript.Level(25000, "AUDIT");

            this.log4javascriptLogger.audit = function () {
                this.log(log4javascript.Level.AUDIT, arguments);
            };
        };

        var createLoggingMethods = function () {
            // We create the logging methods according to the log levels in the config
            var logLevel;
            for (logLevel in config.LogLevels) {
                logLevel = logLevel.toLowerCase();
                (function (logLevel) {
                    Logger.prototype[logLevel] = function () {
                        this.log4javascriptLogger[logLevel].apply(this.log4javascriptLogger, arguments);
                    };
                })(logLevel);
            }
        };

        createLoggingMethods();

        // Place logger in window so everyone everywhere can enjoy it
        window.logger = new Logger();

        return window.logger;
    });
