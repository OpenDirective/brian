// limited availablity see caniuse

// TODO test if (window.SpeechSynthesisUtterance === undefined) {
// Add fallback

function speechDriver(speechText$) {
  speechText$.subscribe(text => {
    const utterance = new SpeechSynthesisUtterance(text)
    window.speechSynthesis.speak(utterance)
  })
}

export default speechDriver
