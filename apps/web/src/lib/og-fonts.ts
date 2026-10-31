import { readFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Font binaries for `ImageResponse` in the OG route handler. Read from
 * `public/fonts` on the Node runtime; kept separate from `fonts.ts` because
 * that module uses `next/font`, which Turbopack only supports inside the
 * React component graph, not in route handlers.
 */
const fontsDir = path.join(process.cwd(), 'public', 'fonts')

export async function getFonts() {
  const [bold, regular] = await Promise.all([
    readFile(path.join(fontsDir, 'Geist-Bold.ttf')),
    readFile(path.join(fontsDir, 'Geist-Regular.ttf')),
  ])

  return {
    bold: bold.buffer.slice(bold.byteOffset, bold.byteOffset + bold.byteLength),
    regular: regular.buffer.slice(
      regular.byteOffset,
      regular.byteOffset + regular.byteLength
    ),
  }
}
