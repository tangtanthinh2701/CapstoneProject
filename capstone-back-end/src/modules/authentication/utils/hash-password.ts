import * as bcrypt from 'bcrypt';
import { configuration } from 'src/configs/configuration';

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, configuration.authentication.saltRounds);
}
