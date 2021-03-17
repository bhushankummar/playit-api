import * as nodeCrypto from 'crypto';

const BASE64_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' + '0123456789';
const type = {
  // Use Node's built-in `crypto.getRandomBytes` (cryptographically
  // secure but not seedable, runs only on the server). Reverts to
  // `crypto.getPseudoRandomBytes` in the extremely uncommon case that
  // there isn't enough entropy yet
  NODE_CRYPTO: 'NODE_CRYPTO',

  // Use non-IE browser's built-in `window.crypto.getRandomValues`
  // (cryptographically secure but not seedable, runs only in the
  // browser).
  BROWSER_CRYPTO: 'BROWSER_CRYPTO',

  // Use the *fast*, seedaable and not cryptographically secure
  // Alea algorithm
  ALEA: 'ALEA',
};

export const secret = (charsCount?: any) => {
  // Default to 256 bits of entropy, or 43 characters at 6 bits per
  // character.
  if (charsCount === undefined) {
    charsCount = 43;
  }
  return _randomString(charsCount, BASE64_CHARS);
};

const _randomString = (charsCount: number, alphabet: string) => {
  const digits = [];
  for (let i = 0; i < charsCount; i++) {
    digits.push(choice(alphabet));
  }
  return digits.join('');
};

const hexString = (digits: number) => {
  if (type.NODE_CRYPTO) {
    const numBytes = Math.ceil(digits / 2);
    let bytes;
    // Try to get cryptographically strong randomness. Fall back to
    // non-cryptographically strong if not available.
    try {
      bytes = nodeCrypto.randomBytes(numBytes);
    } catch (e) {
      // XXX should re-throw any error except insufficient entropy
      bytes = nodeCrypto.pseudoRandomBytes(numBytes);
    }
    const result = bytes.toString('hex');
    // If the number of digits is odd, we'll have generated an extra 4 bits
    // of randomness, so we need to trim the last digit.
    return result.substring(0, digits);
  }
  return this._randomString(digits, '0123456789abcdef');

};

const fraction = () => {
  const numerator = parseInt(hexString(8), 16);
  return numerator * 2.3283064365386963e-10; // 2^-32
};

const choice = (arrayOrString: any) => {
  const index = Math.floor(fraction() * arrayOrString.length);
  if (typeof arrayOrString === 'string') {
    return arrayOrString.substr(index, 1);
  }
  return arrayOrString[index];
};