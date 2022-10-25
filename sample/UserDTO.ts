import { PropMaxCount } from '../src/packages/validate/max-count'
import { PropRange } from '../src/packages/validate/range'

export class UserDTO {
  @PropRange(1, 5, 'asdasdas')
  id: string = ''
}
