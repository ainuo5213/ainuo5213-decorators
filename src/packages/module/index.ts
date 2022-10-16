import { BaseController } from '../../core/controller'
import { MiddlewareType } from '../../core/middleware'
import { AppModule } from '../../core/module'

export type ModuleOption = Partial<{
  controllers: typeof BaseController[]
  modules: typeof AppModule[]
  middleware: MiddlewareType[]
}>

export const Module = (option: ModuleOption): ClassDecorator => {
  return (target) => {
    if (!(target.prototype instanceof AppModule)) {
      throw new TypeError(target.name + ' not instance of ' + AppModule.name)
    }

    Reflect.defineMetadata('module', option, target)
  }
}
