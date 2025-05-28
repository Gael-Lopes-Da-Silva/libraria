import React, { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { BsFillSunFill, BsFillMoonStarsFill } from "react-icons/bs";

import placeholder from "./assets/placeholder.webp";
import './main.css';

// Define interfaces for API data
interface RecentChange {
    id: string;
    comment: string;
    timestamp: string;
    author?: { displayname: string };
}

interface Book {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    cover_i?: number;
    details?: BookDetails;
}

interface BookDetails {
    title?: string;
    description?: string | { value: string };
    authors?: { name: string }[];
    subjects?: string[];
    [key: string]: any;
}

interface WikiData {
    extract: string;
    image?: string;
    pageUrl: string;
}

interface WikiPage {
    extract: string;
    thumbnail?: { source: string };
}

// Custom hook for modal state
const useModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);
    return { isOpen, openModal, closeModal };
};

// Main App Component
const App: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Theme state
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
            if (author) query += `author:${encodeURIComponent(author)} `;
            if (year) query += `first_publish_year:${year} `;
            if (subject) query += `subject:${encodeURIComponent(subject)} `;
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
                        <button type="submit">Search</button>
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
                    <form onSubmit={handleQuickSearch} className="search-form">
                        <div className="search-input-wrapper">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search books by title, author, or subject..."
                                aria-label="Search books"
                            />
                        </div>
                        <button type="submit">Search</button>
                        <button type="button" onClick={openModal} className="advanced-search-btn">
                            Advanced
                        </button>
                    </form>
                    <button onClick={toggleTheme} className="theme-toggle">
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

// Home Page Component
const HomePage: React.FC = () => {
    const [recentChanges, setRecentChanges] = useState<RecentChange[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchWithRetry = async (url: string, retries = 3, delay = 1000): Promise<Response> => {
            for (let i = 0; i < retries; i++) {
                try {
                    const res = await fetch(url);
                    if (res.ok) return res;
                    if (res.status === 429 && i < retries - 1) {
                        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
                        continue;
                    }
                    throw new Error(`HTTP error ${res.status}`);
                } catch (err) {
                    if (i === retries - 1) throw err;
                }
            }
            throw new Error('Max retries reached');
        };

        const fetchHomeData = async () => {
            setIsLoading(true);
            setError(null);

            const mockRecentChanges: RecentChange[] = [
                { id: '1', comment: 'Sample change', timestamp: '2025-05-28T12:00:00Z', author: { displayname: 'Test User' } }
            ];

            try {
                // Fetch recent changes
                const recentRes = await fetchWithRetry('https://openlibrary.org/recentchanges.json?limit=5');
                if (!recentRes.ok) {
                    throw new Error(`Recent changes HTTP error ${recentRes.status}`);
                }
                const recentData = await recentRes.json();
                const recentChangesArray = Array.isArray(recentData) ? recentData : [];
                setRecentChanges(recentChangesArray);

                if (recentChangesArray.length === 0) {
                    setError('No recent changes available from the library API.');
                }
            } catch (err) {
                console.error('Error fetching recent changes:', err);
                if (err instanceof Error) {
                    setError(`Failed to load recent changes: ${err.message}. Using fallback data.`);
                    setRecentChanges(mockRecentChanges);
                } else {
                    setError('Failed to load recent changes: An unexpected error occurred. Using fallback data.');
                    setRecentChanges(mockRecentChanges);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchHomeData();
    }, []);

    return (
        <div className="content">
            <h2>Recent Changes</h2>
            {isLoading && <p className="loading">Loading...</p>}
            {error && <p className="error">{error}</p>}
            {!isLoading && !error && (
                <div className="card-grid">
                    {recentChanges.length > 0 ? (
                        recentChanges.map(change => (
                            <div key={change.id} className="card">
                                <p className="font-semibold">{change.comment || 'No comment'}</p>
                                <p>By {change.author?.displayname || 'Unknown'} on {new Date(change.timestamp).toLocaleDateString()}</p>
                            </div>
                        ))
                    ) : (
                        <p>No recent changes available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

// Search Results Component
const SearchResults: React.FC = () => {
    const navigate = useNavigate();
    const { search } = useLocation();
    const query = new URLSearchParams(search).get('query') || '';
    const [searchResults, setSearchResults] = useState<Book[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!query) {
            setError('No search query provided.');
            setIsLoading(false);
            return;
        }

        const fetchSearchResults = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
                if (!res.ok) {
                    throw new Error(`Search HTTP error ${res.status}`);
                }
                const data: { docs: Book[] } = await res.json();
                setSearchResults(Array.isArray(data.docs) ? data.docs : []);
            } catch (err) {
                console.error('Error searching books:', err);
                setError('Failed to load search results. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    return (
        <div className="content">
            <h2>Search Results</h2>
            {isLoading && <p className="loading">Loading...</p>}
            {error && <p className="error">{error}</p>}
            {!isLoading && !error && (
                <div className="card-grid">
                    {searchResults.length > 0 ? (
                        searchResults.map(book => (
                            <div
                                key={book.key}
                                className="card"
                                onClick={() => navigate(`/book/${book.key.replace('/works/', '')}`)}
                            >
                                <img
                                    src={book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : placeholder}
                                    alt={`${book.title} cover`}
                                    className="book-cover"
                                />
                                <h3>{book.title || 'Unknown Title'}</h3>
                                <p>{book.author_name?.join(', ') || 'Unknown'}</p>
                                <p>{book.first_publish_year || 'N/A'}</p>
                            </div>
                        ))
                    ) : (
                        <p>No books found for your search.</p>
                    )}
                </div>
            )}
        </div>
    );
};

// Book Details Component
const BookDetails: React.FC = () => {
    const { key } = useParams<{ key: string }>();
    const [selectedBook, setSelectedBook] = useState<Book | null>(null);
    const [wikiData, setWikiData] = useState<WikiData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!key) {
            setError('No book key provided.');
            setIsLoading(false);
            return;
        }

        const fetchBookDetails = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch book data
                const bookRes = await fetch(`https://openlibrary.org/works/${key}.json`);
                if (!bookRes.ok) {
                    throw new Error(`HTTP error ${bookRes.status}`);
                }
                const bookData: BookDetails = await bookRes.json();

                // Validate and construct book object
                const book: Book = {
                    key: `/works/${key}`,
                    title: bookData.title || 'Unknown Title',
                    author_name: bookData.authors?.map(a => a.name) || [],
                    first_publish_year: bookData.first_publish_year,
                    details: bookData
                };
                setSelectedBook(book);

                // Fetch Wikipedia data
                const wikiRes = await fetch(
                    `https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(bookData.title || 'Unknown')}&format=json`
                );
                if (!wikiRes.ok) {
                    throw new Error(`Wikipedia HTTP error ${wikiRes.status}`);
                }
                const wiki: { query: { pages: Record<string, WikiPage> } } = await wikiRes.json();
                const page = Object.values(wiki.query.pages)[0];
                setWikiData({
                    extract: page.extract || 'No Wikipedia summary available.',
                    image: page.thumbnail?.source,
                    pageUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(bookData.title || 'Unknown')}`
                });
            } catch (err) {
                console.error('Error fetching book details:', err);
                setError('Failed to load book details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetails();
    }, [key]);

    return (
        <div className="content">
            {isLoading && <p className="loading">Loading...</p>}
            {error && <p className="error">{error}</p>}
            {!isLoading && !error && selectedBook && (
                <div className="book-details">
                    <div className="flex-1">
                        {wikiData?.image && <img src={wikiData.image} alt="Book cover" />}
                        <h2>{selectedBook.title}</h2>
                        <p><strong>Author:</strong> {selectedBook.author_name?.join(', ') || 'Unknown'}</p>
                        <p><strong>Published:</strong> {selectedBook.first_publish_year || 'N/A'}</p>
                        {selectedBook.details?.description && (
                            <p><strong>Description:</strong> {typeof selectedBook.details.description === 'string' ? selectedBook.details.description : selectedBook.details.description?.value || 'No description available'}</p>
                        )}
                        {selectedBook.details?.subjects && (
                            <p><strong>Subjects:</strong> {selectedBook.details.subjects.join(', ') || 'None'}</p>
                        )}
                        {wikiData?.extract && (
                            <>
                                <p><strong>Wikipedia Summary:</strong> {wikiData.extract}</p>
                                <a href={wikiData.pageUrl} target="_blank" rel="noopener noreferrer">Read more on Wikipedia</a>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>
);
