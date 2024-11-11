// Mock de passwordUtils
jest.mock('../../../src/utils/passwordUtils', () => ({
  hashPassword: (a) => Promise.resolve(a),
  comparePassword: (a, b) => Promise.resolve(a === b),
}));

// Mock de jwtUtils
const mockVerifyToken = jest.fn();
const mockCreateToken = jest.fn();

jest.mock('../../../src/utils/jwtUtils', () => ({
  verifyToken: mockVerifyToken,
  createToken: mockCreateToken,
}));

// Mock de Usuario y SuperUsuario
const mockUsuarioFindOne = jest.fn();
const mockUsuarioCreate = jest.fn();

jest.mock('../../../src/models/usuario', () => ({
  findOne: mockUsuarioFindOne,
  create: mockUsuarioCreate,
}));

const mockSuperUsuarioFindOne = jest.fn();
const mockSuperUserCreate = jest.fn();

jest.mock('../../../src/models/superUsuario', () => ({
  findOne: mockSuperUsuarioFindOne,
  create: mockSuperUserCreate,
}));

// Spy en logger.error
const logger = require('../../../src/utils/logger');
const loggerErrorSpy = jest.spyOn(logger, 'error');

const {
  createSuperUser,
  getToken,
  createUser,
} = require('../../../src/controllers/usersController');
const { verify } = require('crypto');

describe('Funciones de Controladores de Usuarios', () => {
  let mockToken;
  let mockUser;
  let mockSuperUser;
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockToken = 'mockToken';

    mockUser = {
      username: 'testuser',
      password: 'testpassword',
    };

    mockSuperUser = {
      username: 'testsuperuser',
      password: 'testpassword',
      token_access: mockToken,
      save: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      headers: {
        authorization: mockToken,
      },
      body: {},
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('Casos de createSuperUser', () => {
    let existingSuperUser;

    beforeEach(() => {
      mockRequest.body = {
        ...mockSuperUser,
        key: '123',
        confirm_password: mockSuperUser.password,
      };
      mockSuperUsuarioFindOne.mockResolvedValue(null);

      // Crear la instancia del usuario existente
      existingSuperUser = {
        username: mockSuperUser.username,
        password: mockSuperUser.password,
        token_access: mockToken,
        userid: 1,
        save: jest.fn().mockResolvedValue(true),
      };
    });

    it('Debería crear y devolver un nuevo superusuario si no existe previamente', async () => {
      // Aquí mockeamos la creación de un nuevo superusuario
      mockSuperUserCreate.mockResolvedValue({
        userid: 1,
        username: mockSuperUser.username,
        token_access: mockToken,
        save: jest.fn(),
      });
      mockCreateToken.mockReturnValue(mockToken);

      await createSuperUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El superusuario ha sido creado exitosamente!',
        data: {
          userid: 1,
          username: mockSuperUser.username,
          token_access: mockToken,
        },
      });
    });

    it('Debería devolver el superusuario existente si las credenciales son correctas y el token es válido', async () => {
      // Aquí mockeamos que el usuario ya existe
      mockSuperUsuarioFindOne.mockResolvedValue(existingSuperUser);
      mockVerifyToken.mockReturnValue(true);

      await createSuperUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El superusuario ya existe. Se ha validado la autenticación.',
        data: {
          userid: existingSuperUser.userid,
          username: existingSuperUser.username,
          token_access: existingSuperUser.token_access,
        },
      });
    });

    it('Debería devolver un nuevo token si las credenciales son correctas y el token es inválido', async () => {
      // Aquí mockeamos que el token del usuario es inválido y se crea un nuevo token
      mockSuperUsuarioFindOne.mockResolvedValue(existingSuperUser);
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Token inválido');
      });
      mockCreateToken.mockReturnValue(mockToken);

      await createSuperUser(mockRequest, mockResponse);

      expect(existingSuperUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El superusuario ya existe. Se ha validado la autenticación.',
        data: {
          userid: existingSuperUser.userid,
          username: existingSuperUser.username,
          token_access: mockToken,
        },
      });
    });

    it('Debería devolver error 403 si la llave de acceso es incorrecta', async () => {
      mockRequest.body.key = 'incorrect-key';

      await createSuperUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Llave de acceso incorrecta.',
      });
    });

    it('Debería devolver error 400 si las contraseñas no coinciden', async () => {
      mockRequest.body.password = 'password1';
      mockRequest.body.confirm_password = 'password2';

      await createSuperUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Las contraseñas no coinciden.',
      });
    });

    it('Debería devolver error 401 si la contraseña es incorrecta', async () => {
      mockRequest.body.password = 'wrongpassword';
      mockRequest.body.confirm_password = 'wrongpassword';
      // Aquí mockeamos que el usuario ya existe
      mockSuperUsuarioFindOne.mockResolvedValue(existingSuperUser);
      mockVerifyToken.mockReturnValue(true);

      await createSuperUser(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Contraseña incorrecta.',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('Debería devolver error 401 si el username está vacío', async () => {
      mockRequest.body.username = '';

      await createSuperUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuario vacio.',
      });
    });

    it('Debería devolver error 500 si ocurre un error inesperado en el servidor', async () => {
      const error = new Error('Error de servidor simulado');
      mockSuperUsuarioFindOne.mockRejectedValue(error);

      await createSuperUser(mockRequest, mockResponse);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error al crear el superUsuario:',
        error
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al procesar la solicitud.',
        error,
      });
    });
  });

  describe('Casos de createUser', () => {
    let existingUser;

    beforeEach(() => {
      mockRequest.body = {
        ...mockUser,
        confirm_password: mockUser.password,
      };
      mockRequest.user = { id: 1 };

      mockUsuarioFindOne.mockResolvedValue(null);
      mockSuperUsuarioFindOne.mockResolvedValue(mockSuperUser);

      // Crear la instancia del usuario existente
      existingUser = {
        username: mockUser.username,
        password: mockUser.password,
        userid: 1,
        save: jest.fn().mockResolvedValue(true),
      };
    });

    it('Debería crear y devolver un nuevo usuario si no existe previamente', async () => {
      mockUsuarioCreate.mockResolvedValue({
        userid: 1,
        username: mockUser.username,
      });
      mockCreateToken.mockReturnValue(mockToken);

      await createUser(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuario creado exitosamente.',
        data: {
          userid: 1,
          username: mockUser.username,
          token_access: mockToken,
        },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(201);
    });

    it('Debería devolver el usuario existente si las credenciales son correctas y el token es válido', async () => {
      mockUsuarioFindOne.mockResolvedValue(existingUser);
      mockVerifyToken.mockReturnValue(true);

      await createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'El usuario ya existe, devolviendo token del superusuario.',
        data: {
          userid: existingUser.userid,
          username: existingUser.username,
          token_access: mockToken,
        },
      });
    });

    it('Debería devolver error 404 si el superusuario no existe', async () => {
      mockSuperUsuarioFindOne.mockResolvedValue(null);

      await createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Superusuario no encontrado.',
      });
    });

    it('Debería devolver error 401 si el token del superusuario es válido o si ha expirado', async () => {
      mockUsuarioFindOne.mockResolvedValue(existingUser);
      mockVerifyToken.mockImplementation(() => {
        throw new Error('Token inválido');
      });

      await createUser(mockRequest, mockResponse);

      expect(mockVerifyToken).toHaveBeenCalledWith(mockToken);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message:
          'El token del superusuario ha caducado o es inválido. Por favor, actualízalo en /auth/users/token/.',
      });
    });

    it('Debería devolver error 400 si las contraseñas no coinciden', async () => {
      mockRequest.body.password = 'password1';
      mockRequest.body.confirm_password = 'password2';

      await createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Las contraseñas no coinciden.',
      });
    });

    it('Debería devolver error 401 si la contraseña es incorrecta', async () => {
      mockRequest.body.password = 'wrongpassword';
      mockRequest.body.confirm_password = 'wrongpassword';
      mockUsuarioFindOne.mockResolvedValue(existingUser);
      mockVerifyToken.mockReturnValue(true);

      await createUser(mockRequest, mockResponse);

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Contraseña incorrecta.',
      });
      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });

    it('Debería devolver error 401 si el username está vacío', async () => {
      mockRequest.body.username = '';

      await createUser(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuario vacío.',
      });
    });

    it('Debería devolver error 500 si ocurre un error inesperado en el servidor', async () => {
      const error = new Error('Error de servidor simulado');
      mockUsuarioFindOne.mockRejectedValue(error);

      await createUser(mockRequest, mockResponse);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error al crear el usuario:',
        error
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al crear el usuario.',
        error: error.message || error,
      });
    });
  });

  describe('Casos de getToken', () => {
    beforeEach(() => {
      mockRequest.body = mockSuperUser;
      mockSuperUsuarioFindOne.mockResolvedValue(mockSuperUser);
    });

    it('Debería devolver el token existente si el usuario y contraseña son correctos y el token es válido', async () => {
      await getToken(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Autenticación exitosa',
        user: {
          username: mockSuperUser.username,
          token_access: mockToken,
        },
      });
    });

    it('Debería generar y devolver un nuevo token si el usuario y contraseña son correctos y el token es inválido o expirado', async () => {
      const error = new Error('Error en el token simulado para la prueba');
      mockVerifyToken.mockImplementation(() => {
        throw error;
      });

      mockCreateToken.mockReturnValue(mockToken);

      await getToken(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Autenticación exitosa',
        user: {
          username: mockSuperUser.username,
          token_access: mockToken,
        },
      });
      expect(mockSuperUser.save).toHaveBeenCalled();
    });

    it('Debería devolver error 401 si la contraseña es incorrecta', async () => {
      mockRequest.body = {
        username: mockSuperUser.username,
        password: 'wrongpassword',
      };
      await getToken(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Contraseña incorrecta.',
      });
    });

    it('Debería devolver error 404 si el usuario no existe', async () => {
      mockSuperUsuarioFindOne.mockResolvedValue(null);
      mockRequest.body = {
        username: 'wrongtestsuperuser',
        password: 'wrongtestpassword',
      };
      await getToken(mockRequest, mockResponse);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Usuario no encontrado.',
      });
    });

    it('Debería devolver error 500 si ocurre un error en el servidor', async () => {
      const error = new Error('Error en servidor simulado para la prueba');
      mockSuperUsuarioFindOne.mockRejectedValue(error);

      await getToken(mockRequest, mockResponse);

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error al obtener el token:',
        error
      );
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error al obtener el token',
        error,
      });
    });
  });
});
