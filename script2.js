import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDxI0AYkPRZdxTVUVON9rJMH0fsCMnDVsw",
  authDomain: "gradientlife-68d90.firebaseapp.com",
  projectId: "gradientlife-68d90",
  storageBucket: "gradientlife-68d90.appspot.com",
  messagingSenderId: "322035152700",
  appId: "1:322035152700:web:a67f9cbbdc1914e4d61039",
  databaseURL: "https://gradientlife-68d90-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

class TodoApp {
  constructor() {
    this.todoList = [];
    this.todoInput = document.getElementById("todoInput");
    this.todoListElement = document.getElementById("todoList");
    this.bestThingInput = document.getElementById("bestThingInput");
    this.obsessiveThingInput = document.getElementById("obsessiveThingInput");
    this.takeawayInput = document.getElementById("takeawayInput");
    this.contributionChart = document.getElementById("contributionChart");
    this.dateKey = new Date().toISOString().split('T')[0];
    this.initialize();
  }

  initialize() {
    document.getElementById("addTodoButton").addEventListener("click", () => this.addTodo());
    document.getElementById("saveButton").addEventListener("click", () => this.saveDailyData());
    document.getElementById("saveBestThing").addEventListener("click", () => this.saveBestThing());
    document.getElementById("saveTakeaway").addEventListener("click", () => this.saveTakeaway());
    this.setupRealtimeListeners();
    this.loadTodayData();
    this.setupFixationAutocomplete();
  }

  setupRealtimeListeners() {
    const todayRef = ref(db, `days/${this.dateKey}`);
    onValue(todayRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        this.todoList = (data.goals || []).map(todo => ({
          ...todo,
          completed: Number(todo.completed)
        }));
        this.bestThingInput.value = data.bestThing || "";
        this.obsessiveThingInput.value = data.obsessiveThing || "";
        this.takeawayInput.value = data.takeaway || "";
        this.updateTodoList();
      }
    });

    const daysRef = ref(db, 'days');
    onValue(daysRef, (snapshot) => {
      if (snapshot.exists()) {
        this.updateContributionChart(snapshot.val());
      }
    });
  }

  async getFixationHistory() {
    try {
      const snapshot = await get(ref(db, 'days'));
      if (!snapshot.exists()) return [];
      
      const allDays = snapshot.val();
      return Object.values(allDays)
        .map(day => day.obsessiveThing?.trim())
        .filter((value, index, self) => 
          value && self.indexOf(value) === index
        );
    } catch (error) {
      console.error("Error getting fixation history:", error);
      return [];
    }
  }

  setupFixationAutocomplete() {
    const input = this.obsessiveThingInput;
    let currentFocus = -1;
    let suggestions = [];

    const createSuggestionsBox = (items) => {
        closeSuggestions();
        if (items.length === 0) return;

        const box = document.createElement("div");
        box.className = "autocomplete-items bg-white border rounded shadow-lg max-h-40 overflow-y-auto absolute";
        
        // Positioning the suggestion box directly below the input field
        const rect = input.getBoundingClientRect();
        box.style.left = `${rect.left}px`;
        box.style.top = `${rect.bottom + window.scrollY}px`;
        box.style.width = `${rect.width}px`;
        box.style.zIndex = "1000";

        items.forEach(item => {
            const div = document.createElement("div");
            div.className = "p-2 hover:bg-gray-100 cursor-pointer";
            div.innerHTML = item;
            div.onclick = () => {
                input.value = item;
                closeSuggestions();
            };
            box.appendChild(div);
        });

        document.body.appendChild(box);
    };

    const closeSuggestions = () => {
        document.querySelectorAll(".autocomplete-items").forEach(el => el.remove());
        currentFocus = -1;
    };

    input.addEventListener("input", async () => {
        closeSuggestions();
        if (!input.value) return;

        if (suggestions.length === 0) {
            suggestions = await this.getFixationHistory();
        }

        const matches = suggestions.filter(item =>
            item.toLowerCase().includes(input.value.toLowerCase())
        );

        if (matches.length > 0) {
            createSuggestionsBox(matches);
        }
    });

    input.addEventListener("keydown", (e) => {
        const items = document.querySelectorAll(".autocomplete-items div");
        if (items.length === 0) return;

        if (e.key === "ArrowDown") {
            currentFocus = Math.min(currentFocus + 1, items.length - 1);
        } else if (e.key === "ArrowUp") {
            currentFocus = Math.max(currentFocus - 1, 0);
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (currentFocus > -1) {
                items[currentFocus].click();
            }
            return;
        }

        items.forEach((option, index) => {
            option.classList.toggle("bg-gray-100", index === currentFocus);
        });
    });

    document.addEventListener("click", (e) => {
        if (e.target !== input) {
            closeSuggestions();
        }
    });
  }


  async loadTodayData() {
    try {
      const snapshot = await get(ref(db, `days/${this.dateKey}`));
      if (!snapshot.exists()) {
        await this.saveDailyData();
      }
    } catch (error) {
      console.error("Error loading today's data:", error);
    }
  }

  async addTodo() {
    const todoText = this.todoInput.value.trim();
    if (todoText) {
      const newTodo = {
        id: Date.now().toString(),
        text: todoText,
        completed: 0
      };
      this.todoList.push(newTodo);
      this.todoInput.value = "";
      await this.saveDailyData();
    }
  }

  async saveBestThing() {
    const bestThing = this.bestThingInput.value.trim();
    if (bestThing) {
      try {
        await set(ref(db, `days/${this.dateKey}/bestThing`), bestThing);
        alert("Highlight saved!");
      } catch (error) {
        console.error("Error saving the highlight:", error);
        alert("Save failed. Please retry.");
      }
    }
  }

  async saveTakeaway() {
    const takeaway = this.takeawayInput.value.trim();
    if (takeaway) {
      try {
        await set(ref(db, `days/${this.dateKey}/takeaway`), takeaway);
        alert("Takeaway saved!");
      } catch (error) {
        console.error("Error saving the takeaway:", error);
        alert("Save failed. Please retry.");
      }
    }
  }

  updateTodoList() {
    this.todoListElement.innerHTML = "";
    this.todoList.forEach(todo => {
      const li = document.createElement("li");
      li.className = "flex items-center gap-2 mb-2";
      
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "form-checkbox h-5 w-5 text-blue-600";
      checkbox.checked = todo.completed === 1;
      checkbox.onchange = () => this.toggleTodo(todo.id);
      
      const label = document.createElement("span");
      label.textContent = todo.text;
      label.className = todo.completed === 1 ? "line-through text-gray-400" : "text-gray-700";
      
      li.appendChild(checkbox);
      li.appendChild(label);
      this.todoListElement.appendChild(li);
    });
  }

  async toggleTodo(todoId) {
    const todo = this.todoList.find(t => t.id === todoId);
    if (todo) {
      todo.completed = todo.completed === 1 ? 0 : 1;
      await this.saveDailyData();
    }
  }

  async saveDailyData() {
    const completedCount = this.todoList.filter(todo => todo.completed === 1).length;
    const totalCount = this.todoList.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    const dailyData = {
      goals: this.todoList,
      completedGoals: completedCount,
      totalGoals: totalCount,
      chartColor: this.getColor(progress),
      bestThing: this.bestThingInput.value.trim(),
      obsessiveThing: this.obsessiveThingInput.value.trim(),
      takeaway: this.takeawayInput.value.trim(),
      progressPercentage: progress,
      date: this.dateKey
    };

    try {
      await set(ref(db, `days/${this.dateKey}`), dailyData);
      if (document.activeElement === document.getElementById("saveButton")) {
        alert("Fixation saved!");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      alert("Save failed. Please retry.");
    }
  }

  updateContributionChart(daysData = {}) {
    const today = new Date();
    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth();
    const daysInMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0)).getUTCDate();

    const monthlyData = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateUTC = new Date(Date.UTC(currentYear, currentMonth, day));
      const dateString = dateUTC.toISOString().split('T')[0];
      
      const dayData = daysData[dateString] || {
        progress: 0,
        chartColor: this.getColor(0)
      };

      monthlyData.push({
        date: dateString,
        progress: dayData.progressPercentage || 0,
        color: this.getColor(dayData.progressPercentage || 0),
        isFuture: dateUTC > today
      });
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    this.contributionChart.innerHTML = `
      <div class="text-lg font-semibold mb-2">${monthNames[currentMonth]} ${currentYear}</div>
      <div class="flex flex-wrap gap-1">
        ${monthlyData.map(day => `
          <div 
            title="${day.date}: ${day.progress}%" 
            class="w-6 h-6 rounded cursor-pointer transition-colors ${day.isFuture ? 'bg-gray-100 opacity-50' : day.color}"
            data-date="${day.date}"
          ></div>
        `).join("")}
      </div>
    `;

    const squares = this.contributionChart.querySelectorAll('[data-date]');
    squares.forEach(square => {
      square.addEventListener('click', () => {
        const date = square.getAttribute('data-date');
        const dayData = daysData[date];
        if (dayData) {
          alert(`
Date: ${date}
Progress: ${dayData.progressPercentage}%
Completed Goals: ${dayData.completedGoals}/${dayData.totalGoals}
Best Thing: ${dayData.bestThing || 'Not recorded'}
Obsessive Thing: ${dayData.obsessiveThing || 'Not recorded'}
Takeaway: ${dayData.takeaway || 'Not recorded'}
          `);
        }
      });
    });
  }

  getColor(progress) {
    if (progress === 0) return "bg-gray-300";
    if (progress <= 25) return 'bg-[#07C8F9]';
    if (progress <= 50) return 'bg-[#0A85ED]';
    if (progress <= 75) return 'bg-[#5360E0]';
    return 'bg-[#7137D6]';
  }
}

document.addEventListener("DOMContentLoaded", () => new TodoApp());