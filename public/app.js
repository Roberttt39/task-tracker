const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const empty = document.getElementById("empty");
const count = document.getElementById("count");
const errorBox = document.getElementById("error");

// ---- talk to the back end ----
async function api(url, options) {
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

async function loadTasks() {
  try {
    const tasks = await api("/api/tasks");
    render(tasks);
  } catch (err) {
    errorBox.textContent = "Could not load tasks. Is the server running?";
  }
}

// ---- show tasks on the page ----
function render(tasks) {
  list.innerHTML = "";

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;
    checkbox.setAttribute("aria-label", "Mark done: " + task.title);
    checkbox.addEventListener("change", () => toggleTask(task.id));

    const title = document.createElement("span");
    title.className = "title";
    title.textContent = task.title;

    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "Delete";
    del.addEventListener("click", () => deleteTask(task.id));

    li.append(checkbox, title, del);
    list.appendChild(li);
  });

  const left = tasks.filter((t) => !t.done).length;
  count.textContent = tasks.length
    ? `${left} of ${tasks.length} left to do`
    : "";
  empty.style.display = tasks.length ? "none" : "block";
}

// ---- actions ----
async function addTask(title) {
  await api("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
}

async function toggleTask(id) {
  await api("/api/tasks/" + id, { method: "PATCH" });
  loadTasks();
}

async function deleteTask(id) {
  await api("/api/tasks/" + id, { method: "DELETE" });
  loadTasks();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.textContent = "";
  try {
    await addTask(input.value);
    input.value = "";
    loadTasks();
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

loadTasks();