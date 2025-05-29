import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import type { Mock } from 'vitest';

import BookDetailsPage from '../src/components/BookDetailsPage';

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useParams: vi.fn(),
    };
});

describe('BookDetailsPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders loading state initially', () => {
        (useParams as unknown as Mock).mockReturnValue({ key: 'OL123M' });
        render(<BookDetailsPage />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays error when no book key is provided', async () => {
        (useParams as unknown as Mock).mockReturnValue({ key: undefined });
        render(<BookDetailsPage />);
        expect(await screen.findByText('No book key provided.')).toBeInTheDocument();
    });

    it('renders book details after successful fetch', async () => {
        (useParams as unknown as Mock).mockReturnValue({ key: 'OL66554W' });

        (global.fetch as unknown as Mock)
            .mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            title: 'Pride and Prejudice',
                            authors: [{ author: { key: '/authors/OL66' } }],
                            covers: [12345],
                            description: 'A classic novel',
                            subjects: ['Fiction', 'Romance'],
                            subject_people: ['Elizabeth Bennet'],
                            subject_places: ['England'],
                            subject_times: ['19th century'],
                            excerpts: [{ excerpt: 'It is a truth universally acknowledged...', comment: 'Opening line' }],
                            links: [{ title: 'Open Library', url: 'https://openlibrary.org/works/OL66554W' }]
                        }),
                })
            )
            .mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({ name: 'Jane Austen' }),
                })
            )
            .mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            query: {
                                pages: {
                                    '1': {
                                        extract: 'A summary from Wikipedia',
                                        thumbnail: { source: 'http://example.com/image.jpg' },
                                    },
                                },
                            },
                        }),
                })
            );

        render(<BookDetailsPage />);

        expect(await screen.findByText('Pride and Prejudice')).toBeInTheDocument();
        expect(screen.getByTestId('author')).toHaveTextContent('Author: Jane Austen');
        expect(screen.getByText('A classic novel')).toBeInTheDocument();
        expect(screen.getByText('Fiction, Romance')).toBeInTheDocument();
        expect(screen.getByText('Elizabeth Bennet')).toBeInTheDocument();
        expect(screen.getByText('England')).toBeInTheDocument();
        expect(screen.getByText('19th century')).toBeInTheDocument();
        expect(screen.getByText(/universally acknowledged/i)).toBeInTheDocument();
        expect(screen.getByText(/Opening line/i)).toBeInTheDocument();
        expect(screen.getByText('Open Library')).toHaveAttribute('href', 'https://openlibrary.org/works/OL66554W');
        expect(screen.getByText('A summary from Wikipedia')).toBeInTheDocument();
        expect(screen.getByText('Read more on Wikipedia')).toBeInTheDocument();
    });


    it('handles fetch error gracefully', async () => {
        (useParams as unknown as Mock).mockReturnValue({ key: 'OL123M' });
        (global.fetch as unknown as Mock).mockRejectedValue(new Error('Network error'));

        render(<BookDetailsPage />);

        expect(await screen.findByText('Failed to load book details. Please try again later.')).toBeInTheDocument();
    });
});
