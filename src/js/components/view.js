import {section, header, main, nav, div, button, img, p, input, select, option, span} from '@cycle/dom'

function render({edit, level, showCard, changes, adding, cards, name, title, albumList}) {
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
      header('.title', {dataset: {action: 'speak'}}, title),
      main('.main', [
        section('.content',
          cards.map(({label, image, album}) =>
            div(`.card ${cardID !== showCard ? '.hidden' : ''}`,
                {dataset: {edit, view: album, album: name, card: cardID++ }}, [
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
      header('.title', title),
      main('.main', [
        nav('.nav', [
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'home'}}, 'Home'),
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'back'}}, 'Back to previous screen'),
          button(`.action ${changes ? '' : '.hidden'}`, {dataset: {action: 'edit'}},
                  adding ? 'See other album changes' : edit ? 'See your changes' : 'Make changes')
        ]),
        section('.content', [
          cards.map(({label, image, album}) =>
            button('.card', {dataset: {edit, view: album, album: name, card: cardID++}}, [
//              edit ? "Change picture or text" : "",
              edit ? input('.fileElem', {type: "file", accept: "image/*", style: {display: "none"}}) : "",
              img('.cardImage', {src: image, onerror: function (ev) {this.onerror=null; this.src='/img/noImage.jpg'}}),
              edit ? input('.cardLabelEdit', {type: "text", attributes: {value: label}}) : p('.cardLabel', label),
              edit ? span('.selectView', [
                select('.cardOption', albumList.map(a => option(optionAttribs(a, album), `${a}`))),
                (adding) ? '' : button('.addAlbum', {dataset: {action: 'addAlbum'}}, 'Add')
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
