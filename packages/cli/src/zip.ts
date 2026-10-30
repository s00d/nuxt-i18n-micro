import { deflateRawSync, inflateRawSync } from 'node:zlib'
import { CliError } from './errors'

/** A zip reader and writer for translation bundles: deflate or stored, no zip64, no encryption. */

const LOCAL_HEADER = 0x04034b50
const CENTRAL_HEADER = 0x02014b50
const END_OF_DIRECTORY = 0x06054b50
const DEFLATE = 8
const STORED = 0
const UTF8_FLAG = 0x0800

/** Far above any translation bundle: refuses a zip bomb before it fills the memory. */
const MAX_ENTRY_BYTES = 512 * 1024 * 1024

const CRC_TABLE = Array.from({ length: 256 }, (_, index) => {
  let value = index
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1
  return value >>> 0
})

function crc32(data: Buffer): number {
  let crc = 0xffffffff
  for (const byte of data) crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

export interface ZipEntry {
  name: string
  data: Buffer
}

function commonHeader(buffer: Buffer, offset: number, entry: { crc: number; compressed: number; size: number; nameLength: number }): void {
  buffer.writeUInt16LE(20, offset) // version needed
  buffer.writeUInt16LE(UTF8_FLAG, offset + 2)
  buffer.writeUInt16LE(DEFLATE, offset + 4)
  buffer.writeUInt32LE(0, offset + 6) // no timestamp: archive bytes depend only on content
  buffer.writeUInt32LE(entry.crc, offset + 10)
  buffer.writeUInt32LE(entry.compressed, offset + 14)
  buffer.writeUInt32LE(entry.size, offset + 18)
  buffer.writeUInt16LE(entry.nameLength, offset + 22)
}

export function createZip(entries: ZipEntry[]): Buffer {
  const locals: Buffer[] = []
  const centrals: Buffer[] = []
  let offset = 0

  for (const { name, data } of entries) {
    const nameBytes = Buffer.from(name, 'utf8')
    const compressed = deflateRawSync(data, { level: 9 })
    const fields = { crc: crc32(data), compressed: compressed.length, size: data.length, nameLength: nameBytes.length }

    const local = Buffer.alloc(30)
    local.writeUInt32LE(LOCAL_HEADER, 0)
    commonHeader(local, 4, fields)
    locals.push(local, nameBytes, compressed)

    const central = Buffer.alloc(46)
    central.writeUInt32LE(CENTRAL_HEADER, 0)
    central.writeUInt16LE(20, 4) // version made by
    commonHeader(central, 6, fields)
    central.writeUInt32LE(offset, 42)
    centrals.push(central, nameBytes)

    offset += local.length + nameBytes.length + compressed.length
  }

  const directory = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(END_OF_DIRECTORY, 0)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  return Buffer.concat([...locals, directory, end])
}

const invalid = (reason: string): CliError => new CliError(`Invalid zip archive: ${reason}`, { code: 'INVALID_ZIP' })

function findEndOfDirectory(zip: Buffer): number {
  for (let offset = zip.length - 22; offset >= Math.max(0, zip.length - 65_557); offset -= 1) {
    if (zip.readUInt32LE(offset) === END_OF_DIRECTORY) return offset
  }
  throw invalid('end of central directory not found')
}

/** Rejects names that would land outside the extraction directory. */
function safeName(name: string): string {
  const normalized = name.replaceAll('\\', '/')
  if (normalized.startsWith('/') || /^[a-zA-Z]:/.test(normalized) || normalized.split('/').includes('..')) throw invalid(`unsafe path ${name}`)
  return normalized
}

function readEntryData(zip: Buffer, method: number, localOffset: number, compressedSize: number, size: number): Buffer {
  if (size > MAX_ENTRY_BYTES) throw invalid('entry too large')
  if (zip.readUInt32LE(localOffset) !== LOCAL_HEADER) throw invalid('bad local header')
  const start = localOffset + 30 + zip.readUInt16LE(localOffset + 26) + zip.readUInt16LE(localOffset + 28)
  const raw = zip.subarray(start, start + compressedSize)
  if (method === STORED) return Buffer.from(raw)
  if (method === DEFLATE) return inflateRawSync(raw, { maxOutputLength: MAX_ENTRY_BYTES })
  throw invalid(`unsupported compression method ${method}`)
}

export function readZip(zip: Buffer): ZipEntry[] {
  if (zip.length < 22) throw invalid('too short')
  const end = findEndOfDirectory(zip)
  const count = zip.readUInt16LE(end + 10)
  const entries: ZipEntry[] = []
  let offset = zip.readUInt32LE(end + 16)

  for (let index = 0; index < count; index += 1) {
    if (zip.readUInt32LE(offset) !== CENTRAL_HEADER) throw invalid('bad central directory')
    const nameLength = zip.readUInt16LE(offset + 28)
    const name = safeName(zip.toString('utf8', offset + 46, offset + 46 + nameLength))
    const method = zip.readUInt16LE(offset + 10)
    const data = readEntryData(zip, method, zip.readUInt32LE(offset + 42), zip.readUInt32LE(offset + 20), zip.readUInt32LE(offset + 24))
    if (!name.endsWith('/')) entries.push({ name, data })
    offset += 46 + nameLength + zip.readUInt16LE(offset + 30) + zip.readUInt16LE(offset + 32)
  }
  return entries
}
