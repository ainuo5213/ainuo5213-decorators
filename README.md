项目简介：

项目类似于`nest`框架，采用装饰器的方式实现路由配置、依赖注入、错误处理、登录校验、统一返回处理等

目前待实现功能：

错误处理（ErrorCaptureHandler）：捕获程序运行的错误进行处理

身份认证校验（AuthorizeFilter）：在访问接口之前做的关于身份认证的过滤

依赖注入（dependency-injection）：注入、解析依赖的 service

BaseController 原生的关于 statusCode 的方法
