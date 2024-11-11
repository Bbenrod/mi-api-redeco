const request = require('supertest');
const express = require('express');

jest.mock('../../../src/middlewares/authHandler', () => ({
  authMiddleware: jest.fn((req, res, next) => next()),
}));

const mockCreateUser = jest.fn();
const mockCreateSuperUser = jest.fn();
const mockGetToken = jest.fn();

jest.mock('../../../src/controllers/usersController', () => ({
  createUser: mockCreateUser,
  createSuperUser: mockCreateSuperUser,
  getToken: mockGetToken,
}));

const usersRouter = require('../../../src/routes/usersRouter');

describe('Test de las rutas de Usuarios', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api', usersRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/create-super-user', () => {
    it('Debería retornar el código de status 400', async () => {
      mockCreateSuperUser.mockImplementationOnce((req, res) => {
        return res.status(400).send();
      });

      const response = await request(app)
        .post('/api/create-super-user')
        .send({});

      expect(response.status).toBe(400);
    });

    it('Debería retornar el código de status 201', async () => {
      mockCreateSuperUser.mockImplementationOnce((req, res) => {
        return res.status(201).send();
      });

      const response = await request(app).post('/api/create-super-user').send({
        key: '123',
        username: 'superadmin',
        password: 'password123',
        confirm_password: 'password123',
      });

      expect(response.status).toBe(201);
    });
  });

  describe('POST /api/create-user', () => {
    it('Debería retornar el código de status 401', async () => {
      mockCreateUser.mockImplementationOnce((req, res) => {
        return res.status(401).send();
      });

      const response = await request(app).post('/api/create-user').send({});

      expect(response.status).toBe(401);
    });

    it('Debería retornar el código de status 201', async () => {
      mockCreateUser.mockImplementationOnce((req, res) => {
        return res.status(201).send();
      });

      const response = await request(app)
        .post('/api/create-user')
        .set('Authorization', 'Bearer valid_token')
        .send({
          username: 'newuser',
          password: 'password123',
          confirm_password: 'password123',
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/token', () => {
    it('Debería retornar el código de status 200', async () => {
      mockGetToken.mockImplementationOnce((req, res) => {
        return res.status(200).send({ token: 'some_token' });
      });

      const response = await request(app).get('/api/token').send({});

      expect(response.status).toBe(200);
    });

    it('Debería retornar el código de status 401', async () => {
      mockGetToken.mockImplementationOnce((req, res) => {
        return res.status(401).send();
      });

      const response = await request(app).get('/api/token').send({
        username: 'superadmin',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
    });
  });
});
