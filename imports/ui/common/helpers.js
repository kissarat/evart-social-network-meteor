export function idToTimeString(id) {
  return new Date(id / (1000 * 1000)).toLocaleString()
}
