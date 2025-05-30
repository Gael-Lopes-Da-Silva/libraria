import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { BsFillSunFill, BsFillMoonStarsFill } from "react-icons/bs";

import { useModal } from "../utils/Hooks";

import HomePage from "./HomePage";
import SearchResults from "./SearchResultsPage";
import BookDetails from "./BookDetailsPage";

const App: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const navigate = useNavigate();
    const { isOpen, openModal, closeModal } = useModal();

    // Toggle theme
    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    // Quick search handler
    const handleQuickSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery) return;
        navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    };

    // Advanced Search Component
    const AdvancedSearch: React.FC = () => {
        const [author, setAuthor] = useState<string>('');
        const [year, setYear] = useState<string>('');
        const [subject, setSubject] = useState<string>('');

        const handleAdvancedSearch = (e: React.FormEvent) => {
            e.preventDefault();
            let query = '';
            if (author) query += `author:${author} `;
            if (year) query += `first_publish_year:${year} `;
            if (subject) query += `subject:${subject} `;
            if (query.trim()) {
                navigate(`/search?query=${encodeURIComponent(query.trim())}`);
                closeModal();
            }
        };

        return (
            <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
                <div className="modal-content">
                    <button className="modal-close" onClick={closeModal}>×</button>
                    <h2>Advanced Search</h2>
                    <form onSubmit={handleAdvancedSearch} className="advanced-search-form">
                        <div>
                            <label>Author</label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                placeholder="Enter author name"
                            />
                        </div>
                        <div>
                            <label>Publication Year</label>
                            <input
                                type="number"
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                placeholder="Enter year"
                            />
                        </div>
                        <div>
                            <label>Subject</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Enter subject"
                            />
                        </div>
                        <button type="submit" aria-label="Advanced search submit">Search</button>
                    </form>
                </div>
            </div>
        );
    };

    return (
        <div className="app">
            <nav className="navbar">
                <h1 onClick={() => navigate('/')}>Libraria</h1>
                <div className="nav-links">
                    <form onSubmit={handleQuickSearch} className="search-form" data-testid="quick-search">
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search books by title, author, or subject..."
                                aria-label="Search books"
                            />
                        </div>
                        <button type="submit" aria-label="Quick search submit">Search</button>
                        <button type="button" onClick={openModal} className="advanced-search-btn" data-testid="open-advanced-modal">
                            Advanced
                        </button>
                    </form>
                    <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                        {theme === 'light' ? <BsFillSunFill /> : <BsFillMoonStarsFill />}
                    </button>
                </div>
            </nav>
            <AdvancedSearch />
            <div className="container">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/search" element={<SearchResults />} />
                    <Route path="/book/:key" element={<BookDetails />} />
                </Routes>
            </div>
        </div>
    );
};

export default App;
