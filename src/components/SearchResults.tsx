import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import type { Book } from "../utils/Interfaces";

import placeholder from "../assets/placeholder.webp";

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

export default SearchResults;
