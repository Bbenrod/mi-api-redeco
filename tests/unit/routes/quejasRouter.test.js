const request = require('supertest');
const express = require('express');

jest.mock('../../../src/middlewares/authHandler', () => ({
  authMiddleware: jest.fn((req, res, next) => next()),
}));

const mockCreateQueja = jest.fn();
const mockDeleteQueja = jest.fn();
const mockGetQuejas = jest.fn();

jest.mock('../../../src/controllers/quejasController', () => ({
  createQueja: mockCreateQueja,
  deleteQueja: mockDeleteQueja,
  getQuejas: mockGetQuejas,
}));

const quejasRouter = require('../../../src/routes/quejasRouter');

describe('Test de las rutas de Quejas', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/quejas', quejasRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /quejas', () => {
    it('Debería retornar el código de status 400', async () => {
      mockCreateQueja.mockImplementationOnce((req, res) => {
        return res.status(400).send();
      });

      const response = await request(app).post('/quejas').send({});

      expect(response.status).toBe(400);
    });

    it('Debería retornar el código de status 200', async () => {
      mockCreateQueja.mockImplementationOnce((req, res) => {
        return res.status(200).send();
      });

      const response = await request(app)
        .post('/quejas')
        .send([{ description: 'Nueva queja' }]);

      expect(response.status).toBe(200);
    });

    it('Debería retornar el código de status 400', async () => {
      mockCreateQueja.mockImplementationOnce((req, res) => {
        return res.status(400).send();
      });

      const response = await request(app)
        .post('/quejas')
        .send([{ description: '' }]);

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /quejas', () => {
    it('Debería retornar el código de status 200', async () => {
      mockDeleteQueja.mockImplementationOnce((req, res) => {
        return res.status(200).send();
      });

      const response = await request(app)
        .delete('/quejas')
        .send({ id: 'FOLIO123' });

      expect(response.status).toBe(200);
    });

    it('Debería retornar el código de status 400', async () => {
      mockDeleteQueja.mockImplementationOnce((req, res) => {
        return res.status(400).send();
      });

      const response = await request(app).delete('/quejas').send({});

      expect(response.status).toBe(400);
    });

    it('Debería retornar el código de status 404', async () => {
      mockDeleteQueja.mockImplementationOnce((req, res) => {
        return res.status(404).send();
      });

      const response = await request(app)
        .delete('/quejas')
        .send({ id: 'FOLIO123' });

      expect(response.status).toBe(404);
    });
  });

  describe('GET /quejas', () => {
    it('Debería retornar el código de status 200', async () => {
      mockGetQuejas.mockImplementationOnce((req, res) => {
        return res.status(200).send();
      });

      const response = await request(app).get('/quejas');

      expect(response.status).toBe(200);
    });

    it('Debería retornar el código de status 400', async () => {
      mockGetQuejas.mockImplementationOnce((req, res) => {
        return res.status(400).send();
      });

      const response = await request(app)
        .get('/quejas')
        .send({ month: 'inválido' });

      expect(response.status).toBe(400);
    });

    it('Debería retornar el código de status 500', async () => {
      mockGetQuejas.mockImplementationOnce((req, res) => {
        return res.status(500).send();
      });

      const response = await request(app).get('/quejas');

      expect(response.status).toBe(500);
    });
  });
});
