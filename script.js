"use strict";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDxI0AYkPRZdxTVUVON9rJMH0fsCMnDVsw",
  authDomain: "gradientlife-68d90.firebaseapp.com",
  projectId: "gradientlife-68d90",
  storageBucket: "gradientlife-68d90.firebasestorage.app",
  messagingSenderId: "322035152700",
  appId: "1:322035152700:web:a67f9cbbdc1914e4d61039"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

class TodoApp {
  constructor() {
    this.todoList = [];
    this.todoInput = document.getElementById("todoInput");
    this.todoListElement = document.getElementById("todoList");
    this.bestThingInput = document.getElementById("bestThingInput");
    this.savedBestThing = document.getElementById("savedBestThing");
    this.contributionChart = document.getElementById("contributionChart");
    this.dateKey = new Date().toLocaleDateString("en-IN");
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

  async checkDailyReset() {
    const lastResetDate = localStorage.getItem("lastResetDate");
    if (lastResetDate !== this.dateKey) {
      this.todoList = [];
      this.todoInput.value = "";
      this.bestThingInput.value = "";
      localStorage.setItem("lastResetDate", this.dateKey);
      this.updateTodoList();
      this.saveBestThing();
      await this.saveDataToFirestore();
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

  async loadSavedData() {
    const docRef = db.collection("dailyData").doc(this.dateKey);
    const doc = await docRef.get();
    if (doc.exists) {
      const data = doc.data();
      this.todoList = data.todoList || [];
      this.bestThingInput.value = data.bestThing || "";
      this.savedBestThing.textContent = data.bestThing ? `Best Thing Saved: ${data.bestThing}` : "";
      this.updateTodoList();
    }
  }

  async saveDataToFirestore() {
    const data = {
      todoList: this.todoList,
      bestThing: this.bestThingInput.value.trim(),
      date: this.dateKey
    };
    await db.collection("dailyData").doc(this.dateKey).set(data);
  }

  updateContributionChart() {
    const chartData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toLocaleDateString("en-IN");
      const progress = localStorage.getItem(`progress_${dateKey}`);
      chartData.push({ date: dateKey, progress: progress ? parseInt(progress) : 0 });
    }
  
    this.contributionChart.innerHTML = chartData
      .reverse()
      .map((day) => {
        const color = this.getColor(day.progress);
        return `<div title="${day.date}: ${day.progress}%" 
                  class="w-6 h-6 m-1 rounded ${color}"></div>`;
      })
      .join("");
  }
  
  getColor(progress) {
    if (progress === 0) return "bg-gray-300";
    if (progress <= 25) return 'bg-[#07C8F9]';
    if (progress <= 50) return 'bg-[#0A85ED]';
    if (progress <= 75) return 'bg-[#5360E0]';
    return 'bg-[#7137D6]';
  }  
}

document.addEventListener("DOMContentLoaded", () => {
  new TodoApp();
});