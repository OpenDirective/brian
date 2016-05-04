// Minimal speech driver - just speech, no options or events
//
// Limited availablity see caniuse
//
// TODO Add fallback or error

function speechDriver(speechText$) {
  speechText$.subscribe(text => {
    console.log('sss')
    if (window.SpeechSynthesisUtterance !== undefined) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
  })
}

export default speechDriver
