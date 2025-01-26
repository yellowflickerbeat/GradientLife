"use strict";

class TodoApp {
  constructor() {
    this.todoList = [];
    this.todoInput = document.getElementById("todoInput");
    this.todoListElement = document.getElementById("todoList");
    this.bestThingInput = document.getElementById("bestThingInput");
    this.savedBestThing = document.getElementById("savedBestThing");
    this.contributionChart = document.getElementById("contributionChart");
    this.dateKey = new Date().toLocaleDateString("en-IN"); // Today's date in IST format
    this.initialize();
  }

  initialize() {
    const addTodoButton = document.getElementById("addTodoButton");
    addTodoButton.addEventListener("click", () => this.addTodo());
    this.bestThingInput.addEventListener("input", () => this.saveBestThing());

    this.checkDailyReset();
    this.loadSavedData();
    this.updateContributionChart();
  }

  checkDailyReset() {
    const lastResetDate = localStorage.getItem("lastResetDate");
    if (lastResetDate !== this.dateKey) {
      // Reset form if the day has changed
      this.todoList = [];
      this.todoInput.value = "";
      this.bestThingInput.value = "";
      localStorage.setItem("lastResetDate", this.dateKey);
      this.updateTodoList();
      this.saveBestThing();
    }
  }

  addTodo() {
    const todoText = this.todoInput.value.trim();
    if (todoText) {
      const newTodo = { id: Date.now(), text: todoText, completed: false };
      this.todoList.push(newTodo);
      this.todoInput.value = "";
      this.updateTodoList();
    }
  }

  updateTodoList() {
    this.todoListElement.innerHTML = "";
    this.todoList.forEach((todo) => {
      const li = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.addEventListener("change", () => {
        todo.completed = checkbox.checked;
        this.saveDailyProgress();
      });
      const label = document.createElement("label");
      label.textContent = todo.text;
      li.appendChild(checkbox);
      li.appendChild(label);
      this.todoListElement.appendChild(li);
    });
    this.saveDailyProgress();
  }

  saveBestThing() {
    const bestThingText = this.bestThingInput.value.trim();
    if (bestThingText) {
      localStorage.setItem("bestThing", bestThingText);
      this.savedBestThing.textContent = `Best Thing Saved: ${bestThingText}`;
    } else {
      this.savedBestThing.textContent = "";
    }
  }

  saveDailyProgress() {
    const completedCount = this.todoList.filter((todo) => todo.completed).length;
    const totalCount = this.todoList.length;
    const successPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    localStorage.setItem(`progress_${this.dateKey}`, successPercentage);
    this.updateContributionChart();
  }

  loadSavedData() {
    const bestThingText = localStorage.getItem("bestThing");
    if (bestThingText) {
      this.savedBestThing.textContent = `Best Thing Saved: ${bestThingText}`;
      this.bestThingInput.value = bestThingText;
    }
  }

  updateContributionChart() {
    const chartData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i); // Calculate past 30 days
      const dateKey = date.toLocaleDateString("en-IN"); // Date format in IST
      const progress = localStorage.getItem(`progress_${dateKey}`);
      chartData.push({ date: dateKey, progress: progress ? parseInt(progress) : 0 });
    }
  
    // Generate the chart
    this.contributionChart.innerHTML = chartData
      .reverse()
      .map((day) => {
        const color = this.getColor(day.progress); // Determine color
        return `<div title="${day.date}: ${day.progress}%" 
                  class="w-6 h-6 m-1 rounded ${color}"></div>`;
      })
      .join("");
  }
  
  getColor(progress) {
    // Return corresponding Tailwind class or custom inline style for the color gradient
    if (progress === 0) return "bg-gray-300"; // 0%: Gray
    if (progress <= 25) return 'bg-[#07C8F9]'; // 1–25%: Light Blue
    if (progress <= 50) return 'bg-[#0A85ED]'; // 26–50%: Medium Blue
    if (progress <= 75) return 'bg-[#5360E0]'; // 51–75%: Deep Blue
    return 'bg-[#7137D6]'; // 76–100%: Purple
  }  
}

document.addEventListener("DOMContentLoaded", () => {
  new TodoApp();
});
