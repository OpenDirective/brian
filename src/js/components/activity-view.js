import {section, header, main, div, button, textarea} from '@cycle/dom'

function render(screen) {
  const resetReq = screen.resetReq

  return div('.screen', [
    header('.title', {dataset: {action: 'speak'}}, 'View User activity'),
    main('.main', [
      section('.content .activity', [
        textarea('.activityLog', {readonly: true}, screen.log),
        button(`.action`, {dataset: {action: (resetReq) ? 'resetConf' : 'reset'}}, (resetReq) ? 'Yes, Reset Log!' : 'Reset Log!')
      ]
    )
    ])
  ])
}

export default render
