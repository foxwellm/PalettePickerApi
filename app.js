const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.get('/api/v1/projects', async (req, res) => {
  const name = req.query.name;
  try {
    let matchingProjects;
    matchingProjects = await database('projects').select();
    if (name) matchingProjects = matchingProjects.filter(project => project.name.toLowerCase().includes(name.toLowerCase()));
    return matchingProjects.length ? res.status(200).json(matchingProjects) : res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

app.get('/api/v1/projects/:id', async (req, res) => {
  const id = req.params.id;
  try {
    let matchingProject = await database('projects').where('id', id).select();
    return matchingProject.length ? res.status(200).json(matchingProject) : res.sendStatus(204);
  } catch (error) {
    return res.status(500).json({ error });
  }
})



module.exports = app;