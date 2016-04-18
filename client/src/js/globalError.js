// capture and display any error that would otherwise get missed
/* eslint-disable no-alert */
/* eslint-disable immutable/no-mutation */

function addGlobalErrorHandler(useAlert = false) {
  window.onerror = (msg, url, line, col, error) => {
    const colTxt = col ? `\ncolumn: ${col}` : ''
    const errTxt = error ? `\nerror: ${error}` : ''
    const extra = `${colTxt} ${errTxt}`

    const message = `Error: ${msg}\nurl: ${url}\nline: ${line} ${extra}`
    const logger = useAlert ? alert : console.log
    logger(message)

    const suppressErrorAlert = true
    return suppressErrorAlert
  }
}

export default addGlobalErrorHandler
