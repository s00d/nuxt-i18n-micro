const ENTITY: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }

export const escapeHtml = (text: string): string => text.replace(/[&<>"]/g, (char) => ENTITY[char]!)
