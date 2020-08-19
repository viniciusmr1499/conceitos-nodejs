const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

// Middlewares

const repositoryExists = (request, response, next) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(rep => rep.id == id);

  if (repositoryIndex < 0)
    return response.status(400).json({ error: "Repository does not exist" });

  request.repositoryIndex = repositoryIndex;

  return next();
};

const validId = (request, response, next) => {
  const { id } = request.params;

  if (!isUuid(id)) return response.status(400).json({ error: "Invalid Id" });

  request.repositoryId = id;

  return next();
};

app.use('/repositories/:id', validId);

/*
  GET /repositories
  Rota que lista todos os repositórios;
 */

app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

/*
  POST /repositories
  A rota deve receber title, url e techs dentro do corpo da requisição,sendo a URL o link para o github desse repositório.
  Ao cadastrar um novo projeto, ele deve ser armazenado dentro de um objeto no seguinte formato: 
  { id: "uuid", title: 'Desafio Node.js', url: 'http://github.com/...', techs: ["Node.js", "..."], likes: 0 };
  Certifique-se que o ID seja um UUID, e de sempre iniciar os likes como 0.
*/

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0,
  };

  repositories.push(repository);

  return response.status(200).json(repository);
});

/*
  PUT /repositories/:id
  A rota deve alterar apenas o title, a url e as techs do repositório que possua o id igual
  ao id presente nos parâmetros da rota;
*/

app.put("/repositories/:id", repositoryExists, (request, response) => {
  const { title, url, techs } = request.body;
  const { likes } = repositories[request.repositoryIndex];

  const repository = {
    id: request.repositoryId,
    title,
    url,
    techs,
    likes,
  };

  repositories[request.repositoryIndex] = repository;

  return response.status(201).json(repository);
});

/*
  DELETE /repositories/:id
  A rota deve deletar o repositório com o id presente nos parâmetros da rota;
*/

app.delete("/repositories/:id", repositoryExists, (request, response) => {
    repositories.splice(request.repositoryIndex, 1);

    return response.status(204).send();
  }
);

/*
  POST /repositories/:id/like
  A rota deve aumentar o número de likes do repositório específico escolhido através do id presente
  nos parâmetros da rota, a cada chamada dessa rota, o número de likes deve ser aumentado em 1;
*/

app.post("/repositories/:id/like", repositoryExists, (request, response) => {
    const { title, url, techs } = repositories[request.repositoryIndex];
    let { likes } = repositories[request.repositoryIndex];

    likes = likes + 1;

    const repository = {
      id: request.repositoryId,
      title,
      url,
      techs,
      likes,
    };

    repositories[request.repositoryIndex] = repository;

    return response.status(201).json({ likes });
  }
);

module.exports = app;