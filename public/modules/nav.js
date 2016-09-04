const component = require('../utils/component')


const namespace = '.d'+Math.random().toString(15).slice(2, 8);

const style = `
  ${namespace} h1 {
    background-color: lightpink;
    color: white;
    padding: 0.4em;
    margin-bottom: 1em;
    box-shadow: 0 2px 2px 0 rgba(241, 15, 15, 0.14)
    , 0 3px 1px -2px rgba(234, 21, 21, 0.2)
    , 0 1px 5px 0 rgba(201, 23, 23, 0.12);  
  }
  ${namespace} a {
     text-decoration: none;
  }
  
`

function Main(){
  return function(){
    return m('div'+namespace
      ,m('style', style)
      ,m('a', { href: '/' , oncreate: m.route.link }
        ,m('h1', 'Honey Toucan')
      )
    )
  }
    
}

console.log('Exporting', component(Main))

module.exports = component(Main)