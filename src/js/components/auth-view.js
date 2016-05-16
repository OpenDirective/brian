import {section, header, main, div, button, p, input, br, nav} from '@cycle/dom'
import flatten from 'lodash/flatten'

function _breakLine(str) {
  if (!str) {
    return ''
  }
  const lines = str.split('\r\n')
  const newLines = lines.map(x => ([x, br()]))
  return flatten(newLines)
}

function render(screen) {
  const title = screen.currentUser ? 'Sign out to do something else' : 'Sign in to use Brian'
  return div('.screen', [
    div({attributes: {role: 'banner'}}, [
      header('.title', {dataset: {action: 'speak'}}, title),
      screen.currentUser ? header('.currentuser', {dataset: {action: 'speak'}}, screen.currentUser) : '',
    ]),
    screen.currentUser ?
      main('.main', [
        nav('.nav', [
          button(`.action`, {dataset: {action: 'home'}}, 'Back to Photos')
        ]),
        section('.content .signout', [
          button(`.action .auth`, {dataset: {action: 'signOut'}}, 'Sign Out'),
        ])
      ]) :
      main('.main', [
        section('.content .auth', [
          div('.authFeedback', p(_breakLine(screen.authMessage))),
          input('.username', {type: 'text', placeholder: 'Enter your Username'}),
          input('.password', {type: 'text', placeholder: 'Enter your Password'}),
          button(`.action .auth`, {dataset: {action: 'signIn'}}, 'Sign in'),
          button(`.action .auth`, {dataset: {action: 'signUp'}}, 'Sign up as a new user'),
        ])
      ])
  ])
}

export default render
