export function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}

export function verifyPassword(input: string, stored: string): boolean {
  const hashed = hashPassword(input);
  return hashed === stored;
}
