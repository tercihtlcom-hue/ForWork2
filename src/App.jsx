import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [task, setTask] = useState("");
  const [note, setNote] = useState(""); // yeni not state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [activeTab, setActiveTab] = useState("Günlük");
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem("forwork_tasks");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("forwork_tasks", JSON.stringify(todos));
  }, [todos]);

  // Tarih aralıklarını hesapla
  const getDateRange = (tab) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(tab) {
      case "Günlük": {
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      }
      case "Haftalık": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Pazar başlangıç
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      }
      case "Aylık": {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { start: monthStart, end: monthEnd };
      }
      case "Yıllık": {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        const yearEnd = new Date(now.getFullYear() + 1, 0, 1);
        return { start: yearStart, end: yearEnd };
      }
      default: {
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      }
    }
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!task.trim()) return;
    
    const options = { day: 'numeric', month: 'long' };
    const dateLabel = new Date(selectedDate).toLocaleDateString('tr-TR', options);

    const newTodo = {
      id: Date.now(),
      text: task,
      note: note, // notu ekledik
      completed: false,
      plannedDate: selectedDate,
      plannedTime: selectedTime,
      dateDisplay: `${dateLabel} - ${selectedTime}`,
    };
    
    setTodos([newTodo, ...todos].sort((a, b) => {
      const dateA = new Date(`${a.plannedDate}T${a.plannedTime}`);
      const dateB = new Date(`${b.plannedDate}T${b.plannedTime}`);
      return dateA - dateB;
    }));
    setTask("");
    setNote(""); // notu sıfırla
  };

  const toggleComplete = (id) => {
    setTodos(todos.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const deleteTask = (id) => {
    setTodos(todos.filter(item => item.id !== id));
  };

  // Filtrelenmiş görevler
  const filteredTodos = todos.filter(t => {
    const taskDate = new Date(t.plannedDate);
    const range = getDateRange(activeTab);
    return taskDate >= range.start && taskDate < range.end;
  });

  return (
    <div className="app-container">
      <header>
        <div className="top-bar">
          <h1>ForWork</h1>
          <span className="current-day">
            {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </span>
        </div>
        
        <div className="tabs">
          {["Günlük", "Haftalık", "Aylık", "Yıllık"].map(tab => (
            <button 
              key={tab} 
              className={activeTab === tab ? "active" : ""} 
              onClick={() => setActiveTab(tab)}
            >
              {tab === "Günlük" ? "Bugün" : tab === "Haftalık" ? "Bu Hafta" : tab === "Aylık" ? "Bu Ay" : "Bu Yıl"}
            </button>
          ))}
        </div>
      </header>

      <form onSubmit={addTask} className="input-area">
        <input 
          type="text" 
          placeholder="Yeni görev ekle" 
          value={task}
          onChange={(e) => setTask(e.target.value)}
          className="task-input"
        />
        <textarea
          placeholder="Not ekle (opsiyonel)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="task-input"
          rows="2"
        />
        <div className="input-footer">
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-input"
          />
          <input 
            type="time" 
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="date-input"
          />
          <button type="submit" className="add-btn">Ekle</button>
        </div>
      </form>

      <div className="task-list">
        {filteredTodos.map(item => (
          <div key={item.id} className={`task-item ${item.completed ? 'completed' : ''}`}>
            <div className="task-main">
              <div className="task-info" onClick={() => toggleComplete(item.id)}>
                <span className="check-box">{item.completed ? '✅' : '⬜'}</span>
                <div className="text-group">
                  <span className="task-text">{item.text}</span>
                  <span className="task-date">{item.dateDisplay}</span>
                  {item.note && <span className="task-note">📝 {item.note}</span>}
                </div>
              </div>
              <button className="delete-btn" onClick={() => deleteTask(item.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
