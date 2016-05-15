import contentRouter from '../content-router'

function main(sources) {
  const sinks = contentRouter(sources)
  return sinks
}

export default main
