// --- 1. STATE & CONSTANTS ---
const STORAGE_KEY = "focustask_tasks";
let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let currentFilter = "all";

// --- 2. DOM ELEMENTS ---
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const categorySelect = document.getElementById("task-category");
const prioritySelect = document.getElementById("task-priority");
const taskList = document.getElementById("task-list");
const emptyState = document.getElementById("empty-state");
const filterButtons = document.querySelectorAll(".filter-btn");
const completedCountEl = document.getElementById("completed-count");
const totalCountEl = document.getElementById("total-count");
const progressBarEl = document.getElementById("progress-bar");
const currentDateEl = document.getElementById("current-date");

// --- 3. INIT ---
document.addEventListener("DOMContentLoaded", () => {
  displayCurrentDate();
  renderTasks();
});

function displayCurrentDate() {
  const options = { weekday: "long", month: "short", day: "numeric" };
  currentDateEl.textContent = new Date().toLocaleDateString(undefined, options);
}

// --- 4. DATA PERSISTENCE ---
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --- 5. CORE CRUD OPERATIONS ---

// CREATE
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();
  if (!text) return;

  const newTask = {
    id: Date.now().toString(),
    text: text,
    category: categorySelect.value,
    priority: prioritySelect.value,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask); // Add to beginning
  saveTasks();
  renderTasks();

  taskInput.value = "";
  taskInput.focus();
});

// UPDATE: Toggle Done
function toggleTask(id) {
  tasks = tasks.map((task) =>
    task.id === id ? { ...task, completed: !task.completed } : task
  );
  saveTasks();
  renderTasks();
}

// DELETE
function deleteTask(id) {
  tasks = tasks.filter((task) => task.id !== id);
  saveTasks();
  renderTasks();
}

// --- 6. FILTERING ---
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter;
    renderTasks();
  });
});

// --- 7. RENDER FUNCTION ---
function renderTasks() {
  taskList.innerHTML = "";

  const filteredTasks = tasks.filter((task) => {
    if (currentFilter === "active") return !task.completed;
    if (currentFilter === "completed") return task.completed;
    return true; // "all"
  });

  // Toggle empty state
  if (filteredTasks.length === 0) {
    emptyState.classList.remove("hidden");
  } else {
    emptyState.classList.add("hidden");
  }

  // Build task items
  filteredTasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    li.innerHTML = `
      <div class="task-left">
        <input 
          type="checkbox" 
          ${task.completed ? "checked" : ""} 
          aria-label="Mark task as complete"
        />
        <div class="task-details">
          <span class="task-text">${escapeHTML(task.text)}</span>
          <div class="task-tags">
            <span class="tag">${task.category}</span>
            <span class="tag priority-${task.priority}">${task.priority.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <button class="btn-delete" title="Delete Task">&times;</button>
    `;

    // Checkbox toggle event
    const checkbox = li.querySelector("input[type='checkbox']");
    checkbox.addEventListener("change", () => toggleTask(task.id));

    // Delete event
    const deleteBtn = li.querySelector(".btn-delete");
    deleteBtn.addEventListener("click", () => deleteTask(task.id));

    taskList.appendChild(li);
  });

  updateProgress();
}

// Update stats badge & progress bar
function updateProgress() {
  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;

  totalCountEl.textContent = total;
  completedCountEl.textContent = completed;

  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  progressBarEl.style.width = `${percentage}%`;
}

// Helper to prevent basic XSS when rendering user input
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}