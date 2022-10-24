import { Range } from '../src/packages/validate/range'
import { MaxLength } from '../src/packages/validate/max-length'

export class UserDTO {
  @MaxLength(5, 10, '长度最小为5，最大为10')
  id: string
}
