import { randomBytes } from 'crypto';
import { promisify } from 'util';

/**
 * Wraps Node's `crypto.randomBytes` in a promise.
 * @param size The number of random bytes to generate.
 * @returns A promise that resolves to the random bytes.
 */
const randomBytesP = promisify(randomBytes);
export default randomBytesP;
