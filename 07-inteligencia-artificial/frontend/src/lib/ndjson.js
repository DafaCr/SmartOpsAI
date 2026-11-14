/**
 * Lee un ReadableStream NDJSON (una línea JSON por evento) y va devolviendo
 * cada evento en cuanto llega su línea completa.
 */
export async function * readNdjson (stream) {
  const reader = stream.pipeThrough(new TextDecoderStream()).getReader()
  let buffer = ''

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += value

      let newline
      while ((newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline).trim()
        buffer = buffer.slice(newline + 1)
        if (line) yield JSON.parse(line)
      }
    }
    if (buffer.trim()) yield JSON.parse(buffer)
  } finally {
    reader.releaseLock()
  }
}
