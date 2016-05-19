import router from './router'

function main(sources) {
  const sinks = router(sources)
  return sinks
}

export default main
