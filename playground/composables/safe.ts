/** A helper that throws is a reading too: it must not take the rest of the bench page down. */
export const safe = <T>(read: () => T): T | string => {
  try {
    return read()
  } catch (error) {
    return `THROW ${(error as Error).message}`
  }
}
