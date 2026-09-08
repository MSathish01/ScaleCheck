import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { config } from '../config';

export class CryptoService {
  private static privateKey: string;
  private static publicKey: string;
  private static keyId: string = 'DOCA-LM-ROOT-KEY-2026';

  public static initializeKeys(): void {
    if (!fs.existsSync(config.keysPath)) {
      fs.mkdirSync(config.keysPath, { recursive: true });
    }

    const privateKeyPath = path.join(config.keysPath, 'private_key.pem');
    const publicKeyPath = path.join(config.keysPath, 'public_key.pem');

    if (fs.existsSync(privateKeyPath) && fs.existsSync(publicKeyPath)) {
      this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
      this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
      console.log('🔑 [CryptoService] Loaded existing asymmetric keypair (KeyId:', this.keyId, ')');
    } else {
      console.log('🔑 [CryptoService] Generating fresh RSA-2048 signing keypair for DoCA...');
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      fs.writeFileSync(privateKeyPath, privateKey);
      fs.writeFileSync(publicKeyPath, publicKey);
      this.privateKey = privateKey;
      this.publicKey = publicKey;
      console.log('🔑 [CryptoService] Asymmetric keys generated and securely persisted.');
    }
  }

  public static getKeyId(): string {
    return this.keyId;
  }

  public static getPublicKeyPem(): string {
    if (!this.publicKey) this.initializeKeys();
    return this.publicKey;
  }

  public static sha256(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  public static signPayload(payloadObject: Record<string, any>): { signature: string; payloadHash: string } {
    if (!this.privateKey) this.initializeKeys();

    // Canonical serialization (sorted keys) to guarantee deterministic hashing
    const canonicalString = JSON.stringify(payloadObject, Object.keys(payloadObject).sort());
    const payloadHash = this.sha256(canonicalString);

    const signer = crypto.createSign('SHA256');
    signer.update(canonicalString);
    signer.end();

    const signature = signer.sign(this.privateKey, 'base64');
    return { signature, payloadHash };
  }

  public static verifySignature(payloadObject: Record<string, any>, signatureBase64: string): boolean {
    if (!this.publicKey) this.initializeKeys();

    try {
      const canonicalString = JSON.stringify(payloadObject, Object.keys(payloadObject).sort());
      const verifier = crypto.createVerify('SHA256');
      verifier.update(canonicalString);
      verifier.end();

      return verifier.verify(this.publicKey, signatureBase64, 'base64');
    } catch (error) {
      console.error('❌ [CryptoService] Verification error:', error);
      return false;
    }
  }
}
