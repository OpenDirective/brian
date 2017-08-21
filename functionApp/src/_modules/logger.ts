type Logger = (s: String) => void | undefined
let _logger: Logger

export function setLogger(logger: Logger): void {
    _logger = logger
}

export function log(o: Object): void {
    if (_logger) {
        _logger(JSON.stringify(o, undefined, 4))
    }
}
