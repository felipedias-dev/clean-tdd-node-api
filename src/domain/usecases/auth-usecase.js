const { MissingParamError, InvalidParamError } = require('../../utils/errors');

module.exports = class AuthUseCase {
  constructor(loadUserByEmailRepository) {
    this.loadUserByEmailRepository = loadUserByEmailRepository;
  }

  async auth(email, password) {
    if (!this.loadUserByEmailRepository) {
      throw new MissingParamError('loadUserByEmailRepository');
    }

    if (!this.loadUserByEmailRepository.load) {
      throw new InvalidParamError('loadUserByEmailRepository');
    }

    if (!email) {
      throw new MissingParamError('email');
    }

    if (!password) {
      throw new MissingParamError('password');
    }

    const user = await this.loadUserByEmailRepository.load(email);
    if (!user) {
      return null;
    }

    return null;
  }
};
