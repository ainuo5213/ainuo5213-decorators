export class BaseController {
  private static context: any
  get context() {
    return BaseController.context
  }

  set context(context: any) {
    BaseController.context = context
  }
}
