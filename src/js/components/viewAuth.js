import {section, header, main, div, button, p, input} from '@cycle/dom'

function render(screen) {
  return div('.screen', [
    header('.title', {dataset: {action: 'speak'}}, 'Sign in to use Brian'),
    main('.main', [
      section('.content .auth', [
        div('.authFeedback', p(screen.authMessage)),
        input('.username', {type: 'text', placeholder: 'Enter your Username'}),
        button(`.action .auth`, {dataset: {action: 'signIn'}}, 'Sign in user'),
        input('.password', {type: 'text', placeholder: 'Enter your Password'}),
        button(`.action .auth`, {dataset: {action: 'signUp'}}, 'Sign up new user'),
      ])
    ])
  ])
}

export default render