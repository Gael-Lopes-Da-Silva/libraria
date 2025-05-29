import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Mock } from 'vitest';

import SearchResultsPage from '../src/components/SearchResultsPage';

describe('SearchResultsPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders error when no query is provided', async () => {
        (useLocation as unknown as Mock).mockReturnValue({ search: '' });
        render(<SearchResultsPage />);
        expect(await screen.findByText('No search query provided.')).toBeInTheDocument();
    });

    it('renders search results after successful fetch', async () => {
        (useLocation as unknown as Mock).mockReturnValue({ search: '?query=test' });
        (global.fetch as unknown as Mock).mockResolvedValue({
            ok: true,
            json: () =>
                Promise.resolve({
                    docs: [
                        {
                            key: '/works/OL123M',
                            title: 'Pride and Prejudice',
                            author_name: ['Jane Austen'],
                            cover_i: 12345,
                            first_publish_year: 1813,
                        },
                    ],
                }),
        });

        render(<SearchResultsPage />);

        expect(await screen.findByText('Pride and Prejudice')).toBeInTheDocument();
        expect(screen.getByText('Jane Austen')).toBeInTheDocument();
        expect(screen.getByText('1813')).toBeInTheDocument();
    });

    it('handles fetch error gracefully', async () => {
        (useLocation as unknown as Mock).mockReturnValue({ search: '?query=test' });
        (global.fetch as unknown as Mock).mockRejectedValue(new Error('Network error'));

        render(<SearchResultsPage />);

        expect(await screen.findByText('Failed to load search results. Please try again later.')).toBeInTheDocument();
    });

    it('displays no results message when search returns empty array', async () => {
        (useLocation as unknown as Mock).mockReturnValue({ search: '?query=test' });
        (global.fetch as unknown as Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ docs: [] }),
        });

        render(<SearchResultsPage />);

        expect(await screen.findByText('No books found for your search.')).toBeInTheDocument();
    });

    it('navigates to book details on card click', async () => {
        const mockNavigate = vi.fn();
        (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
        (useLocation as unknown as Mock).mockReturnValue({ search: '?query=test' });
        (global.fetch as unknown as Mock).mockResolvedValue({
            ok: true,
            json: () =>
                Promise.resolve({
                    docs: [
                        {
                            key: '/works/OL123M',
                            title: 'Pride and Prejudice',
                            author_name: ['Jane Austen'],
                            cover_i: 12345,
                            first_publish_year: 1813,
                        },
                    ],
                }),
        });

        render(<SearchResultsPage />);

        const bookCard = await screen.findByText('Pride and Prejudice');
        fireEvent.click(bookCard);

        expect(mockNavigate).toHaveBeenCalledWith('/book/OL123M');
    });
});
