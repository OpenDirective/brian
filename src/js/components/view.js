import {section, header, main, nav, div, button, img, p, input, select, option, span} from '@cycle/dom'

function render({edit, level, showCard, changes, adding, cards, id: albumId, name, title, albumList}) {
  console.log("view")
  let vdom = undefined
  function optionAttribs(value, selectedValue) {
    let attr = {value}
    if (selectedValue === value || (!selectedValue && value === 0 /*'[Show Nothing]'*/)) {
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
                {dataset: {edit, view: album, album: albumId, card: cardID++ }}, [
                  edit ? "Change text" : "",
                  img('.cardImage', {src: image}),
                  edit ? input('.cardLabel', {type: "text", props: {value: label}}) : p('.cardLabel', label)
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
      header('.title', {dataset: edit ? {} : {action: 'speak'}},
              edit ? span(['This album is: ', input('.labelEdit', {type: "text", dataset: {album: albumId}, value: name})]) :
              title),
      main('.main', [
        nav('.nav', [
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'home'}}, 'Home'),
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'back'}}, 'Back to previous screen'),
          button(`.action ${changes ? '' : '.hidden'}`, {dataset: {action: 'edit'}},
                  adding ? 'See other album changes' : edit ? 'See your changes' : 'Make changes')
        ]),
        section('.content', [
          cards.map(({label, image, album}) =>
            button('.card', {dataset: {edit, view: album, album: albumId, card: cardID++}}, [
              edit ? input('.fileElem', {type: "file", accept: "image/*", style: {display: "none"}}) : "",
              img('.cardImage', {src: image, onerror: function (ev) {this.onerror=null; this.src='/img/noImage.svg'}}),
              edit ? input('.cardLabelEdit', {type: "text", value: label}) : p('.cardLabel', label),
              edit ? span('.selectView', [
                select('.cardOption', albumList.map(a => option(optionAttribs(a.id, album), `${a.name}`))),
                button('.addAlbum', {dataset: {action: 'addAlbum'}}, 'More')
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
