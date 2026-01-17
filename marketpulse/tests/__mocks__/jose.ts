// Mock for jose library to avoid ESM issues in Jest
export class SignJWT {
  private payload: any;
  private header: any;

  constructor(payload: any) {
    this.payload = payload;
  }

  setProtectedHeader(header: any) {
    this.header = header;
    return this;
  }

  setIssuedAt() {
    return this;
  }

  setExpirationTime(exp: string) {
    return this;
  }

  async sign(secret: Uint8Array): Promise<string> {
    // Generate a fake JWT for testing
    const header = Buffer.from(JSON.stringify(this.header || { alg: 'HS256' })).toString('base64url');
    const payload = Buffer.from(JSON.stringify(this.payload)).toString('base64url');
    const signature = Buffer.from('fake-signature').toString('base64url');
    return `${header}.${payload}.${signature}`;
  }
}

export async function jwtVerify(token: string, secret: Uint8Array) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token');
    }
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return { payload };
  } catch {
    throw new Error('Invalid token');
  }
}
