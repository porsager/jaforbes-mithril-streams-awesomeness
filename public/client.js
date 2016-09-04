var j2c = require('j2c')
var packagejson = require('../package.json')
var component = require('./utils/component')
var Nav = require('./modules/nav')
var marked = require('marked')

var StrictEquality = require('./modules/strict-equality')
var ElmArchitecture = require('./modules/elm-architecture')
var Undo = require('./modules/undo-redo')

const routes = [
  [
    '/strict-equality'
    , 'Mithril Rewrite: Strict Equality Components'
    , StrictEquality
    , "An optmization: do not view diff streams that haven't changed."
  ]
  ,[
    '/elm-architecture'
    , 'Mithril Rewrite: Elm Architecture (in progress)'
    , ElmArchitecture
    , "Writing apps with streams!"
  ]
]

function Main(vnode){
  
  return function(){
    return m('div'
      ,m(Nav)
      ,m('ul'
        ,routes.map(
          ([href, label, component]) =>
            m('li'
              , m('a', { href , oncreate: m.route.link }, label)
            )
        )
      )
    )
  }
}

m.route.prefix("")
m.route(document.body, '/', {
  '/': component(Main)
  ,'/strict-equality': StrictEquality
  ,'/elm-architecture': ElmArchitecture
  ,'/beta/undo': Undo
})