const component = require('../utils/component')
const reduce = require('../utils/reduce')
const Type = require('union-type')

var Nav = require('./nav')
var R = {
  merge: require('ramda/src/merge')
  ,without: require('ramda/src/without')
  ,head: require('ramda/src/head')
  ,liftN: require('ramda/src/liftN')
  ,add: require('ramda/src/add')
}

const concat = require('ramda/src/concat')
const merge = R.merge
const first = R.head


const slideOut = function(vnode, done){
  vnode.dom.classList.add('fade')
  setTimeout(done, 1000, true)
}



const ns = '.s'+Math.random().toString(32).slice(2,10)

// Normally I would style classes not elements, but I don't want to pepper
// the example with css when the example isn't about that.
const style = `

  ${ns} {
    min-height: 20em;
    margin: 1em;
  }
  
  ${ns} h1 {
    margin-bottom: 1em;
  }
  
  ${ns} button {
    transition: 1s
  }
  
  ${ns} .todo-item span {
    width: 186px;
    text-decoration: line-through; 
    display: inline-block;
  }
  
  ${ns} button {
    opacity: 1; 
    transition: '1s';
  }
  
  ${ns} button[disabled] {
    opacity: 0.5;
    transition: '0.5s';
  }
  
  ${ns} ul {
    list-style: none;
    padding: 0;
  }
  
`


function Main(){
  
  
  // In Elm you'd use a Union Type here, 
  // and it would be typesafe... but we'll live.
  function update(todos, action){
    
      switch(action.type){
        case 'Remove': return R.without([action.todo], todos)
        case 'Add': return [].concat({ text: '', done: false }, todos)
        case 'Edit': return todos
          .map( 
            t => t == action.todo 
            ? merge(t, { text: action.event.currentTarget.value })
            : t
          )
        
        case 'Toggle': return todos.map(
          t => t == action.todo
            ? merge(t, {done: !t.done})
            : t
        )
        default : throw new Error("Invalid action:"+action.type)
      }
  }

  
  // All the possible things that can happen in your component
  const Remove = 
    (todo) => (event) => actions({ type: 'Remove', todo, event })
  
  const Add = 
    (todo) => (event) => actions({ type: 'Add', todo, event })
  
  const Edit = 
    (todo) => (event) => actions({ type: 'Edit', todo, event })
  
  const Toggle = 
    (todo) => (event) => actions({ type: 'Toggle', todo, event })
    
  const Undo = 
    (past) => (event) => actions({ type: 'Undo', event, past })
    
  
   const todoView = function(todo ){
    return m('li'
      ,m('span.todo-item'
        ,todo.done 
          ? [
            m('span', { 
              onclick: Toggle(todo)
            }, todo.text) 
            ,m('button', { onclick: Remove(todo) }, 'X' )
          ]
          : [
            m('input[type=text]', { oninput: Edit(todo), value: todo.text })
            ,m('button', { onclick: Toggle(todo) }, '✓' )
          ]
      )
    )
  }
  
  const newTodoView = function(todos){
    const todo = first(todos)
    const disabled = todo.text.length == 0

    return m('span'
      ,m('input[type=text]', { oninput: Edit(todo), value: todo.text })
      ,m('button'
        , { onclick: Add(todo) 
          , disabled
          }
        , 'Add Todo')
    )
  }
  
   // A stream of stuff the user wants to do.
  const actions = m.prop()
  
  // remember every action so we can go back in time
  const past = reduce(concat, [], actions)
  
  // Our todos are just a reduction of the action stream
  const model = reduce(update, [], actions)
  
  // A subview stream, the list of the todos
  const list = model.map(function(todos){
    return m('ul'
      , todos.slice(1).map(todoView)
    )
  })
  
  const undoView = model.map(function(){
    return m('div.undo'
       ,m('button', { disabled: past().length === 0, onclick: Undo(past)  }, 'Undo')
    )
  })
  
  // In Elm you expose an init method, to keep things simple we'll just
  // give the source stream an initial value
  // you could expose this stream to another component if you wanted
  model([{ text: '', done: false }])


  const view = R.liftN(2, function(){
    return m('div'
      ,m(Nav)
      ,m('style', style)
      ,m(ns
        ,m('h1', 'Todo MVC?')
        ,newTodoView(model())
        ,list()
        ,undoView()
      )
      
    )
  })( list, undoView )

  // If something goes wrong in one of your streams, render it as well :O
  // In a real app you obviously wouldn't print a stack trace :)
  .catch(function(e){
    return m('div'
      ,m(Nav)
      ,m('p.error', e.message)
      ,m('pre', e.stack.toString() )
      ,m('a', { href: window.location.href }, 'Reload?')
    )
  })
  
  return view
}

module.exports = component(Main)