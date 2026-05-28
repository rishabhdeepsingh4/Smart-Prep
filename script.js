function showPage(pageName) {
  
  const pages = document.querySelectorAll('.page');
  pages.forEach(page => page.classList.remove('active'));

  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));

  document.getElementById('page-' + pageName).classList.add('active');

  const activeLink = document.getElementById('nav-' + pageName);
  if (activeLink) activeLink.classList.add('active');

  if (pageName === 'progress') {
    updateProgressPage();
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleMobileMenu() {
  document.getElementById('mobileMenu').classList.toggle('open');
}

function closeMobileMenu() {
  document.getElementById('mobileMenu').classList.remove('open');
}

//STUDY PLANNER

function getTasks() {
  return JSON.parse(localStorage.getItem('smartprep_tasks')) || [];
}
function saveTasks(tasks) {
  localStorage.setItem('smartprep_tasks', JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById('taskInput');
  const prioritySelect = document.getElementById('taskPriority');

  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }

  const newTask = {
    id: Date.now(),
    text: text,
    priority: prioritySelect.value,
    done: false
  };

  const tasks = getTasks();
  tasks.unshift(newTask); 
  saveTasks(tasks);

  input.value = '';
  input.focus();

  renderTasks();
}

function toggleTask(id) {
  const tasks = getTasks();
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  saveTasks(tasks);
  renderTasks('current'); 
}

function deleteTask(id) {
  let tasks = getTasks();
  tasks = tasks.filter(t => t.id !== id); 
  saveTasks(tasks);
  renderTasks('current');
}

let currentFilter = 'all';

function filterTasks(filter, btn) {
  currentFilter = filter;

  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  renderTasks();
}

function renderTasks() {
  const taskList = document.getElementById('taskList');
  const emptyMsg = document.getElementById('emptyTasks');
  let tasks = getTasks();

  if (currentFilter === 'pending') tasks = tasks.filter(t => !t.done);
  if (currentFilter === 'done')    tasks = tasks.filter(t => t.done);

  if (tasks.length === 0) {
    taskList.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  taskList.innerHTML = tasks.map(task => `
    <li class="task-item ${task.done ? 'done' : ''}" id="task-${task.id}">
      <div class="task-check" onclick="toggleTask(${task.id})">
        ${task.done ? '✓' : ''}
      </div>
      <span class="task-text">${escapeHTML(task.text)}</span>
      <span class="priority-badge priority-${task.priority}">
        ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
      </span>
      <button class="task-delete" onclick="deleteTask(${task.id})" title="Delete task">✕</button>
    </li>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  const taskInput = document.getElementById('taskInput');
  if (taskInput) {
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTask();
    });
  }

  renderTasks();

  loadQuiz();

  renderNotes();
});

//QUIZ
 
const quizQuestions = [
  {
    question: "What is the powerhouse of the cell?",
    options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"],
    answer: "Mitochondria"
  },
   {
    question: "What is the value of π (pi) to 2 decimal places?",
    options: ["3.12", "3.14", "3.41", "2.71"],
    answer: "3.14"
  },
  
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Jupiter", "Saturn", "Mars"],
    answer: "Mars"
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    options: ["Charles Dickens", "William Shakespeare", "Jane Austen", "Leo Tolstoy"],
    answer: "William Shakespeare"
  },
  {
    question: "What is the chemical symbol for water?",
    options: ["O2", "CO2", "H2O", "NaCl"],
    answer: "H2O"
  },
  {
    question: "In which year did World War II end?",
    options: ["1942", "1943", "1945", "1947"],
    answer: "1945"
  },
  {
    question: "What is 12 × 12?",
    options: ["132", "144", "124", "148"],
    answer: "144"
  },
  {
    question: "What is the largest ocean on Earth?",
    options: ["Atlantic", "Indian", "Arctic", "Pacific"],
    answer: "Pacific"
  }
];

function loadQuiz() {
  const quizArea = document.getElementById('quizArea');
  const quizFooter = document.getElementById('quizFooter');
  if (!quizArea) return; 

  quizArea.innerHTML = quizQuestions.map((q, index) => `
    <div class="quiz-question" id="qq-${index}">
      <div class="question-number">Question ${index + 1} of ${quizQuestions.length}</div>
      <p class="question-text">${q.question}</p>
      <div class="options-list">
        ${q.options.map(option => `
          <label class="option-label">
            <input type="radio" name="q${index}" value="${escapeHTML(option)}" />
            ${escapeHTML(option)}
          </label>
        `).join('')}
      </div>
    </div>
  `).join('');

  quizFooter.style.display = 'block';
}

function submitQuiz() {
  let score = 0;
  let allAnswered = true;

  quizQuestions.forEach((q, index) => {
    const selected = document.querySelector(`input[name="q${index}"]:checked`);

    if (!selected) {
      allAnswered = false;
      return;
    }

    const optionLabels = document.querySelectorAll(`#qq-${index} .option-label`);

    document.querySelectorAll(`input[name="q${index}"]`).forEach(r => r.disabled = true);

    optionLabels.forEach(label => {
      const radioInput = label.querySelector('input');
      if (radioInput.value === q.answer) {
        label.classList.add('correct'); 
      } else if (radioInput.checked) {
        label.classList.add('wrong');   
      }
    });

    if (selected.value === q.answer) score++;
  });

  if (!allAnswered) {
    alert('Please answer all questions before submitting!');
    return;
  }

  const percentage = Math.round((score / quizQuestions.length) * 100);

  localStorage.setItem('smartprep_quiz_score', percentage);
  localStorage.setItem('smartprep_quiz_total', quizQuestions.length);
  localStorage.setItem('smartprep_quiz_correct', score);

  document.getElementById('quizFooter').style.display = 'none';
  const resultPanel = document.getElementById('quizResult');
  resultPanel.style.display = 'block';

  document.getElementById('resultScore').textContent = `${score}/${quizQuestions.length}`;
  document.getElementById('resultMessage').textContent = getResultMessage(percentage);
  document.getElementById('resultDetail').textContent =
    `You scored ${percentage}% — ${score} correct out of ${quizQuestions.length} questions.`;
}

function getResultMessage(pct) {
  if (pct === 100) return '🌟 Perfect Score! Outstanding!';
  if (pct >= 80)  return '🎉 Excellent Work! Keep it up!';
  if (pct >= 60)  return '👍 Good Effort! Keep Studying!';
  if (pct >= 40)  return '📚 Not Bad – Review and Try Again!';
  return '💪 Keep Practicing – You\'ve Got This!';
}

function restartQuiz() {
  document.getElementById('quizResult').style.display = 'none';
  loadQuiz(); // Re-render questions
  document.getElementById('quizFooter').style.display = 'block';
  document.querySelector('.page-section').scrollTop = 0;
  window.scrollTo({ top: 0 });
}








NOTES
function getNotes() {
  return JSON.parse(localStorage.getItem('smartprep_notes')) || [];
}

function saveNotes(notes) {
  localStorage.setItem('smartprep_notes', JSON.stringify(notes));
}

function saveNote() {
  const titleInput = document.getElementById('noteTitleInput');
  const bodyInput  = document.getElementById('noteBodyInput');

  const title = titleInput.value.trim();
  const body  = bodyInput.value.trim();
  if (!title && !body) {
    alert('Please enter a title or some content for your note.');
    return;
  }


  const newNote = {
    id: Date.now(),
    title: title || 'Untitled Note',
    body: body,
    date: new Date().toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })
  };

  const notes = getNotes();
  notes.unshift(newNote); 
  saveNotes(notes);
  titleInput.value = '';
  bodyInput.value  = '';

  renderNotes();
}

function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) return;
  let notes = getNotes();
  notes = notes.filter(n => n.id !== id);
  saveNotes(notes);
  renderNotes();
}

function renderNotes() {
  const grid     = document.getElementById('notesGrid');
  const emptyMsg = document.getElementById('emptyNotes');
  if (!grid) return;

  const notes = getNotes();

  if (notes.length === 0) {
    grid.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }
  emptyMsg.style.display = 'none';

  grid.innerHTML = notes.map(note => `
    <div class="note-card">
      <button class="note-delete" onclick="deleteNote(${note.id})" title="Delete note">✕</button>
      <div class="note-card-title">${escapeHTML(note.title)}</div>
      <div class="note-card-body">${escapeHTML(note.body)}</div>
      <div class="note-card-date">📅 ${note.date}</div>
    </div>
  `).join('');
}

function updateProgressPage() {
  const tasks     = getTasks();
  const notes     = getNotes();
  const quizScore = parseInt(localStorage.getItem('smartprep_quiz_score')) || 0;
  const quizCorrect = localStorage.getItem('smartprep_quiz_correct');
  const quizTotal   = localStorage.getItem('smartprep_quiz_total');

  const totalTasks = tasks.length;
  const doneTasks  = tasks.filter(t => t.done).length;

  document.getElementById('statTotalTasks').textContent = totalTasks;
  document.getElementById('statDoneTasks').textContent  = doneTasks;
  document.getElementById('statNotes').textContent      = notes.length;

  if (quizCorrect !== null) {
    document.getElementById('statQuizScore').textContent = `${quizCorrect}/${quizTotal}`;
  } else {
    document.getElementById('statQuizScore').textContent = '–';
  }

  const taskPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const notesPct = Math.min(Math.round((notes.length / 10) * 100), 100);

  document.getElementById('taskBar').style.width = taskPct + '%';
  document.getElementById('quizBar').style.width = quizScore + '%';
  document.getElementById('notesBar').style.width = notesPct + '%';

  document.getElementById('taskPct').textContent  = taskPct + '%';
  document.getElementById('quizPct').textContent  = quizScore + '%';

  const avg = Math.round((taskPct + quizScore) / 2);
  const motivations = [
    "Every expert was once a beginner. Keep going!",
    "Great start – complete more tasks to build momentum!",
    "You're making real progress. Consistency is the key!",
    "Halfway there – you should be proud of your effort!",
    "Fantastic work! You're well on your way to success!",
    "Outstanding! You're in the top tier. Keep it up! 🏆"
  ];
  const msgIndex = Math.min(Math.floor(avg / 20), motivations.length - 1);
  document.getElementById('motivationText').textContent = motivations[msgIndex];
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}


