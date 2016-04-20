import {section, header, main, nav, div, button, img, p, input, select, option, span} from '@cycle/dom'

function render(screen) {
  const edit = screen.edit
  const level = screen.level
  const showCard = screen.showCard
  const btn = edit ? button : button
  const changes = screen.changes
  let vdom = undefined
  function optionAttribs(value, selectedValue) {
    let attr = {value}
    if (selectedValue === value || (!selectedValue && value === '[Show Nothing]')) {
      attr.selected = 'selected' // eslint-disable immutable/no-mutation
    }
    return attr
  }
  if (level === '0') {
    let cardID = 0
    vdom = div('.screen', [
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
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'next'}}, 'Next Photo')
        ])
      ])
    ])
  } else {
    let cardID = 0
    vdom = div('.screen', [
//      edit ? input('.title', {type: "text", attributes: {value: screen.album}}) : header('.title', screen.title),
      header('.title', screen.title),
      main('.main', [
        nav('.nav', [
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'home'}}, 'Home'),
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'back'}}, 'Back to previous screen'),
          button(`.action ${changes ? '' : '.hidden'}`, {dataset: {action: 'edit'}}, edit ? 'See changes' : 'Make changes')
        ]),
        section('.content', [
          screen.cards.map(({label, image, album}) =>
            button('.card', {dataset: {edit, view: album, album: screen.name, card: cardID++}}, [
//              edit ? "Change picture or text" : "",
              edit ? input('.fileElem', {type: "file", accept: "image/*", style: {display: "none"}}) : "",
              img('.cardImage', {src: image, onerror: function (ev) {this.onerror=null; this.src='/img/noImage.jpg'}}),
              edit ? input('.cardLabelEdit', {type: "text", attributes: {value: label}}) : p('.cardLabel', label),
              edit ? span('.selectView', [
                select('.cardOption', screen.albumList.map(a => option(optionAttribs(a, album), `${a}`))),
                button('.addAlbum', {dataset: {action: 'addAlbum'}}, 'Add')
              ]) : ''
            ])
          )]
        )
      ])
    ])
  }
  return vdom
}

export default render
