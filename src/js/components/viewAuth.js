import {section, header, main, div, button, p, input, br} from '@cycle/dom'
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
  return div('.screen', [
    div({role: 'banner'}, [
      header('.title', {dataset: {action: 'speak'}}, 'Sign in to use Brian'),
      header('.username', {dataset: {action: 'speak'}}, screen.username),
    ]),
    main('.main', [
      section('.content .auth', [
        div('.authFeedback', p(_breakLine(screen.authMessage))),
        input('.username', {type: 'text', placeholder: 'Enter your Username'}),
        button(`.action .auth`, {dataset: {action: 'signIn'}}, 'Sign in'),
        input('.password', {type: 'text', placeholder: 'Enter your Password'}),
        button(`.action .auth`, {dataset: {action: 'signUp'}}, 'Sign up as a new user'),
      ])
    ])
  ])
}

export default render
