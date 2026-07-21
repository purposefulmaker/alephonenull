import { createReadStream } from 'node:fs';

/**
 * Stream a top-level JSON array one object at a time without loading the full
 * account export into memory. The parser deliberately accepts object elements
 * only: silently accepting a different export shape would be unsafe here.
 */
export async function* streamJsonObjectArray(path, options = {}) {
  const stream = createReadStream(path, {
    encoding: 'utf8',
    highWaterMark: options.highWaterMark ?? 1024 * 1024,
  });

  let sawArrayStart = false;
  let sawArrayEnd = false;
  let itemActive = false;
  let itemStart = 0;
  let itemParts = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let itemIndex = 0;

  for await (const chunk of stream) {
    options.onChunk?.(chunk);

    for (let index = 0; index < chunk.length; index += 1) {
      const character = chunk[index];

      if (!sawArrayStart) {
        if (/\s/u.test(character)) continue;
        if (character !== '[') {
          throw new Error('Expected the export to be a top-level JSON array');
        }
        sawArrayStart = true;
        continue;
      }

      if (sawArrayEnd) {
        if (!/\s/u.test(character)) {
          throw new Error('Unexpected content after the top-level JSON array');
        }
        continue;
      }

      if (!itemActive) {
        if (/\s/u.test(character) || character === ',') continue;
        if (character === ']') {
          sawArrayEnd = true;
          continue;
        }
        if (character !== '{') {
          throw new Error(`Expected object at top-level array index ${itemIndex}`);
        }
        itemActive = true;
        itemStart = index;
        itemParts = [];
        depth = 1;
        inString = false;
        escaped = false;
        continue;
      }

      if (inString) {
        if (escaped) escaped = false;
        else if (character === '\\') escaped = true;
        else if (character === '"') inString = false;
        continue;
      }

      if (character === '"') {
        inString = true;
      } else if (character === '{' || character === '[') {
        depth += 1;
      } else if (character === '}' || character === ']') {
        depth -= 1;
        if (depth === 0) {
          itemParts.push(chunk.slice(itemStart, index + 1));
          const serialized = itemParts.join('');
          let value;
          try {
            value = JSON.parse(serialized);
          } catch (error) {
            throw new Error(`Invalid JSON object at array index ${itemIndex}`, { cause: error });
          }
          yield value;
          itemIndex += 1;
          itemActive = false;
          itemParts = [];
        }
      }
    }

    if (itemActive) {
      itemParts.push(chunk.slice(itemStart));
      itemStart = 0;
    }
  }

  if (!sawArrayStart) throw new Error('The JSON export was empty');
  if (itemActive) throw new Error(`Truncated JSON object at array index ${itemIndex}`);
  if (!sawArrayEnd) throw new Error('The top-level JSON array was not closed');
}
