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
    });

    it.skip('should respond with a 200 and matching projects if a name query is given', async () => {
      const expectedProject = await database('projects').first();
      const response = await request(app).get('/api/v1/projects?name=Project+1');
      expect(response.status).toEqual(200);
      // how do we get created at and updated at fields to match up - json vs string?
      expect(response.body).toEqual([expectedProject]);
    });

    it('should respond with a 200 and matching projects if a partial name query is given', async () => {

    });
    
    it('should respond with a 204 if there are no projects in the db', async () => {
      await database('palettes').del();
      await database('projects').del();
      const response = await request(app).get('/api/v1/projects');
      expect(response.status).toEqual(204);
    });

    it('should respond with a 204 if a name query is given with no matches', async () => {

    });

    it('should respond with a 500 and error message if not successful', async () => {
      // if table doesn't exist?
    });
  });

  describe('GET /api/v1/projects/:id', () => {

    it('should respond with a 200 and the specific project if it exists', async () => {
      const expectedProject = await database('projects').first();
      const response = await request(app).get(`/api/v1/projects/${expectedProject.id}`)
      expect(response.status).toEqual(200)
      expect(response.body[0].id).toEqual(expectedProject.id)
    })

    it('should respond with a 204 if the specific project does not exist', async () => {
      const expectedProject = await database('projects').first();
      const response = await request(app).get(`/api/v1/projects/${expectedProject.id - 1}`)
      expect(response.status).toEqual(204)
    })

    it('should respond with a 500 and error message if not successful', async () => {
      // if table doesn't exist?
    })
  })

  describe('GET /api/v1/palettes/:id', () => {

    it('should respond with a 200 and the specific palette if it exists', async () => {
      const expectedPalette = await database('palettes').first();
      const response = await request(app).get(`/api/v1/palettes/${expectedPalette.id}`)
      expect(response.status).toEqual(200)
      expect(response.body[0].id).toEqual(expectedPalette.id)
    })

    it('should respond with a 204 if the specific palette does not exist', async () => {
      const expectedPalette = await database('palettes').first();
      const response = await request(app).get(`/api/v1/palettes/${expectedPalette.id - 1}`)
      expect(response.status).toEqual(204)
    })

    it('should respond with a 500 and error message if not successful', async () => {
      // if table doesn't exist?
    })
  })

  
})