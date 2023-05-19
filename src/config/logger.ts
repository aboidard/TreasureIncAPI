import { format, createLogger, transports } from 'winston'

export default createLogger({
    transports:
        [/*new transports.File({
            dirname: 'logs',
            filename: 'treasure-inc-api.log',
            format: format.combine(
                format.timestamp({ format: 'MMM-DD-YYYY HH:mm:ss' }),
                format.align(),
                format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
            )
        }),*/
            new transports.Console({})]
})

if (process.env.NODE_ENV !== 'production') {
    //     logger.add(new transports.Console({
    //         format: format.combine(
    //             format.colorize(),
    //             format.simple()
    //         ),
    //         eol: '\r\n',
    //     }));
}
