const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "tasks.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---- helpers: read/write the "database" (a JSON file) ----
function readTasks() {
  if (!fs.existsSync(DATA_FILE)) return [];
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
}

// ---- API routes ----

// Get all tasks
app.get("/api/tasks", (req, res) => {
  res.json(readTasks());
});

// Add a task
app.post("/api/tasks", (req, res) => {
  const title = (req.body.title || "").trim();
  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }
  const tasks = readTasks();
  const task = { id: Date.now(), title, done: false };
  tasks.push(task);
  writeTasks(tasks);
  res.status(201).json(task);
});

// Mark a task done / not done
app.patch("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const task = tasks.find((t) => t.id === Number(req.params.id));
  if (!task) return res.status(404).json({ error: "Task not found" });
  task.done = !task.done;
  writeTasks(tasks);
  res.json(task);
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const tasks = readTasks();
  const remaining = tasks.filter((t) => t.id !== Number(req.params.id));
  if (remaining.length === tasks.length) {
    return res.status(404).json({ error: "Task not found" });
  }
  writeTasks(remaining);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Task Tracker running at http://localhost:${PORT}`);
});