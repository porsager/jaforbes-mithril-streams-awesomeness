var j2c = require('j2c')
var component = require('../utils/component')
var reduce = require('../utils/reduce')
var Nav = require('./nav')

const Type = require('union-type')
const R = {
  inc: require('ramda/src/inc')
  ,dev: require('ramda/src/dec')
  ,flip: require('ramda/src/flip')
  ,lift: require('ramda/src/lift')
  ,always: require('ramda/src/always')
  ,add: require('ramda/src/add')
}
const marked = require('marked')
const K = R.always

const help = (
`
#### What is going on?
            
- Each component exposes a view stream 
- When the stream hasn't changed, we tell mithril to skip diffing that subtree
- This means your virtual dom diffs are  super fast because you only compute what needs to change.

#### Things to try:
  
- Triggering a redraw globally and observe the local diff counts stay the same
- Increment / Decrement individual counters and notice their counterpart doesn't diff
- Notice the Sum components (that contain the Counter components) only diff when the sum value has changed

No, you could use this technique on an app of any size.
  
#### What is the catch?

You have to write your application state as streams.  You need to ensure your view stream
explicitly declares all of its dependencies.
  
#### Caveats

I haven't benchmarked this, it is all theoretical.
`
)

function Counter(vnode){
  
  const Action = Type({
    Increment: []
    ,Decrement: []
  })
  
  const update = 
    Action.caseOn({
      Increment: R.inc
      ,Decrement: R.dec
    })
  
  const actions = m.prop()
  
  const model = reduce(R.flip(update), 0, actions)
  
  let diffs = 0
  const el = m.prop()
  
  vnode.state.onupdate.map(function onupdate(){
    diffs++
    el().dom.innerText = ' ( Diffs: '+ diffs  + ' )'
  })
  // get initial value
  model( vnode.attrs.model() )
  
  // send the result back up
  model.map( vnode.attrs.model )
  
  const view = model.map(function(){
    return m('div'
      ,m('p'
        ,m('button.btn.btn-default', { onclick: () => actions( Action.Increment() ) } ,'+')
        ,m('button.btn.btn-default', { onclick: () => actions( Action.Decrement() ) }, '-')
        ,m('span', model())
      )
      ,m('p', { oncreate: el }, ' ( Diffs: 0 )')
    )
  })
  
  return view
}

const Count = component(Counter)

function Calculator(vnode){
  console.log('Calculator')
  
  const a = m.prop(0)
  const b = m.prop(0)
  
  const sum = R.lift(R.add)( a, b )

  vnode.state.el = m.prop()
  
  let localDiffs = 0
  let el = m.prop()
  
  vnode.state.onupdate.map(function(vnode){
    localDiffs++
    el().dom.innerText = 'Local Diffs: '+localDiffs
  
  })
  
  const view = sum.map(function(){
    
    return m('div'
      
      ,m('p', { oncreate: el }, 'Local Diffs: 0' )
      ,m('p' ,'Sum: '+sum() )
      ,m(Count, { model: a })
      ,m(Count, { model: b })
    )
  })
  
  return view
}

const Calc = component(Calculator)

const row = function(children){
  const width = (95/children.length)+'vw'
  
  
  return m('div', { style: { width: '95vw' } }
    ,children.map(function(c){
      return m('div', { style: { float: 'left', width } }, c)
    }) 
  )
}

function Main(vnode){
  
  vnode.tag.onupdate = function(){
    globalUpdates++  
  }
  
  let globalUpdates = 0
  const view = function(){
    
      return m('div'
       ,m(Nav)
       ,m('div', { style: { textAlign: 'center' } }
          ,m('h1', 'Strict Equality Components')
          ,m('p', 'Global Updates: '+ (globalUpdates) )
          ,m('button.btn', { onclick: console.log, style: { width: '200px'} }, 'Redraw')
          ,row([
            m(Calc)
            ,m(Calc)
          ])
          ,m('div', { style: 'width: 80%; margin-left: 8%; text-align: left' } 
            ,m.trust(marked(help))
          )
        )
      )
    
  }
  
  return view
}

module.exports = component(Main)