import React, { useState, useEffect } from 'react';

import type { RecentChange } from "../utils/Interfaces";

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

export default HomePage;
