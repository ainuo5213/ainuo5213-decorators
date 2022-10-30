import { ApiProperty } from '@ainuo5213/core'
import { PropRange } from '@ainuo5213/validate'

export class UserDTO {
  @PropRange(1, 5, 'id范围再1到5')
  @ApiProperty()
  id: string
}
