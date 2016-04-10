// limited availablity see caniuse
import _ from 'lodash'

// TODO test if (window.SpeechSynthesisUtterance === undefined) {

function speechDriver(speechText$) {
  speechText$.subscribe(text => {
    const utterance = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  })
}

export default speechDriver
