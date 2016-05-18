import {section, header, main, div, button, p, input, br, nav, label, form} from '@cycle/dom'
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
  const {username, message} = screen
  const title = (username) ? 'Sign out to do something else' : 'Sign in to see photos'
  return div('.screen', [
    div({attributes: {role: 'banner'}}, [
      header('.title', {dataset: {action: 'speak'}}, title),
      (username) ? header('.currentuser', {dataset: {action: 'speak'}}, username) : '',
    ]),
    (username) ?
      main('.main', [
        nav('.nav', [
          button(`.action`, {dataset: {action: 'home'}}, 'Back to Photos')
        ]),
        section('.content .signout', [
          button(`.action .auth`, {dataset: {action: 'signOut'}}, 'Sign Out'),
        ])
      ]) :
      main('.main', [
        form('.content .auth', {onsubmit: function () {return false}}, [
          div('.authMessage', p(_breakLine(message))),
          div('.textEntry', [
            label({attributes: {for: 'username'}, dataset: {action: 'speak'}}, 'Enter your Username:'),
            input('.username', {id: 'username', type: 'text'})
          ]),
          div('.textEntry', [
            label({attributes: {for: 'password'}, dataset: {action: 'speak'}}, 'Enter your Password'),
            input('.password', {id: 'password', type: 'text'}),
          ]),
          button(`.action .auth`, {type: 'submit', dataset: {action: 'signIn'}}, 'Sign in'),
          button(`.action .auth`, {type: 'button', dataset: {action: 'signUp'}}, 'Sign up as a new user'),
        ])
      ])
  ])
}

export default render
