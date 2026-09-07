export class CustomerAuthUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CustomerAuthUnavailableError'
  }
}
