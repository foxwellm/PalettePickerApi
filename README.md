# Palette Picker API
This REST API contains saved project and palette data for the [Palette Picker frontend](https://github.com/kaohman/PalettePicker). Palette Picker was a Turing School Mod 4 assignment. Details about the Palette Picker assignment can be found [HERE](http://frontend.turing.io/projects/palette-picker.html). Users can get project and palette information from the database, as well as post new projects and palettes, update projects and palettes, and delete a project or palette.

## Frontend
Repo: https://github.com/kaohman/PalettePicker
Deployed site: Add deployed frontend site here

## Requests
The base URL for all requests is: 
#### `http://pal-picker-api.herokuapp.com/`
GET, POST, PUT, and DELETE requests to the API endpoints are outlined below. Responses are JSON objects.

### Projects

* #### GET `api/v1/projects`
  Response sends all projects in the database. Each project includes the following parameters:
  
  | Parameters | Format  | Details           |
  | :----------|:--------|:------------------|
  | id         | number  | unique identifier |
  | name       | string  | project name      |

  The following query parameters can also be included in the path to filter projects by name:
  
  | Parameters | Format | Response                                      |
  | :----------|:-------|:----------------------------------------------|
  | name       | string | returns all projects that contain given name  |
  
  Example Request with query parameters: `api/v1/stations?name=project`
  
  Example Response:
  ```json
  [
    {
      "id": 1,
      "name": "Project 1",
      "created_at": "2019-03-12T20:20:55.808Z",
      "updated_at": "2019-03-12T20:20:55.808Z"
    },
    {
      "id": 2,
      "name": "Project 2",
      "created_at": "2019-03-12T20:20:55.816Z",
      "updated_at": "2019-03-12T20:20:55.816Z"
    }
  ]
  ```

* #### GET `api/v1/projects/:id`
  Response sends single project that matches the `id` parameter in the request.
  
  Example Request: `api/v1/projects/1`
  
  Response:
  ```json
  [
    {
      "id": 1,
      "name": "Project 1",
      "created_at": "2019-03-12T20:20:55.808Z",
      "updated_at": "2019-03-12T20:20:55.808Z"
    }
  ]
  ```
  
* #### POST `api/v1/projects`
  Users can post a new project to the projects table. Response is the entire new record. Required parameters for the request body are outlined below:
  
  | Parameters | Format  | Details      |
  | :----------|:--------|:-------------|
  | name       | string  | project name |
  
  Example Response:
  ```json
  [
    {
      "id": 3,
      "name": "Project 3",
      "created_at": "2019-03-25T20:20:55.816Z",
      "updated_at": "2019-03-25T20:20:55.816Z"
    }
  ]
  ```

* #### PUT `api/v1/projects/:id`
  Users can update a project name in the projects table. Response is a status code 204. If required parameters are not given or no match is found, an error response is sent. Required parameters for the request body are outlined below:

  | Parameters | Format  | Details      |
  | :----------|:--------|:-------------|
  | name       | string  | project name |

* #### DELETE `api/v1/projects/:id`
  Deletes a single project that matches the `id` parameter in the request. Response is a status code 204. If no match is found, an error response is sent.
  
### Palettes

* #### GET `api/v1/projects/:id/palettes`
  Response sends all palettes in the database for a given project, as assigned using the project id request parameter. Each palette includes the following parameters:
  
  | Parameters | Format  | Details               |
  | :----------|:--------|:----------------------|
  | id         | integer | unique identifier     |
  | project_id | integer | associated project id |
  | name       | string  | palette name          |
  | color1     | string  | hex code for color    |
  | color2     | string  | hex code for color    |
  | color3     | string  | hex code for color    |
  | color4     | string  | hex code for color    |
  | color5     | string  | hex code for color    |
  
  Response:
  ```json
  [
    {
      "id": 1,
      "project_id": 1,
      "name": "Palette 1",
      "color1": "#9D6B25",
      "color2": "#782F9C",
      "color3": "#E0B004",
      "color4": "#E0B004",
      "color5": "#E0B004",
      "created_at": "2019-03-12T20:20:55.889Z",
      "updated_at": "2019-03-12T20:20:55.889Z"
    },
    {
      "id": 2,
      "project_id": 1,
      "name": "Palette 1",
      "color1": "#49F17D",
      "color2": "#3D5BCA",
      "color3": "#AC6FCB",
      "color4": "#63A829",
      "color5": "#33E88D",
      "created_at": "2019-03-12T20:20:55.889Z",
      "updated_at": "2019-03-12T20:20:55.889Z"
    }
  ]
  ```

* #### GET `api/v1/palettes/:id`
  Response sends single palette that matches the `id` parameter in the request.
  
  Example Request: `api/v1/palettes/1`
  
  Response:
  ```json
  [
    {
      "id": 1,
      "project_id": 1,
      "name": "Palette 1",
      "color1": "#9D6B25",
      "color2": "#782F9C",
      "color3": "#E0B004",
      "color4": "#E0B004",
      "color5": "#E0B004",
      "created_at": "2019-03-12T20:20:55.889Z",
      "updated_at": "2019-03-12T20:20:55.889Z"
    }
  ]
  ```
  
* #### POST `api/v1/palettes`
  Users can post a new palette to the palettes table. Response is the entire new record. Required parameters for the request body are outlined below:
  
  | Parameters | Format  | Details               |
  | :----------|:--------|:----------------------|
  | project_id | integer | associated project id |
  | name       | string  | palette name          |
  | color1     | string  | hex code for color    |
  | color2     | string  | hex code for color    |
  | color3     | string  | hex code for color    |
  | color4     | string  | hex code for color    |
  | color5     | string  | hex code for color    |
  
  Example Response:
  ```json
  [
    {
      "id": 3,
      "project_id": 2,
      "name": "Palette 3",
      "color1": "#9D6B25",
      "color2": "#782F9C",
      "color3": "#E0B004",
      "color4": "#E0B004",
      "color5": "#E0B004",
      "created_at": "2019-03-12T20:20:55.889Z",
      "updated_at": "2019-03-12T20:20:55.889Z"
    }
  ]
  ```

* #### PUT `api/v1/palettes/:id`
  Users can update a palette name and/or colors in the palettes table. Response is a status code 204. If required parameters are not given or no match is found, an error response is sent. Required parameters for the request body are outlined below:

  | Parameters | Format  | Details               |
  | :----------|:--------|:----------------------|
  | project_id | integer | associated project id |
  | name       | string  | palette name          |
  | color1     | string  | hex code for color    |
  | color2     | string  | hex code for color    |
  | color3     | string  | hex code for color    |
  | color4     | string  | hex code for color    |
  | color5     | string  | hex code for color    |

* #### DELETE `api/v1/projects/:id`
  Deletes a single project that matches the `id` parameter in the request. Response is a status code 204. If no match is found, an error response is sent.