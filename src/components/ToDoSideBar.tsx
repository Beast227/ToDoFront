"use client";

import { Todo, todocat } from "@/types/Types";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface TodoDetailSidebarProps {
  todo: Todo | null;
  onClose: () => void;
  onDelete: (id: number) => void;
  onUpdate: (updatedTodo: Todo) => void;
  onChange: (id: number) => void;
}

export default function ToDoSideBar({ todo, onClose, onDelete, onUpdate, onChange }: TodoDetailSidebarProps) {
  const [newStep, setNewStep] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [categories, setCategories] = useState<todocat[]>();
  const [localTitle, setLocalTitle] = useState("");

  const normalizeDueDate = (dueDate?: string | null) => {
    if (!dueDate) return "";
    return dueDate.includes("T") ? dueDate : `${dueDate}T00:00:00`;
  };

  // Sync local title when the selected todo changes
  useEffect(() => {
    if (todo) {
      setLocalTitle(todo.title);
    }
  }, [todo]);

  // Fetch Categories on mount
  useEffect(() => {
    handleGetToDOCategories();
  }, []);

  const handleGetToDOCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/todo/category`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error(error);
      toast.error("Could not load categories");
    }
  }

  if (!todo) return null;

  // --- 1. GENERAL UPDATE (Title, Date, Steps) ---
  const updateTodoInDb = async (updatedFields: Partial<Todo>) => {
    setIsUpdating(true);
    const token = localStorage.getItem("token");
    const mergedTodo = {
      ...todo,
      ...updatedFields,
      dueDate: normalizeDueDate(
        updatedFields.dueDate ?? todo.dueDate
      ),
    };

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/todo/item?id=${todo.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(mergedTodo),
      });

      if (response.ok) {
        onUpdate(mergedTodo); // Update parent
        toast.success("Saved");
      } else {
        toast.error("Failed to save");
      }
    } catch (error) {
      console.error("Update error", error);
      toast.error("Error updating task");
    } finally {
      setIsUpdating(false);
    }
  };

  // --- 2. CATEGORY UPDATE (New Specific API) ---
  const handleCategoryChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategoryName = e.target.value;
    
    // Find the ID of the category selected
    const selectedCatObj = categories?.find(c => c.category === newCategoryName);
    
    // If for some reason we can't find the ID, stop.
    if(!selectedCatObj) return;

    setIsUpdating(true);
    const token = localStorage.getItem("token");

    // Optimistically update parent so UI feels instant
    const updatedTodoObj = { ...todo, category: newCategoryName };

    try {
        // 👇👇 REPLACE THIS URL WITH YOUR SPECIFIC CATEGORY UPDATE ENDPOINT 👇👇
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/todo/item/category?ItemId=${todo.id}&CatId=${selectedCatObj.Id}`, { 
            method: "PUT", // or PATCH
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
        });

        if (response.ok) {
            onChange(todo.id);
            onClose();
            toast.success("Category changed");
        } else {
            toast.error("Failed to change category");
            // Optional: Revert change if failed
        }
    } catch (error) {
        console.error("Category update error", error);
        toast.error("Error moving task");
    } finally {
        setIsUpdating(false);
    }
  };

  // --- HANDLERS ---

  const handleTitleBlur = () => {
    if (localTitle.trim() !== todo.title) {
      updateTodoInDb({ title: localTitle });
    }
  };

  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStep.trim()) return;
    const updatedSteps = [...todo.steps, newStep];
    updateTodoInDb({ steps: updatedSteps });
    setNewStep("");
  };

  const handleRemoveStep = (indexToRemove: number) => {
    const updatedSteps = todo.steps.filter((_, idx) => idx !== indexToRemove);
    updateTodoInDb({ steps: updatedSteps });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateTodoInDb({ dueDate: e.target.value });
  };

  return (
    <aside className="fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-900 border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-300">
          Task Details {isUpdating && <span className="text-xs text-cyan-500 ml-2 animate-pulse">Saving...</span>}
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-6 space-y-8">

        {/* EDITABLE TITLE */}
        <div className="group">
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Title</label>
          <input
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className={`w-full p-3 rounded-lg border border-gray-800 bg-gray-950/50 text-lg font-medium outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${todo.completed ? 'text-gray-500 line-through' : 'text-white'}`}
          />
        </div>

        {/* Steps Section */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Steps</label>
          <ul className="space-y-2 mb-3">
            {todo.steps.map((step, index) => (
              <li key={index} className="flex items-center justify-between gap-3 text-gray-300 bg-gray-800/30 p-3 rounded-md border border-gray-800 group">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                  <span className="text-sm">{step}</span>
                </div>
                <button onClick={() => handleRemoveStep(index)} className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddStep} className="relative">
            <input
              type="text"
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              placeholder="+ Add next step"
              className="w-full bg-gray-950 border border-gray-700 rounded-md py-2 pl-3 pr-8 text-sm text-white focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none placeholder-gray-600"
            />
          </form>
        </div>

        {/* Meta Data Section (Date & Category) */}
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Due Date</label>
            <input
              type="date"
              value={todo.dueDate ? todo.dueDate.split('T')[0] : ''}
              onChange={handleDateChange}
              className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-md px-3 py-2 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 scheme-dark"
            />
          </div>

          {/* EDITABLE CATEGORY */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Category</label>
            <div className="relative">
              <select
                value={todo.category}
                onChange={handleCategoryChange} 
                className="w-full appearance-none bg-gray-800 border border-gray-700 text-white text-sm rounded-md px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              >
                {/* Fallback option if current category is not in list */}
                {!categories?.find(c => c.category === todo.category) && <option value={todo.category}>{todo.category}</option>}
                
                {categories && categories.map((cat) => (
                  <option key={cat.Id} value={cat.category}>{cat.category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Button */}
        <div className="pt-6 border-t border-gray-800">
          <button
            onClick={() => onDelete(todo.id)}
            className="w-full flex justify-center items-center gap-2 px-4 py-2 border border-red-900/30 bg-red-900/10 text-red-500 hover:bg-red-900/20 hover:border-red-900/50 rounded-md transition-all text-sm font-medium"
          >
            Delete Task
          </button>
        </div>

      </div>
    </aside>
  );
}