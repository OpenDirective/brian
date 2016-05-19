import {section, header, main, nav, div, button, img, p, input, select, option, span} from '@cycle/dom'

function render({edit, level, showCard, changes, adding, cards, id: albumId, name, title, albumList, currentUser}) {
  let vdom         // eslint-disable-line immutable/no-let
  function optionAttribs(value, selectedValue) {
    let attr = {value} // eslint-disable-line immutable/no-let, prefer-const
    if (selectedValue === value || (!selectedValue && value === 0 /* '[Show Nothing]' */)) {
      attr.selected = 'selected' // eslint-disable-line immutable/no-mutation
    }
    return attr
  }
  if (level === '0') {
    let cardID = 0    // eslint-disable-line immutable/no-let
    vdom = div('.screen', [
      header('.title', {dataset: {action: 'speak'}}, title),
      main('.main', [
        section('.content',
          cards.map(({label, image, album}) =>
            div(`.card ${cardID === showCard ? '' : '.hidden'}`,
                {dataset: {edit, view: album, album: albumId, card: cardID++}}, [
                  edit ? 'Change text' : '',
                  img('.cardImage', {src: image}),
                  edit ? input('.cardLabel', {type: 'text', props: {value: label}}) : p('.cardLabel', label)
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
    let cardID = 0  // eslint-disable-line immutable/no-let
    vdom = div('.screen', [
      div({attributes: {role: 'banner'}}, [
        header('.title', {dataset: edit ? {} : {action: 'speak'}},
              edit ? span(['This album is: ', input('.labelEdit', {type: "text", dataset: {album: albumId}, value: name})]) :
              title),
        header('.currentuser', {dataset: {action: 'speak'}}, currentUser),
      ]),
      main('.main', [
        nav('.nav', [
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'home'}}, 'Home'),
          button(`.action ${edit ? '.hidden' : ''}`, {dataset: {action: 'back'}}, 'Back to previous screen'),
          button(`.action ${changes ? '' : '.hidden'}`, {dataset: {action: 'edit'}},
                  (adding) ? 'See other album changes' : (edit) ? 'See your changes' : 'Make changes'),
          button(`.action ${edit ? '.hidden' : ''}`,
                  {dataset: {action: (currentUser) ? ('signOut') : 'signIn'}},
                  (currentUser) ? 'Finish with photos' : 'Sign in to Brian')
        ]),
        section('.content', [
          cards.map(({label, image, album}) =>
            button('.card', {dataset: {edit, view: album, album: albumId, card: cardID++}}, [
              edit ? input('.fileElem', {type: 'file', accept: 'image/*', style: {display: 'none'}}) : '',
              // eslint-disable-next-line immutable/no-this, immutable/no-mutation, brace-style, max-statements-per-line, babel/object-shorthand
              img('.cardImage', {src: image, onerror: function () {this.onerror = null; this.src = '/img/noImage.jpg'}}),
              edit ? input('.cardLabelEdit', {type: 'text', value: label}) :
                     p('.cardLabel', {dataset: {action: 'speak'}}, label),
              edit ? '' : button('.action .viewLarge', {dataset: {action: 'viewLarge'}}, 'Make Bigger'),
              edit ? span('.selectView', [
                select('.cardOption', albumList.map(a => option(optionAttribs(a.id, album), `${a.name}`))),
                button('.action .addAlbum', {dataset: {action: 'addAlbum'}}, 'More')
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
