const express = require('express');
const cors = require('cors');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);
app.use(express.json());
app.use(cors());

app.get('/api/v1/projects', async (req, res) => {
  const name = req.query.name;
  try {
    let matchingProjects = await database('projects').select();
    if (name) matchingProjects = matchingProjects.filter(project => project.name.toLowerCase().includes(name.toLowerCase()));
    return matchingProjects.length ? res.status(200).json(matchingProjects) 
    : res.status(404).json('No matching projects found.');
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.get('/api/v1/projects/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const matchingProject = await database('projects').where({ id });
    return matchingProject.length ? res.status(200).json(matchingProject[0])
    : res.status(404).json(`No matching project found with id ${id}.`);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.get('/api/v1/palettes/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const matchingPalette = await database('palettes').where({ id });
    return matchingPalette.length ? res.status(200).json(matchingPalette[0]) 
    : res.status(404).json(`No matching palette found with id ${id}.`);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.get('/api/v1/projects/:id/palettes', async (req, res) => {
  const id = req.params.id;
  try {
    const matchingProject = await database('projects').where({ id });
    const matchingPalettes = await database('palettes').where('project_id', id);
    return matchingProject.length ? res.status(200).json(matchingPalettes) 
    : res.status(404).json(`No matching palettes found with project id ${id}.`);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.post('/api/v1/projects', async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(422).json('No project name provided');
  try {
    const dupProject = await database('projects').where({ name });
    if (dupProject.length) return res.status(409).json(`Project name ${name} already exists.`);
    const project = { name };
    const newProjectId = await database('projects').insert(project, 'id');
    return res.status(201).json(newProjectId);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.post('/api/v1/palettes', async (req, res) => {
  const newPalette = req.body;
  for (let requiredParameter of ['name', 'color1', 'color2', 'color3', 'color4', 'color5', 'project_id']) {
    if (!newPalette[requiredParameter]) {
      return res.status(422)
        .json(`Expected format: { name: <String>, color1: <String>, color2: <String>, color3: <String>, color4: <String>, color5: <String>, project_id: <Number>}. You're missing a ${requiredParameter} property.`);
    }
  }
  try {
    const { name, project_id } = newPalette;
    const dupPalette = await database('palettes').where({ name, project_id});
    if (dupPalette.length) return res.status(409).json(`Conflict. palette name ${name} already exists in project id ${project_id}.`);
    const newPaletteId = await database('palettes').insert(newPalette, 'id')
    return res.status(201).json(newPaletteId)
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.delete('/api/v1/palettes/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const matchingPalette = await database('palettes').where({ id });
    if (!matchingPalette.length) return res.status(404).json(`No matching palette found with id ${id}`);
    await database('palettes').where({ id }).del();
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.delete('/api/v1/projects/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const matchingProject = await database('projects').where({ id });
    if (!matchingProject.length) return res.status(404).json(`No matching project found with id ${id}`);
    await database('palettes').where('project_id', id).del();
    await database('projects').where({ id }).del()
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.put('/api/v1/projects/:id', async (request, res) => {
  const { id } = request.params;
  const { name } = request.body;
  if (!name) return res.status(422).json('Please provide a name.');
  try {
    const matchingProject = await database('projects').where({ id });
    if (!matchingProject.length) return res.status(404).json(`No matching project found with id ${id}.`);
    await database('projects').where({ id }).update({ name });
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.put('/api/v1/palettes/:id', async (request, res) => {
  const { id } = request.params;
  const updatedPalette = request.body;
  for (let requiredParameter of ['name', 'color1', 'color2', 'color3', 'color4', 'color5']) {
    if (!updatedPalette[requiredParameter]) {
      return res.status(422)
        .json(`Expected format: { name: <String>, color1: <String>, color2: <String>, color3: <String>, color4: <String>, color5: <String>, project_id: <Number>}. You're missing a ${requiredParameter} property.`);
    }
  }
  try {
    const matchingProject = await database('palettes').where({ id });
    if (!matchingProject.length) return res.status(404).json(`No matching palette found with id ${id}.`);
    await database('palettes').where({ id }).update(updatedPalette);
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

module.exports = app;