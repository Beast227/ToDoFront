"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { todocat } from "@/types/Types";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [categories, setCategories] = useState<todocat[]>([]);
    const [newCatName, setNewCatName] = useState("");
    const searchParams = useSearchParams();
    const activeCategory = searchParams.get("category") || "My Day";

    // --- GET CATEGORIES ---
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
            toast.error("Pooped on getting categories 🥀");
        }
    }

    useEffect(() => {
        handleGetToDOCategories();
    }, [])

    // --- ADD CATEGORY ---
    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCatName.trim()) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/todo/category`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ category: newCatName })
            });

            if (response.ok) {
                const data = await response.json();
                setCategories((prev) => (prev ? [...prev, data] : [data]));
                setNewCatName("");
            }
        } catch (error) {
            console.error(error);
            toast.error("Pooped on adding categories 🥀");
        }
    };

    // --- DELETE CATEGORY (New) ---
    const handleDeleteCategory = async (id: number) => { // Assuming Id is number based on your types

        try {
            const token = localStorage.getItem("token");
            // Adjust endpoint if your delete path is different (e.g. /todo/category/{id})
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/todo/category?id=${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Update UI immediately
                setCategories(categories.filter((cat) => cat.Id !== id));
                toast.success("Category deleted");
            } else {
                toast.error("Failed to delete");
            }
        } catch (error) {
            console.error(error);
            toast.error("Error deleting category");
        }
    };

    return (
        <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden font-sans">

            {/* --- SIDEBAR (Left) --- */}
            <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col md:flex">

                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-gray-800">
                    <div className="w-8 h-8 bg-linear-to-br from-cyan-500 to-blue-600 rounded-lg mr-3"></div>
                    <span className="font-bold text-xl tracking-tight">TaskFlow</span>
                </div>

                {/* Categories List */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Collections
                    </p>

                    {categories && categories.map((cat) => {
                        const isActive = activeCategory === cat.category;
                        
                        return (
                            <div 
                                key={cat.Id}
                                className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                                    isActive
                                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                                }`}
                            >
                                {/* Link takes up available space */}
                                <Link
                                    href={`/dashboard?catId=${cat.Id}&title=${cat.category}`}
                                    className="flex items-center flex-1 truncate"
                                >
                                    <span className={`w-2 h-2 rounded-full mr-3 shrink-0 ${isActive ? "bg-cyan-400" : "bg-gray-600 group-hover:bg-gray-400"}`}></span>
                                    {cat.category}
                                </Link>

                                {/* Delete Button - Only visible on hover */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent navigation
                                        handleDeleteCategory(cat.Id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-500 transition-all rounded hover:bg-gray-700/50"
                                    title="Delete Category"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Add Category Input */}
                <div className="p-4 border-t border-gray-800">
                    <form onSubmit={handleAddCategory} className="relative">
                        <input
                            type="text"
                            placeholder="+ New List"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            className="w-full bg-gray-950 text-sm text-gray-300 rounded-md border border-gray-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 pl-3 py-2 outline-none transition-all"
                        />
                    </form>
                </div>
            </aside>

            {/* --- MAIN CONTENT WRAPPER --- */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* --- TOP NAVBAR --- */}
                <header className="h-16 bg-gray-900/50 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Search Bar */}
                    <div className="flex-1 max-w-lg">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search tasks..."
                                className="block w-full pl-10 pr-3 py-1.5 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-gray-950 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 sm:text-sm transition-colors"
                            />
                        </div>
                    </div>

                    {/* User Profile */}
                    <div className="ml-4 flex items-center gap-4">
                        <button className="text-gray-400 hover:text-white transition-colors">
                            <span className="sr-only">Notifications</span>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <div className="h-9 w-9 rounded-full bg-linear-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/20 cursor-pointer">
                            U
                        </div>
                    </div>
                </header>

                {/* --- PAGE CONTENT INJECTION --- */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
                    {children}
                </main>
            </div>
        </div>
    );
}