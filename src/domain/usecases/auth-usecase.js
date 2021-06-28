const { MissingParamError, InvalidParamError } = require('../../utils/errors');

module.exports = class AuthUseCase {
  constructor({
    loadUserByEmailRepository,
    updateAccessTokenRepository,
    encrypter,
    tokenGenerator,
  } = {}) {
    this.loadUserByEmailRepository = loadUserByEmailRepository;
    this.updateAccessTokenRepository = updateAccessTokenRepository;
    this.encrypter = encrypter;
    this.tokenGenerator = tokenGenerator;
  }

  async auth(email, password) {
    if (!this.loadUserByEmailRepository) {
      throw new MissingParamError('loadUserByEmailRepository');
    }

    if (!this.loadUserByEmailRepository.load) {
      throw new InvalidParamError('loadUserByEmailRepository');
    }

    if (!this.encrypter) {
      throw new MissingParamError('encrypter');
    }

    if (!this.encrypter.compare) {
      throw new InvalidParamError('encrypter');
    }

    if (!this.tokenGenerator) {
      throw new MissingParamError('tokenGenerator');
    }

    if (!this.tokenGenerator.generate) {
      throw new InvalidParamError('tokenGenerator');
    }

    if (!email) {
      throw new MissingParamError('email');
    }

    if (!password) {
      throw new MissingParamError('password');
    }

    const user = await this.loadUserByEmailRepository.load(email);
    const isValid =
      user && (await this.encrypter.compare(password, user.password));

    if (isValid) {
      const accessToken = await this.tokenGenerator.generate(user.id);
      await this.updateAccessTokenRepository.update(user.id, accessToken);

      return accessToken;
    }

    return null;
  }
};
