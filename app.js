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
    if (matchingProjects.length === 0) return res.sendStatus(204);
    return res.status(200).json(matchingProjects);
  } catch (error) {
    return res.status(500).json({ error });
  }
});



module.exports = app;