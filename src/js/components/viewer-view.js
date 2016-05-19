import {section, header, main, nav, div, button, img, p} from '@cycle/dom'

function render({currentUser, title, image, label}) {
  const vdom = div('.screen', [
    div({attributes: {role: 'banner'}}, [
      header('.title', {dataset: {action: 'speak'}}, title),
      header('.currentuser', {dataset: {action: 'speak'}}, currentUser),
    ]),
    main('.main', [
      nav('.nav', [
        button(`.action`, {dataset: {action: 'back'}}, 'Back to previous screen')
      ]),
      section('.content', [
        div(`.card`, [
          // eslint-disable-next-line immutable/no-this, immutable/no-mutation, brace-style, max-statements-per-line, babel/object-shorthand
          img('.cardImageLarge', {src: image, onerror: function () {this.onerror = null; this.src = '/img/noImage.jpg'}}),
          p('.cardLabel', {dataset: {action: 'speak'}}, label)
        ])
      ])
    ])
  ])

  return vdom
}

export default render
