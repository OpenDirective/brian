// Minimal speech driver - just speech, no options or events
//
// Limited availablity see caniuse
//
// TODO Add fallback or error

import { Stream } from 'xstream'

export default function errorDriver(errorText$: Stream<string>): void {
    errorText$.addListener({
        next: err => {
            alert(err)
        },
        error: () => undefined,
        complete: () => undefined
    })
}
