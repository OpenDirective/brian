import {section, header, main, nav, div, button, img, p, input} from '@cycle/dom'

function render(screen) {
  const edit = screen.edit
  const level = screen.level
  const showCard = screen.showCard
  const btn = edit ? button : button
  const changes = screen.changes
  if (level === '0') {
    let cardID = 0
    return div('.screen', [
      header('.title', {dataset: {action: 'speak'}}, screen.title),
      main('.main', [
        section('.content',
          screen.cards.map(({label, image, album}) =>
            div(`.card ${cardID !== showCard ? '.hidden' : ''}`,
                {dataset: {edit, view: album, album: screen.name, card: cardID++ }}, [
              edit ? "Change text" : "",
              img('.cardImage', {src: image}),
              edit ? input('.cardLabel', {type: "text", attributes: {value: label}}) : p('.cardLabel', label)
            ])
          )
        ),
        nav('.nav', [
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'back'}}, 'Choose more photos'),
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'next'}}, 'Next Photo'),
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'assist'}}, 'Get assistance'),
        ])
      ])
    ])
  } else {

    let cardID = 0
    return div('.screen', [
      header('.title', {dataset: {action: 'speak'}}, screen.title),
      main('.main', [
        nav('.nav', [
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'home'}}, 'Home'),
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'back'}}, 'Back to previous screen'),
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'assist'}}, 'Get assistance'),
          button(`.action ${changes ? '' : '.hidden'}`, {dataset: {action: 'edit'}}, edit ? 'See changes' : 'Make changes')
        ]),
        section('.content',
          screen.cards.map(({label, image, album}) =>
            btn('.card', {dataset: {edit, view: album, album: screen.name, card: cardID++}}, [
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
}

export default render
