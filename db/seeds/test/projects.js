
const projectData = [
  {
    name: 'Project 1',
    palettes: [
      {
        name: 'Palette1',
        color1: '#ff0000',
        color2: '#ffff00',
        color3: '#ffffff',
        color4: '#808000',
        color5: '#239b56'
      },
      {
        name: 'Palette2',
        color1: '#2980b9',
        color2: '#85929e',
        color3: '#dc7633',
        color4: '#73c6b6',
        color5: '#d6eaf8'
      }
    ]
  },
  {
    name: 'Project 2',
    palettes: [
      {
        name: 'Palette3',
        color1: '#ff0000',
        color2: '#ffff00',
        color3: '#ffffff',
        color4: '#808000',
        color5: '#239b56'
      },
      {
        name: 'Palette4',
        color1: '#2980b9',
        color2: '#85929e',
        color3: '#dc7633',
        color4: '#73c6b6',
        color5: '#d6eaf8'
      }
    ]
  },
  {
    name: 'Empty',
    palettes: []
  }
]

const createProject = (knex, project) => {
  return knex('projects').insert({
    name: project.name
  }, 'id')
    .then(projectId => {
      let palettePromises = [];
      project.palettes.forEach(palette => {
        const { name, color1, color2, color3, color4, color5 } = palette;
        palettePromises.push(
          createPalette(knex, {
            name, color1, color2, color3, color4, color5,
            project_id: projectId[0]
          })
        )
      })
      return Promise.all(palettePromises)
    })
}

const createPalette = (knex, palette) => {
  return knex('palettes').insert(palette)
}

exports.seed = (knex, Promise) => {
  return knex('palettes').del()
    .then(() => knex('projects').del())
    .then(() => {
      let projectPromises = [];
      projectData.forEach(project => {
        projectPromises.push(createProject(knex, project))
      })
      return Promise.all(projectPromises)
    })
    .catch(error => console.log(`Error seeding data: ${error}`))
};
