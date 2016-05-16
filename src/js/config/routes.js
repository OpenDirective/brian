import App from '../components/app'
import Auth from '../components/auth'

function unknownRoute() {
  console.error('unknown route')
  return {}
}

const routes = {
  '/': App,
  '/album': App,
//  '/screen/:id': z => console.log(z),
  '/auth': Auth,
  '*': unknownRoute,
}

export default routes
