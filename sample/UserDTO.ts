import { MaxLength } from '../src/packages/validate/max-length'
import { NotNull } from '../src/packages/validate/not-null'
import { Range } from '../src/packages/validate/range'
import { Required } from '../src/packages/validate/required'

export class UserDTO {
  @Required('id是必需的')
  @Range(5, 10, '长度最小为5，最大为10')
  id: string
}
