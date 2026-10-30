import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'
import { CliError } from './errors'

const MAGIC = Buffer.from('I18NBAK1')
const SALT_BYTES = 16
const IV_BYTES = 12
const TAG_BYTES = 16

const deriveKey = (password: string, salt: Buffer): Buffer => scryptSync(password, salt, 32)

export function encrypt(data: Buffer, password: string): Buffer {
  const salt = randomBytes(SALT_BYTES)
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv('aes-256-gcm', deriveKey(password, salt), iv)
  const body = Buffer.concat([cipher.update(data), cipher.final()])
  return Buffer.concat([MAGIC, salt, iv, cipher.getAuthTag(), body])
}

export const isEncrypted = (data: Buffer): boolean => data.subarray(0, MAGIC.length).equals(MAGIC)

export function decrypt(data: Buffer, password: string): Buffer {
  const saltStart = MAGIC.length
  const ivStart = saltStart + SALT_BYTES
  const tagStart = ivStart + IV_BYTES
  const bodyStart = tagStart + TAG_BYTES
  const decipher = createDecipheriv('aes-256-gcm', deriveKey(password, data.subarray(saltStart, ivStart)), data.subarray(ivStart, tagStart))
  decipher.setAuthTag(data.subarray(tagStart, bodyStart))
  try {
    return Buffer.concat([decipher.update(data.subarray(bodyStart)), decipher.final()])
  } catch (error) {
    throw new CliError('Wrong password, or the backup is damaged.', { code: 'BACKUP_DECRYPT_FAILED', cause: error })
  }
}
