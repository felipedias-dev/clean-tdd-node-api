const { MissingParamError } = require('../../utils/errors');
const AuthUseCase = require('./auth-usecase');

const makeSut = () => {
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository();
  const updateAccessTokenRepositorySpy = makeUpdateAccessTokenRepository();
  const encrypterSpy = makeEncrypter();
  const tokenGeneratorSpy = makeTokenGenerator();

  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    updateAccessTokenRepository: updateAccessTokenRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy,
  });

  return {
    sut,
    loadUserByEmailRepositorySpy,
    updateAccessTokenRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy,
  };
};

const makeEncrypter = () => {
  class EncrypterSpy {
    constructor() {
      this.isValid = true;
    }

    async compare(password, hashedPassword) {
      this.password = password;
      this.hashedPassword = hashedPassword;

      return this.isValid;
    }
  }

  return new EncrypterSpy();
};

const makeEncrypterWithError = () => {
  class EncrypterSpy {
    async compare() {
      throw new Error();
    }
  }

  return new EncrypterSpy();
};

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepositorySpy {
    constructor() {
      this.user = {
        id: 'any_id',
        password: 'hashed_password',
      };
    }

    async load(email) {
      this.email = email;

      return this.user;
    }
  }

  return new LoadUserByEmailRepositorySpy();
};

const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepositorySpy {
    async load() {
      throw new Error();
    }
  }

  return new LoadUserByEmailRepositorySpy();
};

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    constructor() {
      this.accessToken = 'any_token';
    }

    async generate(userId) {
      this.userId = userId;

      return this.accessToken;
    }
  }

  return new TokenGeneratorSpy();
};

const makeTokenGeneratorWithError = () => {
  class TokenGeneratorSpy {
    async generate() {
      throw new Error();
    }
  }

  return new TokenGeneratorSpy();
};

const makeUpdateAccessTokenRepository = () => {
  class UpdateAccessTokenRepositorySpy {
    async update(userId, accessToken) {
      this.userId = userId;
      this.accessToken = accessToken;
    }
  }

  return new UpdateAccessTokenRepositorySpy();
};

const makeUpdateAccessTokenRepositoryWithError = () => {
  class UpdateAccessTokenRepositorySpy {
    async update() {
      throw new Error();
    }
  }

  return new UpdateAccessTokenRepositorySpy();
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

  test('Should call TokenGenerator with correct userId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut();
    await sut.auth('valid_email@mail.com', 'any_password');

    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id);
  });

  test('Should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGeneratorSpy } = makeSut();
    const accessToken = await sut.auth('valid_email@mail.com', 'any_password');

    expect(accessToken).toBe(tokenGeneratorSpy.accessToken);
    expect(accessToken).toBeTruthy();
  });

  test('Should call UpdateAccessTokenRepository with correct values', async () => {
    const {
      sut,
      loadUserByEmailRepositorySpy,
      updateAccessTokenRepositorySpy,
      tokenGeneratorSpy,
    } = makeSut();
    await sut.auth('valid_email@mail.com', 'any_password');

    expect(updateAccessTokenRepositorySpy.userId).toBe(
      loadUserByEmailRepositorySpy.user.id
    );
    expect(updateAccessTokenRepositorySpy.accessToken).toBe(
      tokenGeneratorSpy.accessToken
    );
  });

  test('Should throw if invalid dependencies are provided', async () => {
    const invalid = {};
    const loadUserByEmailRepository = makeLoadUserByEmailRepository();
    const encrypter = makeEncrypter();
    const tokenGenerator = makeTokenGenerator();
    const suts = [].concat(
      new AuthUseCase(),
      new AuthUseCase({}),
      new AuthUseCase({
        loadUserByEmailRepository: invalid,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: invalid,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: invalid,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository: invalid,
      })
    );

    suts.forEach((sut) => {
      const promise = sut.auth('any_email@mail.com', 'any_password');

      expect(promise).rejects.toThrow();
    });
  });

  test('Should throw if any dependency throws', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository();
    const encrypter = makeEncrypter();
    const tokenGenerator = makeTokenGenerator();
    const suts = [].concat(
      new AuthUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError(),
        encrypter,
        tokenGenerator,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: makeEncrypterWithError(),
        tokenGenerator,
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: makeTokenGeneratorWithError(),
      })
    );

    suts.forEach((sut) => {
      const promise = sut.auth('any_email@mail.com', 'any_password');

      expect(promise).rejects.toThrow();
    });
  });
});
