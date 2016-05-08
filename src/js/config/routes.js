import App from '../components/App'
import Auth from '../components/Auth'

function unknownRoute() {
  console.log('unknown route')
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
