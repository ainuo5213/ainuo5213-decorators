import http from 'http'
import { moduleFactory, ICollected } from '../request/factory'

export default class Server<T extends Function> {
  collected: ICollected[] = []
  constructor(controller: T) {
    this.collected = moduleFactory(controller)
  }
  async listen(port: number) {
    http
      .createServer((req, res) => {
        for (const info of this.collected) {
          if (
            req.url === info.path &&
            req.method!.toLowerCase() === info.requestMethod.toLowerCase()
          ) {
            this.handleRequest(req, res, info)
          }
        }
      })
      .listen(port)
  }

  handleRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    info: ICollected
  ) {
    info.requestHandler().then((data) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
    })
  }
}
