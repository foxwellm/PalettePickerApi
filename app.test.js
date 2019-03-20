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
      const currentProjects = await database('projects')
      const numExpectedProjects = currentProjects.length;
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
      const response = await request(app).get(`/api/v1/projects/${expectedProject.id}`);
      expect(response.status).toEqual(200);
      expect(response.body[0].id).toEqual(expectedProject.id);
    })

    it('should respond with a 204 if the specific project does not exist', async () => {
      const firstProject = await database('projects').first();
      const nonExistantProject = firstProject.id -1;
      const response = await request(app).get(`/api/v1/projects/${nonExistantProject}`);
      expect(response.status).toEqual(204);
    })

    it('should respond with a 500 and error message if not successful', async () => {
      // if table doesn't exist?
    })
  })

  describe('GET /api/v1/palettes/:id', () => {

    it('should respond with a 200 and the specific palette if it exists', async () => {
      const expectedPalette = await database('palettes').first();
      const response = await request(app).get(`/api/v1/palettes/${expectedPalette.id}`);
      expect(response.status).toEqual(200);
      expect(response.body[0].id).toEqual(expectedPalette.id);
    })

    it('should respond with a 204 if the specific palette does not exist', async () => {
      const firstPalette = await database('palettes').first();
      const nonExistantPalette = firstPalette.id - 1;
      const response = await request(app).get(`/api/v1/palettes/${nonExistantPalette}`);
      expect(response.status).toEqual(204);
    })

    it('should respond with a 500 and error message if not successful', async () => {
      // if table doesn't exist?
    })
  })

  describe('GET /api/v1/projects/:id/palettes', () => {

    it.skip('should respond with a 200 and the specific project if it exists with all its associated palettes', async () => {
      const expectedProject = await database('projects').first();
      const allPalettes = await database('palettes');
      const expectedPalettes = allPalettes.filter(palette => palette.project_id === expectedProject.id);
      const response = await request(app).get(`/api/v1/projects/${expectedProject.id}/palettes`);
      expect(response.status).toEqual(200);
      expect(response.body.matchingProject[0].id).toEqual(expectedProject.id);
      expect(response.body.matchingPalettes).toEqual([expectedPalettes]);
    })

    it('should respond with a 204 if the specific project does not exist', async () => {
      const firstProject = await database('projects').first();
      const nonExistantProject = firstProject.id - 1;
      const response = await request(app).get(`/api/v1/projects/${nonExistantProject}/palettes`);
      expect(response.status).toEqual(204);
    })

    it(`should respond with a 200, the specific project and an empty array
        if it exists but has no associated palettes`, async () => {
      const expectedProject = await database('projects').where('name', 'Empty').select();
      const allPalettes = await database('palettes');
      const expectedPalettes = allPalettes.filter(palette => palette.project_id === expectedProject[0].id);
      const response = await request(app).get(`/api/v1/projects/${expectedProject[0].id}/palettes`);
      expect(response.status).toEqual(200);
      expect(response.body.matchingProject[0].id).toEqual(expectedProject[0].id);
      expect(response.body.matchingPalettes).toEqual(expectedPalettes);
    })
  })

  describe('DELETE /api/v1/projects/:id', () => {

    it('should respond with a 202 if it was successful and has removed a project from the database with all associated palettes', async () => {
      const projectToDelete = await database('projects').first();
      const allPalettes = await database('palettes');
      const palettesToDelete = await database('palettes').where('project_id', projectToDelete.id);
      const numExpectedPalettes= allPalettes.length - palettesToDelete.length;
      const response = await request(app).delete(`/api/v1/projects/${projectToDelete.id}`);
      const remainingPalettes = await database('palettes');
      expect(response.status).toEqual(202);
      expect(numExpectedPalettes).toEqual(remainingPalettes.length);
    });

    it('should respond with a 202 if it was successful and has removed a project from the database even if no associated palettes exist', async () => {
      const projectToDelete = await database('projects').where('name', 'Empty')
      const numExpectedPalettes = await database('palettes');
      const response = await request(app).delete(`/api/v1/projects/${projectToDelete[0].id}`);
      const remainingPalettes = await database('palettes');
      expect(response.status).toEqual(202);
      expect(numExpectedPalettes.length).toEqual(remainingPalettes.length);
    });

    it('should respond with a 204 if project with specific id does not exist', async () => {
      const firstProject = await database('projects').first();
      const nonExistantProject = firstProject.id - 1;
      const response = await request(app).delete(`/api/v1/palettes/${nonExistantProject}`);
      expect(response.status).toEqual(204);
    });
  })

  describe('DELETE /api/v1/palettes/:id', () => {

    it('should respond with a 202 if it was successful and have removed a palette from the database', async () => {
      const allPalettes = await database('palettes');
      const numExpectedPalettes = allPalettes.length - 1;
      const response = await request(app).delete(`/api/v1/palettes/${allPalettes[0].id}`);
      const remainingPalettes = await database('palettes');
      expect(response.status).toEqual(202);
      expect(numExpectedPalettes).toEqual(remainingPalettes.length);
    });

    it('should respond with a 204 if palette with specific id does not exist', async () => {
      const firstPalette = await database('palettes').first();
      const nonExistantPalette = firstPalette.id - 1;
      const response = await request(app).delete(`/api/v1/palettes/${nonExistantPalette}`);
      expect(response.status).toEqual(204);
    });
  })

})