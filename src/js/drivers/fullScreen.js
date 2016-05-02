
function fullScreenDriver(fullScreen$) {
  fullScreen$.subscribe(({fullScreen}) => {
    if (fullScreen === true) {
      const docElm = document.documentElement
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen()
      } else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen()
      } else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen()
      } else if (docElm.msRequestFullscreen) {
        docElm.msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen()
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen()
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen()
      }
    }
  })
}

export default fullScreenDriver
