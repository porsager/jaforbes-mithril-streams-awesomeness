function component(Component){
  let vnode = {}
  
  vnode.oninit = function(v){
    
    v.state.onupdate = m.prop()
    v.state.view = Component(v)
    
  }
  vnode.view = (v) => v.state.view()
  vnode.onupdate = function(vnode){
    
    vnode.state.onupdate( vnode )
  }
  vnode.onbeforeupdate = (vnode, old) => {
    return true
    // return old.instance != vnode.state.view()
  }
  
  return vnode
}

module.exports = component