const express = require('express');
const app = express();
app.use(express.json());

const swaggerUi = require('swagger-ui-express');
const openapiSpec = require('./openapi.json');
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

const database = require('better-sqlite3');
const db = new database('tasks.db');

db.exec(
  `CREATE TABLE IF NOT EXISTS tasks(
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  done BOOLEAN DEFAULT 0) `
);

const columns = db.prepare("PRAGMA table_info(tasks)").all();
const hasCreatedAt = columns.some(col => col.name === 'created_at');
if (!hasCreatedAt) {
  db.exec(`
    ALTER TABLE tasks ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
    ALTER TABLE tasks ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;
  `);
  console.log('Added created_at and updated_at columns');
}


const row = db.prepare('SELECT COUNT (*) AS count FROM tasks').get();
if (row.count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title,done) VALUES (?,?)');
  insert.run("Tahajud", 1);
  insert.run("Abs Workout", 0);
  insert.run("Subh prayer", 0);
console.log('seeded 3 example tasks')
} else {
  console.log(`Table already has ${row.count} tasks. Skipping seed.`);
}

app.get('/', (req, res) => {
  res.json({"name": "TASK API", "version": "1.0", "endpoints": ["/tasks"]})
});
app.get('/health', (req, res) => {
  res.json({"status": "ok"})
});
app.get('/tasks', (req, res) => {
   
   let query = 'SELECT * from tasks WHERE 1=1';
   const params = [];
   if (req.query.done !== undefined) {
    query+= ' AND done =?';
    params.push(req.query.done === 'true' ? 1:0);
   }

  if (req.query.search) {
    query+= ' AND LOWER(title) LIKE ?';
    params.push(`%${req.query.search.toLowerCase()}%`);
  } 
  if (req.query.sort === 'title') {
    query += ' ORDER BY title';
  }


  const result = db.prepare(query).all(...params);
  res.json(result.map(t=> ({...task, done: !!task.done})))
});

app.get('/stats', (req, res) => {
  const stats = db.prepare(
    'SELECT COUNT(*) AS total, SUM(done) AS completed FROM tasks'
  ).get();
  res.json({
    total: stats.total,
    completed: stats.completed || 0,
    remaining: stats.total - (stats.completed || 0)
  });
});


app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = db.prepare('SELECT * from tasks WHERE id = ?').get(taskId);
  if (task) {
    res.json({...task, done: !!task.done});
  } else {
    res.status(404).json({"error": `Task ${req.params.id} not found`});
  }
});
app.post('/tasks', (req, res) => {
  const title = req.body.title;
  if (!title || title.trim() === "") {
    return res.status(400).json({"error": "Title is required"});
  }
  const result = db.prepare('INSERT INTO tasks (title, done) VALUES (?, ?)').run(title, 0);
  const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ ...newTask, done: !!newTask.done });
});

app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  if (!task) {
    return res.status(404).json({"error": `Task ${req.params.id} not found`});
  }

  const { title, done } = req.body;
  if (title === undefined && done === undefined) {
    return res.status(400).json({"error": "At least one of title or done is required"});
  }
  db.prepare('UPDATE tasks SET title = ?, done = ? updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(
    title !== undefined ? title : task.title,
    done !== undefined ? (done ? 1 : 0) : task.done,
    taskId
  );
  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
  res.json({ ...updated, done: !!updated.done });
});

app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(taskId);
  if (result.changes === 0) {
    return res.status(404).json({"error": `Task ${req.params.id} not found`});
  }
  res.status(204).send();
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});