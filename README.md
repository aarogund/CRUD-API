# Task API

A simple CRUD REST API for managing tasks, built with Node.js and Express as part of the Week 2 backend exercises.

## Features

- Full CRUD (Create, Read, Update, Delete) for tasks
- In-memory data store (resets on server restart)
- Input validation with proper HTTP status codes
- Interactive API documentation via Swagger UI

## Requirements

- Node.js and npm installed

## Installation

```bash
git clone https://github.com/aarogund/CRUD-API.git
cd CRUD-API
npm install
```

## Running the server

```bash
node CRUD-API.js
```

The server starts on `http://localhost:3000`.

## API Documentation

Interactive Swagger UI docs are available at:

```
http://localhost:3000/docs
```

## Endpoints

| Method | Path            | Description                     |
|--------|-----------------|----------------------------------|
| GET    | `/`             | API information                 |
| GET    | `/health`       | Health check                    |
| GET    | `/tasks`        | List all tasks                  |
| POST   | `/tasks`        | Create a new task                |
| GET    | `/tasks/{id}`   | Get a single task by id         |
| PUT    | `/tasks/{id}`   | Update a task by id             |
| DELETE | `/tasks/{id}`   | Delete a task by id             |

### Task object shape

```json
{
  "id": 1,
  "title": "Buy milk",
  "done": false
}
```

## Example requests

**Create a task:**
```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk"}'
```

**Update a task:**
```bash
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"done":true}'
```

**Delete a task:**
```bash
curl -X DELETE http://localhost:3000/tasks/1
```