const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.get('/api/v1/projects', async (req, res) => {
  const name = req.query.name;
  try {
    let matchingProjects = await database('projects').select();
    if (name) matchingProjects = matchingProjects.filter(project => project.name.toLowerCase().includes(name.toLowerCase()));
    return matchingProjects.length ? res.status(200).json(matchingProjects) : res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.get('/api/v1/projects/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const matchingProject = await database('projects').where('id', id).select();
    return matchingProject.length ? res.status(200).json(matchingProject) : res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
})

app.get('/api/v1/palettes/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const matchingPalette = await database('palettes').where('id', id).select();
    return matchingPalette.length ? res.status(200).json(matchingPalette) : res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
})

app.get('/api/v1/projects/:id/palettes', async (req, res) => {
  const id = req.params.id;
  try {
    const matchingProject = await database('projects').where('id', id).select();
    const matchingPalettes = await database('palettes').where('project_id', id).select();
    return matchingProject.length ? res.status(200).json({matchingProject, matchingPalettes}) : res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
})

app.delete('/api/v1/palettes/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const matchingPalette = await database('palettes').where('id', id).select();
    if(matchingPalette.length) {
      await database('palettes').where('id', id).del();
      return res.sendStatus(202)
    }
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
})

app.delete('/api/v1/projects/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const matchingProject = await database('projects').where('id', id).select();
    if (matchingProject.length) {
      await database('palettes').where('project_id', id).del();
      await database('projects').where('id', id).del()
      return res.sendStatus(202)
    }
    return res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
})

module.exports = app;