import AlbumTree from '../components/album-tree'
import SignIn from '../components/signin'
import SignOut from '../components/signout'
import Viewer from '../components/viewer'


const routes = {
  '/': '/signin',
  '/signin': {screen: SignIn},
  '/signout': {screen: SignOut},
  '/album': {screen: AlbumTree, params: {id: 1}},
  '/album/:id': id => ({screen: AlbumTree, params: {id}}),
  '/viewer/:album/:item': (album, item) => ({screen: Viewer, params: {album, item}}),
  '*': {screen: SignIn}
}

export default routes
