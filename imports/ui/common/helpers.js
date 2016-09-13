const year = new Date(new Date().getFullYear(), 0).getTime()

export function idToTimeString(id) {
  id = id / (1000 * 1000)
  const delta = Date.now() - id
  if (delta < 48 * 3600 * 1000) {
    return moment(id).fromNow()
  }
  else if (delta < 30 * 3600 * 1000) {
    return moment(id).format('D/M HH:mm')
  }
  else {
    return moment(id).format('M/D/YY')
  }
}
