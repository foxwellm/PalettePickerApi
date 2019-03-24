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

    it('should respond with a 200 and matching projects if a name query is given', async () => {
      const response = await request(app).get('/api/v1/projects?name=Project+1');
      expect(response.status).toEqual(200);
      expect(response.body[0].name).toEqual('Project 1');
    });

    it('should respond with a 200 and matching projects if a partial name query is given', async () => {
      const expectedProjects = await database('projects').select();
      const response = await request(app).get('/api/v1/projects?name=Project');
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(expectedProjects.length-1);
    });
    
    it('should respond with a 404 and message if there are no projects in the db', async () => {
      await database('palettes').del();
      await database('projects').del();
      const response = await request(app).get('/api/v1/projects/?name=zzz');
      expect(response.status).toEqual(404);
      expect(response.body).toEqual('No matching projects found.');
    });
  });

  describe('GET /api/v1/projects/:id', () => {
    it('should respond with a 200 and the specific project if it exists', async () => {
      const expectedProject = await database('projects').first();
      const response = await request(app).get(`/api/v1/projects/${expectedProject.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.id).toEqual(expectedProject.id);
    });

    it('should respond with a 404 and message if the specific project does not exist', async () => {
      const nonExistantProject = 0;
      const response = await request(app).get(`/api/v1/projects/${nonExistantProject}`);
      expect(response.status).toEqual(404);
      expect(response.body).toEqual(`No matching project found with id ${nonExistantProject}.`);
    });
  });

  describe('GET /api/v1/palettes/:id', () => {
    it('should respond with a 200 and the specific palette if it exists', async () => {
      const expectedPalette = await database('palettes').first();
      const response = await request(app).get(`/api/v1/palettes/${expectedPalette.id}`);
      expect(response.status).toEqual(200);
      expect(response.body.name).toEqual(expectedPalette.name);
    });

    it('should respond with a 404 and message if the specific palette does not exist', async () => {
      const nonExistantPalette = 0;
      const response = await request(app).get(`/api/v1/palettes/${nonExistantPalette}`);
      expect(response.status).toEqual(404);
      expect(response.body).toEqual(`No matching palette found with id ${nonExistantPalette}.`);
    });
  });

  describe('GET /api/v1/projects/:id/palettes', () => {
    it('should respond with a 200 and matching palettes if they exist', async () => {
      const expectedProject = await database('projects').first();
      const expectedPalettes = await database('palettes').where('project_id', expectedProject.id).select();
      const response = await request(app).get(`/api/v1/projects/${expectedProject.id}/palettes`);
      expect(response.status).toEqual(200);
      expect(response.body.length).toEqual(expectedPalettes.length);
    });

    it('should respond with a 404 and message if the specific palettes do not exist for that project', async () => {
      const nonExistantProject = 0;
      const response = await request(app).get(`/api/v1/projects/${nonExistantProject}/palettes`);
      expect(response.status).toEqual(404);
      expect(response.body).toEqual(`No matching palettes found with project id ${nonExistantProject}.`);
    });
  });

  describe('POST /api/v1/projects', () => {
    it('should respond with a 201 and add project', async () => {
      const startingProjects = await database('projects');
      const response = await request(app).post('/api/v1/projects').send({name: 'New Project'});
      const expectedProjects = await database('projects');
      expect(response.status).toEqual(201);
      expect(startingProjects.length + 1).toEqual(expectedProjects.length);
    });

    it('should respond with a 409 and message if project name already exists', async () => {
      const name = 'Project 1';
      const response = await request(app).post('/api/v1/projects').send({ name });
      expect(response.status).toEqual(409);
      expect(response.body).toEqual(`Project name ${name} already exists.`);
    });

    it('should respond with a 422 and message if no name provided', async () => {
      const response = await request(app).post('/api/v1/projects')
      expect(response.status).toEqual(422);
      expect(response.body).toEqual('No project name provided')
    });
  })

  describe('POST /api/v1/palettes', () => {
    it('should respond with a 201 and add pallete if succesful', async () => {
      const projectToAddTo = await database('projects').first();
      const newPalette = {
        name: 'New Palette',
        color1: '434f4f',
        color2: 'nr44j4',
        color3: 'h4b3b4',
        color4: 'jn4n44',
        color5: 'jhb4bk',
        project_id: projectToAddTo.id
      };
      const currentPalettes = await database('palettes').where('project_id', projectToAddTo.id);
      const response = await request(app).post('/api/v1/palettes').send(newPalette);
      const expectedPalettes = await database('palettes').where('project_id', projectToAddTo.id)
      expect(response.status).toEqual(201);
      expect(currentPalettes.length + 1).toEqual(expectedPalettes.length)
    });

    it('should respond with a 409 and message if palette name already exists in that project', async () => {
      const projectToAddTo = await database('projects').first();
      const newPalette = {
        name: 'Palette1',
        color1: '434f4f',
        color2: 'ffffff',
        color3: 'h4b3b4',
        color4: 'jn4n44',
        color5: 'jhb4bk',
        project_id: projectToAddTo.id
      }
      const response = await request(app).post('/api/v1/palettes').send(newPalette);
      expect(response.status).toEqual(409);
      expect(response.body).toEqual(`Conflict. palette name ${newPalette.name} already exists in project id ${newPalette.project_id}.`);
    });

    it('should respond with a 422 and message about what is missing if a parameter is missing', async () => {
      const projectToAddTo = await database('projects').first()
      const newPalette = {
        name: 'New Palette',
        color1: '434f4f',
        color3: 'h4b3b4',
        color4: 'jn4n44',
        color5: 'jhb4bk',
        project_id: projectToAddTo.id
      }
      const response = await request(app).post('/api/v1/palettes').send(newPalette);
      expect(response.status).toEqual(422);
      expect(response.body).toEqual('Expected format: { name: <String>, color1: <String>, color2: <String>, color3: <String>, color4: <String>, color5: <String>, project_id: <Number>}. You\'re missing a color2 property.');
    });
  });

  describe('DELETE /api/v1/palettes/:id', () => {
    it('should respond with a 202 if it was successful and have removed a palette from the database', async () => {
      const allPalettes = await database('palettes');
      const numExpectedPalettes = allPalettes.length - 1;
      const response = await request(app).delete(`/api/v1/palettes/${allPalettes[0].id}`);
      const remainingPalettes = await database('palettes');
      expect(response.status).toEqual(202);
      expect(numExpectedPalettes).toEqual(remainingPalettes.length);
    });

    it('should respond with a 404 and message if palette with specific id does not exist', async () => {
      const nonExistantPalette = 0;
      const response = await request(app).delete(`/api/v1/palettes/${nonExistantPalette}`);
      expect(response.status).toEqual(404);
      expect(response.body).toEqual(`No matching palette found with id ${nonExistantPalette}`)
    });
  });

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

    it('should respond with a 404 and message if project with specific id does not exist', async () => {
      const nonExistantProject = 0;
      const response = await request(app).delete(`/api/v1/projects/${nonExistantProject}`);
      expect(response.status).toEqual(404);
      expect(response.body).toEqual(`No matching project found with id ${nonExistantProject}`)
    });
  });

  describe('PUT /api/v1/projects/:id', () => {
    it('should respond with a 204 if project was successfully updated', async () => {
      const projectToChange = await database('projects').first()
      const response = await request(app).put(`/api/v1/projects/${projectToChange.id}`).send({ name: 'New Name'});
      const updatedProject = await database('projects').first();
      expect(response.status).toEqual(204);
      expect(updatedProject).not.toEqual(projectToChange);
    });

    it('should respond with a 422 and message if name is not provided', async () => {
      const projectToChange = await database('projects').first()
      const response = await request(app).put(`/api/v1/projects/${projectToChange.id}`);
      expect(response.status).toEqual(422);
      expect(response.body).toEqual('Please provide a name.');
    });

    it('should respond with a 404 and message if project was not found', async () => {
      const nonExistantProject = 0;
      const response = await request(app).put(`/api/v1/projects/${nonExistantProject}`).send({ name: 'New Name' });
      expect(response.status).toEqual(404);
      expect(response.body).toEqual(`No matching project found with id ${nonExistantProject}.`);
    });
  });

  describe('PUT /api/v1/palettes/:id', () => {
    it('should respond with a 204 if palette was successfully updated', async () => {
      const paletteToChange = await database('palettes').first();
      const updatedPalette = {
        name: 'New Name',
        color1: 'ffffff',
        color2: 'ffffff',
        color3: 'ffffff',
        color4: 'ffffff',
        color5: 'ffffff'
      };
      const response = await request(app).put(`/api/v1/palettes/${paletteToChange.id}`).send(updatedPalette);
      const palette = await database('palettes').first();
      expect(response.status).toEqual(204);
      expect(palette).not.toEqual(updatedPalette);
    });

    it('should respond with a 422 and message if correct params are not provided', async () => {
      const paletteToChange = await database('palettes').first();
      const updatedPalette = {
        name: 'New Name',
        color1: 'ffffff',
        color2: 'ffffff',
        color3: 'ffffff',
        color4: 'ffffff'
      };
      const response = await request(app).put(`/api/v1/palettes/${paletteToChange.id}`).send(updatedPalette);
      expect(response.status).toEqual(422);
      expect(response.body).toEqual('Expected format: { name: <String>, color1: <String>, color2: <String>, color3: <String>, color4: <String>, color5: <String>, project_id: <Number>}. You\'re missing a color5 property.');
    });

    it('should respond with a 404 and message if palette was not found', async () => {
      const nonExistantPalette = 0;
      const updatedPalette = {
        name: 'New Name',
        color1: 'ffffff',
        color2: 'ffffff',
        color3: 'ffffff',
        color4: 'ffffff',
        color5: 'ffffff'
      };
      const response = await request(app).put(`/api/v1/palettes/${nonExistantPalette}`).send(updatedPalette);
      expect(response.status).toEqual(404);
      expect(response.body).toEqual(`No matching palette found with id ${nonExistantPalette}.`);
    });
  });
});