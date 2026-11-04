// Local learning demo: Node.js built-ins only. Not Ethereum transaction signing.
import { generateKeyPairSync, sign, verify } from 'node:crypto';
import assert from 'node:assert/strict';

const message = Buffer.from('notes-demo:v1:chain=test:app=demo:action=login:nonce=1');
const changed = Buffer.from('notes-demo:v1:chain=test:app=demo:action=transfer:nonce=1');
for (const algorithm of ['ecdsa-secp256k1', 'ed25519']) {
  const isEd = algorithm === 'ed25519';
  const { privateKey, publicKey } = isEd
    ? generateKeyPairSync('ed25519')
    : generateKeyPairSync('ec', { namedCurve: 'secp256k1' });
  const hash = isEd ? null : 'sha256';
  const privateOptions = isEd ? privateKey : { key: privateKey, dsaEncoding: 'ieee-p1363' };
  const publicOptions = isEd ? publicKey : { key: publicKey, dsaEncoding: 'ieee-p1363' };
  const signature = sign(hash, message, privateOptions);
  assert.equal(signature.length, 64);
  assert.equal(verify(hash, message, publicOptions, signature), true);
  assert.equal(verify(hash, changed, publicOptions, signature), false);
  const { publicKey: wrongKey } = isEd
    ? generateKeyPairSync('ed25519')
    : generateKeyPairSync('ec', { namedCurve: 'secp256k1' });
  const wrongOptions = isEd ? wrongKey : { key: wrongKey, dsaEncoding: 'ieee-p1363' };
  assert.equal(verify(hash, message, wrongOptions, signature), false);
  console.log(`${algorithm}: bytes=${signature.length}; valid=true; tampered=false; wrongKey=false`);
}
// Signature verification alone accepts the same signed message repeatedly.
// A production verifier must atomically enforce expiry and consume the app nonce.
