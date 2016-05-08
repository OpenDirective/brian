import contentRouter from '../contentRouter'

function main(sources) {
  const sinks = contentRouter(sources)
  return sinks
}

export default main
