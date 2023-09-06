export function toBase64(stringToEncode: string): string {
  return Buffer.from(stringToEncode, 'utf-8').toString('base64');
}

export function fromBase64(stringToDecode: string): string {
  return Buffer.from(stringToDecode, 'base64').toString('utf-8');
}
