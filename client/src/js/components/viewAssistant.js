import {section, header, main, nav, div, button, img, p, input} from '@cycle/dom'

function render(screen) {
  const {level, changes} = screen.settings
  const resetReq = screen.resetReq
  return div('.screen', [
    header('.title', {dataset: {action: 'speak'}}, 'Change user options'),
    main('.main', [
      section('.content .settings', [
        button(`.action ${(level === 0) ? '.selected' : ''}`, {dataset: {action: 'level0'}}, 'Complexity 0'),
        button(`.action ${(level === 1) ? '.selected' : ''}`, {dataset: {action: 'level1'}}, 'Complexity 1'),
        button(`.action ${(changes === 0) ? '.selected' : ''} `, {dataset: {action: 'changesN'}}, 'No Changes'),
        button(`.action ${(changes === 1) ? '.selected' : ''}`, {dataset: {action: 'changesY'}}, 'Make Changes'),
        button(`.action`, {dataset: {action: (resetReq) ? 'resetConf' : 'reset'}}, (resetReq) ? 'Yes, Reset Everything!' : 'Reset Everything!')
      ]
    )
    ])
  ])
}

export default render
