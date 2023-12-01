import bcrypt from 'bcrypt'

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Salt rounds determine the complexity of the hash
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }