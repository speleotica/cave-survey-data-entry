export async function slurp<T>(iterable: AsyncIterable<T>): Promise<T[]> {
  const array: T[] = []
  for await (const elem of iterable) array.push(elem)
  return array
}
