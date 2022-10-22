import { Required } from '../src/packages/validate/required'

export class UserDTO {
  @Required('id是必需的')
  id: string
}
