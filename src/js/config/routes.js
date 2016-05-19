import App from '../components/app'
import SignIn from '../components/signin'
import SignOut from '../components/signout'


const routes = {
  '/': '/signin',
  '/signin': {screen: SignIn},
  '/signout': {screen: SignOut},
  '/album': {screen: App, id: 1},
  '/album/:id': id => ({screen: App, id}),
  '*': {screen: SignIn}
}

export default routes
