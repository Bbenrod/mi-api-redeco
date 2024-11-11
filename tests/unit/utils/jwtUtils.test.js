const jwtUtils = require('../../../src/utils/jwtUtils');
const jwt = require('jsonwebtoken');

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn(),
  TokenExpiredError: jest.requireActual('jsonwebtoken').TokenExpiredError,
}));

describe('Funciones de JWT', () => {
  const mockPayload = { userId: 1, username: 'usuario' };
  const mockToken = 'token_mock';
  const mockDecoded = { userId: 1, username: 'usuario' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Debería crear un token correctamente', () => {
    jwt.sign.mockReturnValue(mockToken);

    const token = jwtUtils.createToken(mockPayload);

    expect(jwt.sign).toHaveBeenCalledWith(mockPayload, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    expect(token).toBe(mockToken);
  });

  it('Debería verificar un token correctamente', () => {
    jwt.verify.mockReturnValue(mockDecoded);

    const decoded = jwtUtils.verifyToken(mockToken);

    expect(jwt.verify).toHaveBeenCalledWith(mockToken, process.env.JWT_SECRET);
    expect(decoded).toEqual(mockDecoded);
  });

  it('Debería lanzar un error si el token ha expirado', () => {
    jwt.verify.mockImplementation(() => {
      const error = new jwt.TokenExpiredError(
        'El token ha expirado',
        new Date()
      );
      throw error;
    });

    try {
      jwtUtils.verifyToken(mockToken);
    } catch (e) {
      expect(e).toBeInstanceOf(jwt.TokenExpiredError);
      expect(e.message).toBe(
        'El token ha expirado. Por favor, renueva tu token.'
      );
    }
  });

  it('Debería lanzar un error si el token es inválido', () => {
    jwt.verify.mockImplementation(() => {
      throw new Error('Token inválido');
    });

    try {
      jwtUtils.verifyToken(mockToken);
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect(e.message).toBe('Token inválido.');
    }
  });
});
