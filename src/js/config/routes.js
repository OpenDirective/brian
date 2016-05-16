import App from '../components/app'
import Auth from '../components/auth'

function unknownRoute() {
  console.error('unknown route')
  return {}
}

const routes = {
  '/': App,
  '/album': App,
  '/album/:id': null,
  '/auth': Auth,
  '*': unknownRoute,
}

export default routes
