module.exports = createServer

var xtend = require('xtend')
  , http = require('http')
  , url = require('url')

var defaultIndex = require('./handlers/default-index.js')
  , liveReload = require('./handlers/live-reload.js')
  , bundle = require('./handlers/bundle-entries.js')
  , serveStatic = require('./handlers/static.js')
  , logRequests = require('./handlers/log.js')

function createServer(opts, io, handler) {
  var handlers
    , inner

  opts.cwd = opts.cwd || process.cwd()

  // order is important here. the higher
  // in the list, the deeper the handler
  // is in the resolution order.
  handlers = [
      defaultIndex
    , serveStatic
    , bundle
    , logRequests
    , liveReload
  ]

  handler = handler || _404

  inner = handlers.reduce(function(lhs, rhs) {
    return rhs(opts, io, lhs)
  }, handler)

  return outer

  function outer(req, resp) {
    var parsed = url.parse(req.url, true)

    return inner(this, req, resp, parsed)
  }

  function _404(server, req, resp, parsed) {
    resp.writeHead(404, {'content-type': 'text/plain'})
    resp.end('not found ):')
  }
}
