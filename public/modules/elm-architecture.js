const component = require('../utils/component')
const reduce = require('../utils/reduce')
var Nav = require('./nav')

const marked = require('marked')

const without = function(x, xs){
  return xs.filter( v => v != x )
}

const merge = function(a,b){
  return Object.assign({}, a, b)
}

const first = function(todos){
  return todos[0]
}

function help(){
  
const text = `

  ----
  
  #### What is going on?
  
  > Warning, the actual source code is written in ES6, but in this document it will be printed as ES5.
  > If you want to see the actual source, please checkout elm-architecture.js [here](https://hyperdev.com/#!/project/honey-toucan)
  
  The Mithril rewrite has streams.  This todo app was created using 
  an architecture made famous by the lanuage [Elm](https://github.com/evancz/elm-architecture-tutorial)
  
  The core idea is you do not mutate state, you have an update function that
  accumulates state by responding to actions over time.
  
  In Elm you can define these Actions as part of the type system and get
  helpful hints when one of your functions doesn't handle all the possible code 
  paths.
  
  In JS we will just use a switch statement.  Types are cool, but we'll live.

  
  #### Source Code Dump
  
  This example isn't completely finished so I am just going to dump the source.
  Feel free to check out the project on [hyperdev](https://hyperdev.com/#!/project/honey-toucan) as well.
  
  
  This is the update function.  It accepts the existing state and an action.
  
  An action is just some data that gets sent down a stream when certain 
  events occur.
  
  Here is my schema for an action in this example:
  
      type Action = 
        { type: 'Remove' | 'Edit' | 'Add' | 'Toggle'
        , todo: Todo
        , event: Event 
        }
  
  Todo is simple as well:
  
      type Todo = 
        { text: string
        , done: boolean 
        }
        
  And Event is just a browser event.  We use it to grab input values.
  So the interface we rely on is:
  
      type Event = 
        { currentTarget: 
          {
            value: string
          }
        }
        
  It is a lot easier if you can rely on consistent interfaces.
  
  Let's look at \`update\`:
  
  It accepts an action and a list of todos.  We return a new list of todos.
  This is very different to traditional MVC where you would \`push\` into an array.
  We never mutate the state of todos manually, we define a relationship:
  
  \`Action -> Todo[]\`
  
  You might notice that update is a reducer
  
  \`\`\`js
  ${
    update.toString()
  }
  \`\`\`
  
  I don't like to use switches, and here I would use something else like 
  
  Ramda's [cond](http://ramdajs.com/docs/#cond) or 
  
  Union Type's [caseOn](https://github.com/paldepind/union-type)
  
  Or even a ternary.
  
  But I wanted to demo that nothing magic is going on.
  
  
  Let's look at the component itself.
  
  First we define some helpers for turning DOM events into Actions.
  Then we define some helper views.
  
  Some of these views are streams that depend on the model.
  
  Then we define our model as a reduction of actions.
  
  Then we make a final view stream and return it.
  
  Keeping the above in mind the source should be fairly readable on its own.
  
  \`\`\`js
  ${
    Main.toString()
  }
  \`\`\`
`
  
  return m.trust(
    marked(
      text
    )
  )
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


// In Elm you'd use a Union Type here, 
// and it would be typesafe... but we'll live.
function update(todos, action){
  
    switch(action.type){
      case 'Remove': return without(action.todo, todos)
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

const slideOut = function(vnode, done){
  vnode.dom.classList.add('fade')
  setTimeout(done, 1000, true)
}

function Main(){
  
  // All the possible things that can happen in your component
  const Remove = 
    (todo) => (event) => actions({ type: 'Remove', todo, event })
  
  const Add = 
    (todo) => (event) => actions({ type: 'Add', todo, event })
  
  const Edit = 
    (todo) => (event) => actions({ type: 'Edit', todo, event })
  
  const Toggle = 
    (todo) => (event) => actions({ type: 'Toggle', todo, event })
  
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
  
  // Our todos are just a reduction of the action stream
  const model = reduce(update, [], actions)
  
  // A subview stream, the list of the todos
  const list = model.map(function(todos){
    return m('ul'
      , todos.slice(1).map(todoView)
    )
  })
  
  // In Elm you expose an init method, to keep things simple we'll just
  // give the source stream an initial value
  // you could expose this stream to another component if you wanted
  model([{ text: '', done: false}])


  // If all goes well:
  const view = list.map(function(){
    return m('div'
      ,m(Nav)
      ,m('style', style)
      ,m(ns
        ,m('h1', 'Todo MVC?')
        ,newTodoView(model())
        ,list()
      )
      ,m('div', { style: { padding: '2em '} }
        ,help()
      )
      
    )
  })
  
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