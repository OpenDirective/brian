import AlbumTree from '../components/album-tree'
import SignIn from '../components/signin'
import SignOut from '../components/signout'


const routes = {
  '/': '/signin',
  '/signin': {screen: SignIn},
  '/signout': {screen: SignOut},
  '/album': {screen: AlbumTree, id: 1},
  '/album/:id': id => ({screen: AlbumTree, id}),
  '*': {screen: SignIn}
}

export default routes
