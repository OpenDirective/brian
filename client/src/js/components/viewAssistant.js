import {section, header, main, nav, div, button, img, p, input} from '@cycle/dom'

function render(screen) {
  return div('.screen', [
    main('.main', [
    header('.title', {dataset: {action: 'speak'}}, 'Change user options'),
      section('.content .settings', [
         button(`.action`, {dataset: {action: 'level0'}}, 'Complexity 0'),
         button(`.action`, {dataset: {action: 'level1'}}, 'Complexity 1'),
         button(`.action`, {dataset: {action: 'changesN'}}, 'No Changes'),
         button(`.action`, {dataset: {action: 'changesY'}}, 'Make Changes')
      ]
      )
    ])
  ])
}

export default render
