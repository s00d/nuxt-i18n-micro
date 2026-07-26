import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { TranslationContentTracker } from '../src/watcher'

/**
 * Guards the dev watcher against work it does not need to do: a root locale change
 * re-merges every page for that locale, and editors/formatters routinely rewrite a
 * file without changing a byte of it.
 */
describe('TranslationContentTracker', () => {
  let dir: string
  let file: string

  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'i18n-track-'))
    file = join(dir, 'en.json')
    writeFileSync(file, JSON.stringify({ greeting: 'Hello' }))
  })

  afterEach(() => rmSync(dir, { recursive: true, force: true }))

  it('processes a file it has not seen before', () => {
    expect(new TranslationContentTracker().shouldProcess(file)).toBe(true)
  })

  it('skips a rewrite that leaves the content identical', () => {
    const tracker = new TranslationContentTracker()
    expect(tracker.shouldProcess(file)).toBe(true)

    writeFileSync(file, JSON.stringify({ greeting: 'Hello' }))
    expect(tracker.shouldProcess(file)).toBe(false)
  })

  it('processes a real edit, and the revert after it', () => {
    const tracker = new TranslationContentTracker()
    tracker.shouldProcess(file)

    writeFileSync(file, JSON.stringify({ greeting: 'Hi' }))
    expect(tracker.shouldProcess(file)).toBe(true)

    writeFileSync(file, JSON.stringify({ greeting: 'Hello' }))
    expect(tracker.shouldProcess(file)).toBe(true)
  })

  it('processes again after the file is forgotten, as on unlink then re-add', () => {
    const tracker = new TranslationContentTracker()
    tracker.shouldProcess(file)
    expect(tracker.shouldProcess(file)).toBe(false)

    tracker.forget(file)
    expect(tracker.shouldProcess(file)).toBe(true)
  })

  it('processes an unreadable file rather than swallowing the event', () => {
    expect(new TranslationContentTracker().shouldProcess(join(dir, 'gone.json'))).toBe(true)
  })

  it('tracks files independently', () => {
    const tracker = new TranslationContentTracker()
    const other = join(dir, 'de.json')
    writeFileSync(other, JSON.stringify({ greeting: 'Hallo' }))

    expect(tracker.shouldProcess(file)).toBe(true)
    expect(tracker.shouldProcess(other)).toBe(true)
    expect(tracker.shouldProcess(file)).toBe(false)
    expect(tracker.shouldProcess(other)).toBe(false)
  })
})
