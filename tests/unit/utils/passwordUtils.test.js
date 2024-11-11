const passwordUtils = require('../../../src/utils/passwordUtils');
const bcrypt = require('bcrypt');

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('Funciones de Bcrypt', () => {
  const mockPassword = 'password';
  const mockHashedPassword = 'hashedPassword';
  const saltRounds = 10;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debería hashear un password correctamente', async () => {
    bcrypt.hash.mockResolvedValue(mockHashedPassword);

    const password = await passwordUtils.hashPassword(mockPassword);

    expect(bcrypt.hash).toHaveBeenCalledWith(mockPassword, saltRounds);
    expect(password).toBe(mockHashedPassword);
  });

  it('Debería comparar un password correctamente', async () => {
    bcrypt.compare.mockResolvedValue(true);

    const isMatch = await passwordUtils.comparePassword(
      mockPassword,
      mockHashedPassword
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(
      mockPassword,
      mockHashedPassword
    );
    expect(isMatch).toBe(true);
  });

  it('Debería comparar un password incorrectamente', async () => {
    bcrypt.compare.mockResolvedValue(false);

    const isMatch = await passwordUtils.comparePassword(
      mockPassword,
      mockHashedPassword
    );

    expect(bcrypt.compare).toHaveBeenCalledWith(
      mockPassword,
      mockHashedPassword
    );
    expect(isMatch).toBe(false);
  });
});
