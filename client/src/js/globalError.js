// capture and display any error that would otherwise get missed
/* eslint-disable no-alert */
/* eslint-disable immutable/no-mutation */

function addGlobalErrorHandler(useAlert = false) {
  window.onerror = (msg, url, line, col, error) => {
    const colTxt = col ? `\ncolumn: ${col}` : ''
    const errTxt = error ? `\nerror: ${error}` : ''
    const extra = `${colTxt} ${errTxt}`

    const message = `Error: ${msg}\nurl: ${url}\nline: ${line} ${extra}`
    if (useAlert) {
      alert(message)
    } else {
      console.log(message)
    }

    const suppressErrorAlert = true
    return suppressErrorAlert
  }
}

export default addGlobalErrorHandler
