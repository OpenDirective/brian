import {section, header, main, nav, div, button, img, p, input} from '@cycle/dom'

function render(screen) {
  const edit = screen.edit
  const btn = edit ? button : button
  let cardID = 0
  return div('.screen', [
    header('.title', {dataset: {action: 'speak'}}, screen.title),
    main('.main', [
      nav('.nav', [
        button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'home'}}, 'Home'),
        button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'back'}}, 'Back to previous screen'),
        button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'assist'}}, 'Get assistance'),
        button('.action', {dataset: {action: 'edit'}}, edit ? 'See changes' : 'Make changes')
      ]),
      section('.content',
        screen.cards.map(({label, image, album}) =>
          btn('.card', {dataset: {edit, view: album, album: screen.title, card: cardID++}}, [
            edit ? "Change picture or text" : "",
            edit ? input('.fileElem', {type: "file", accept: "image/*", style: {display: "none"}}) : "",
            img('.cardImage', {src: image}),
            edit ? input('.cardLabel', {type: "text", attributes: {value: label}}) : p('.cardLabel', label)
          ])
        )
      )
    ])
  ])
}

export default render
