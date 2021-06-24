const { MissingParamError, InvalidParamError } = require('../../utils/errors');
const AuthUseCase = require('./auth-usecase');

const makeEncrypt = () => {
  class EncrypterSpy {
    async compare(password, hashedPassword) {
      this.password = password;
      this.hashedPassword = hashedPassword;

      return this.isValid;
    }
  }

  return new EncrypterSpy();
};

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    async load(email) {
      this.email = email;

      return this.user;
    }
  }

  return new LoadUserByEmailRepositorySpy();
};

const makeSut = () => {
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository();
  const encrypterSpy = makeEncrypt();

  encrypterSpy.isValid = true;
  loadUserByEmailRepositorySpy.user = {
    password: 'hashed_password',
  };

  const sut = new AuthUseCase(loadUserByEmailRepositorySpy, encrypterSpy);

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
  };
};

describe('Auth Usecase', () => {
  test('Should throw if no email is provided', async () => {
    const { sut } = makeSut();
    const promise = sut.auth();

    expect(promise).rejects.toThrow(new MissingParamError('email'));
  });

  test('Should throw if no password is provided', async () => {
    const { sut } = makeSut();
    const promise = sut.auth('any_email@mail.com');

    expect(promise).rejects.toThrow(new MissingParamError('password'));
  });

  test('Should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut();
    await sut.auth('valid_email@mail.com', 'any_password');

    expect(loadUserByEmailRepositorySpy.email).toBe('valid_email@mail.com');
  });

  test('Should throw if no LoadUserByEmailRepository is provided', async () => {
    const sut = new AuthUseCase();
    const promise = sut.auth('any_email@mail.com', 'any_password');

    expect(promise).rejects.toThrow(
      new MissingParamError('loadUserByEmailRepository')
    );
  });

  test('Should throw LoadUserByEmailRepository has no load method', async () => {
    const sut = new AuthUseCase({});
    const promise = sut.auth('any_email@mail.com', 'any_password');

    expect(promise).rejects.toThrow(
      new InvalidParamError('loadUserByEmailRepository')
    );
  });

  test('Should return null if an invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut();
    loadUserByEmailRepositorySpy.user = null;
    const accessToken = await sut.auth(
      'invalid_email@mail.com',
      'any_password'
    );

    expect(accessToken).toBeNull();
  });

  test('Should return null if an invalid password is provided', async () => {
    const { sut, encrypterSpy } = makeSut();

    encrypterSpy.isValid = false;

    const accessToken = await sut.auth(
      'valid_email@mail.com',
      'invalid_password'
    );

    expect(accessToken).toBeNull();
  });

  test('Should call Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut();
    await sut.auth('valid_email@mail.com', 'any_password');

    expect(encrypterSpy.password).toBe('any_password');
    expect(encrypterSpy.hashedPassword).toBe(
      loadUserByEmailRepositorySpy.user.password
    );
  });
});
