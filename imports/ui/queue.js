export default class Cursor extends Array {
  count() {
    return this.length
  }

  fetch() {
    return this
  }

  observe() {
    console.error('observe is not implemented')
  }

  observeChanges() {
    console.error('observeChanges is not implemented')
  }
}
