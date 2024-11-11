const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../../../src/middlewares/authHandler');
const jwtUtils = require('../../../src/utils/jwtUtils');

jest.mock('../../../src/utils/jwtUtils', () => ({
  createToken: jest.fn(),
  verifyToken: jest.fn(),
}));

describe('Funciones de Autenticación', () => {
  const mockRequest = {
    headers: {
      authorization: 'Bearer token',
    },
  };
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  const mockNext = jest.fn();

  it('Debería verificar el token y llamar al siguiente middleware', () => {
    jwtUtils.verifyToken.mockReturnValue({ userId: 1 });
    authMiddleware(mockRequest, mockResponse, mockNext);
    expect(jwtUtils.verifyToken).toHaveBeenCalledWith('token');
    expect(mockNext).toHaveBeenCalled();
  });

  it('Debería devolver un error de autenticación si el token es inválido', () => {
    jwtUtils.verifyToken.mockImplementation(() => {
      throw new jwt.JsonWebTokenError('Token inválido.');
    });
    authMiddleware(mockRequest, mockResponse, mockNext);
    expect(jwtUtils.verifyToken).toHaveBeenCalledWith('token');
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Token inválido.',
    });
  });

  it('Debería devolver un error de autenticación si el token ha expirado', () => {
    jwtUtils.verifyToken.mockImplementation(() => {
      const error = new jwt.TokenExpiredError(
        'El token ha expirado',
        new Date()
      );
      throw error;
    });
    authMiddleware(mockRequest, mockResponse, mockNext);
    expect(jwtUtils.verifyToken).toHaveBeenCalledWith('token');
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message:
        'Token expirado. Por favor, renueva tu token en /auth/users/token',
    });
  });
  it('Debería devolver un error si el token no es enviado', () => {
    mockRequest.headers = {};
    authMiddleware(mockRequest, mockResponse, mockNext);
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: 'Acceso denegado. No se proporcionó un token.',
    });
  });
});
