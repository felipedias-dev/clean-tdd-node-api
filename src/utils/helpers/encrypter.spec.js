const bcrypt = require('bcrypt');
const Encrypter = require('./encrypter');
const { MissingParamError } = require('../errors');

const makeSut = () => {
  return new Encrypter();
};

describe('Encrypter', () => {
  test('Should return true if bcrypt returns true', async () => {
    const sut = makeSut();
    const isValid = await sut.compare('any_value', 'hashed_value');

    expect(isValid).toBe(true);
  });

  test('Should return false if bcrypt returns false', async () => {
    bcrypt.isValid = false;

    const sut = makeSut();
    const isValid = await sut.compare('any_value', 'hashed_value');

    expect(isValid).toBe(false);
  });

  test('Should call bcrypt with correct values', async () => {
    const sut = makeSut();
    await sut.compare('any_value', 'hashed_value');

    expect(bcrypt.value).toBe('any_value');
    expect(bcrypt.hash).toBe('hashed_value');
  });

  test('Should throw if no params are provided', async () => {
    const sut = makeSut();

    expect(sut.compare()).rejects.toThrow(new MissingParamError('value'));
    expect(sut.compare('value')).rejects.toThrow(new MissingParamError('hash'));
  });
});
