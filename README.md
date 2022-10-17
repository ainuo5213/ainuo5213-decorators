项目简介：

项目类似于`nest`框架，采用装饰器的方式实现路由配置、依赖注入、错误处理、登录校验、统一返回处理等

目前待实现功能：

错误处理（errorCaptureFilter）、登录校验（AuthorizeFilter）、统一返回处理（ActionResultFilter）、依赖注入（dependency-injection）

core 提供抽象层、并暂留入口

packages 提供实现层，用于植入特定的逻辑
