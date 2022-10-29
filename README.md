<!--
 * @Author: 孙永刚 1660998482@qq.com
 * @Date: 2022-10-22 07:19:13
 * @LastEditors: 孙永刚 1660998482@qq.com
 * @LastEditTime: 2022-10-29 18:20:37
 * @FilePath: \ainuo5213-decorators\README.md
 * @Description: 
 * 
 * Copyright (c) 2022 by 孙永刚 1660998482@qq.com, All Rights Reserved. 
-->
项目简介：

项目类似于`nest`框架，采用装饰器的方式实现路由配置、依赖注入、错误处理、登录校验、统一返回处理等

目前待实现功能：

错误处理（ErrorCaptureHandler）：捕获程序运行的错误进行处理

身份认证校验（AuthorizeFilter）：在访问接口之前做的关于身份认证的过滤

参数验证 90%

参数验证统一结果配置

BaseController 原生的关于 statusCode 的方法 已完成常用的方法
