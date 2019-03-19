import request from 'supertest';
import app from './app';
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

describe('Server', () => {

  beforeEach(async () => {
    await database.seed.run();
  });

  describe('GET /api/v1/projects', () => {
    it('should respond with a 200 and all projects in db if successful', async () => {
      const numExpectedProjects = 2;
      const response = await request(app).get('/api/v1/projects');
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(numExpectedProjects);
    })
    
    it('should respond with a 204 if there are no projects in the db', async () => {
      await database('palettes').del();
      await database('projects').del();
      const response = await request(app).get('/api/v1/projects');
      expect(response.status).toEqual(204);
    });

    it('should respond with a 500 and error message if not successful', async () => {
      // if table doesn't exist?
    });
  });

  
})