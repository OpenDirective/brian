import {section, header, main, div, button} from '@cycle/dom'

function render(screen) {
  const {level, changes} = screen.settings
  const resetReq = screen.resetReq
  return div('.screen', [
    header('.title', {dataset: {action: 'speak'}}, 'Change user options'),
    main('.main', [
      section('.content .settings', [
        button(`.action ${(level === 0) ? '.selected' : ''}`, {dataset: {action: 'level0'}}, 'Complexity 0'),
        button(`.action ${(level === 1) ? '.selected' : ''}`, {dataset: {action: 'level1'}}, 'Complexity 1'),
        button(`.action ${(changes === 0) ? '.selected' : ''} `, {dataset: {action: 'changesN'}}, 'Hide "Make changes"'),
        button(`.action ${(changes === 1) ? '.selected' : ''}`, {dataset: {action: 'changesY'}}, 'Show "Make changes" '),
        button(`.action`, {dataset: {action: (resetReq) ? 'resetConf' : 'reset'}}, (resetReq) ? 'Yes, Reset Everything!' : 'Reset Everything!'),
        button(`.action`, {dataset: {action: 'addUser'}}, 'Add a user')
      ]
    )
    ])
  ])
}

export default render
