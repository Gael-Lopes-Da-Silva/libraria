import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';

import type { Book, BookDetails, WikiData } from "../utils/Interfaces";

import placeholder from "../assets/placeholder.webp";

const BookDetailsPage: React.FC = () => {
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
                const bookRes = await fetch(`https://openlibrary.org/works/${key}.json`);
                if (!bookRes.ok) throw new Error(`HTTP error ${bookRes.status}`);
                const bookData: BookDetails = await bookRes.json();

                // Author names
                let authorNames: string[] = [];
                if (bookData.authors && bookData.authors.length > 0) {
                    const authorPromises = bookData.authors.map(async (authorObj) => {
                        const authorKey = authorObj.author?.key;
                        if (authorKey) {
                            const authorRes = await fetch(`https://openlibrary.org${authorKey}.json`);
                            if (authorRes.ok) {
                                const authorData = await authorRes.json();
                                return authorData.name;
                            }
                        }
                        return null;
                    });
                    const names = await Promise.all(authorPromises);
                    authorNames = names.filter((name): name is string => name !== null);
                }

                const book: Book = {
                    key: `/works/${key}`,
                    title: bookData.title || 'Unknown Title',
                    author_name: authorNames,
                    details: bookData
                };
                setSelectedBook(book);

                // Wikipedia
                const wikiRes = await fetch(
                    `https://en.wikipedia.org/w/api.php?origin=*&action=query&prop=extracts|pageimages&exintro&explaintext&titles=${encodeURIComponent(bookData.title || 'Unknown')}&format=json`
                );
                if (!wikiRes.ok) throw new Error(`Wikipedia HTTP error ${wikiRes.status}`);
                const wiki: { query: { pages: Record<string, any> } } = await wikiRes.json();
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
                <div className="book-details-container">
                    <div
                        className="book-details-cover"
                        style={{
                            backgroundImage: `url(${selectedBook.details?.covers?.[0]
                                ? `https://covers.openlibrary.org/b/id/${selectedBook.details.covers[0]}-L.jpg`
                                : placeholder})`
                        }}
                    ></div>
                    <div className="book-info">
                        {wikiData?.image && (
                            <div className="wiki-image">
                                <img src={wikiData.image} alt="Wikipedia" />
                            </div>
                        )}
                        <h2>{selectedBook.title}</h2>
                        <p data-testid="author"><strong>Author:</strong> {selectedBook.author_name?.join(', ') || 'Unknown'}</p>

                        {/* Description */}
                        {selectedBook.details?.description && (
                            <div>
                                <strong>Description:</strong>{' '}
                                <ReactMarkdown>
                                    {typeof selectedBook.details.description === 'string'
                                        ? selectedBook.details.description
                                        : selectedBook.details.description.value || 'No description available.'}
                                </ReactMarkdown>
                            </div>
                        )}

                        {/* Subjects */}
                        {selectedBook.details?.subjects && selectedBook.details?.subjects?.length > 0 && (
                            <>
                                <strong>Subjects:</strong>
                                <p>{selectedBook.details.subjects.join(', ')}</p>
                            </>
                        )}

                        {/* People */}
                        {selectedBook.details?.subject_people && selectedBook.details?.subject_people?.length > 0 && (
                            <>
                                <strong>Characters:</strong>
                                <p>{selectedBook.details.subject_people.join(', ')}</p>
                            </>
                        )}

                        {/* Places */}
                        {selectedBook.details?.subject_places && selectedBook.details?.subject_places?.length > 0 && (
                            <>
                                <strong>Places:</strong>
                                <p>
                                    {selectedBook.details.subject_places.join(', ')}
                                </p>
                            </>
                        )}

                        {/* Times */}
                        {selectedBook.details?.subject_times && selectedBook.details?.subject_times?.length > 0 && (
                            <>
                                <strong>Time Periods:</strong>
                                <p>{selectedBook.details.subject_times.join(', ')}</p>
                            </>
                        )}

                        {/* Excerpts */}
                        {selectedBook.details?.excerpts && selectedBook.details?.excerpts?.length > 0 && (
                            <blockquote className="excerpt">
                                “{selectedBook.details.excerpts[0].excerpt}”
                                {selectedBook.details.excerpts[0].comment && (
                                    <footer>— {selectedBook.details.excerpts[0].comment}</footer>
                                )}
                            </blockquote>
                        )}

                        {/* Links */}
                        {selectedBook.details?.links && selectedBook.details?.links?.length > 0 && (
                            <div className="book-links">
                                <strong>External Links:</strong>
                                <ul>
                                    {selectedBook.details.links.map((link) => (
                                        <li key={link.url}>
                                            <a href={link.url} target="_blank" rel="noopener noreferrer">
                                                {link.title}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Wikipedia */}
                        {wikiData?.extract && (
                            <>
                                <strong>Wikipedia Summary:</strong>
                                <p>{wikiData.extract}</p>
                                <a href={wikiData.pageUrl} target="_blank" rel="noopener noreferrer">Read more on Wikipedia</a>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookDetailsPage;
