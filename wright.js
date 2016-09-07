const wright = require('wright')
    , browserify = require('browserify')
    , tsify = require('tsify')

wright({
  main: 'views/index.html',
  debug: true,
  run: 'm.redraw()',
  js: {
    watch: 'public/**/*.js',
    compile: compile
  }
})

function compile() {

  return new Promise((resolve, reject) => {
    browserify('./public/client.js')
    .bundle((err, src) => err ? reject(err) : resolve(src.toString()))
  })

}
