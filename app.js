const express = require('express');
const app = express();
const environment = process.env.NODE_ENV || 'development';
const configuration = require('./knexfile')[environment];
const database = require('knex')(configuration);

app.get('/api/v1/projects', async (req, res) => {
  try {
    const projects = await database('projects').select();
    if (projects.length === 0) return res.sendStatus(204);
    return res.status(200).json(projects);
  } catch (error) {
    return res.status(500).json({ error });
  }
});

module.exports = app;