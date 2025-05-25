const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { initWebSocketServer } = require("./lib/websocket/server")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const server = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Initialize WebSocket server
  const io = initWebSocketServer(server)

  // Store io instance globally
  global.socketIo = io

  server.listen(process.env.PORT || 3000, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${process.env.PORT || 3000}`)
  })
})
