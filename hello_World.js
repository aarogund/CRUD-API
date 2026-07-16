const express = require('express');
const app = express();
app.use(express.json());
const tasks = [{id:1, title:"task 1", done: false}, {id:2, title:"task 2", done: false}, {id:3, title:"task 3", done: false}];

app.get(`/`, (req, res) => {
  res.json({"name": "TASK API", "version": "1.0", "endpoints": ["/tasks"]})
});
app.get('/health', (req, res) => {
  res.json({"status": "ok"})
});
app.get('/tasks', (req, res) => {
  res.json(tasks)
});

app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    res.json(task);
  } else {
    res.status(404).json({"error": `Task ${req.params.id} not found`});
  }
});
app.post('/tasks', (req,res) => {
  const title = req.body.title; 
  if (!title || title.trim() === "") {
    return res.status(400).json({"error": "Title is required"});
  }else {
  const ids = tasks.map(t => t.id);   // pulls out just the ids: [1, 2, 3]
  const highest = Math.max(...ids);   // spreads the array into Math.max(1, 2, 3)
  const newId = highest + 1;;
  const newTask = {"id": newId,"title": title, "done": false};
  tasks.push(newTask);
  res.status(201).json(newTask);
  }
})
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});