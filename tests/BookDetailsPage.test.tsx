import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useParams } from 'react-router-dom';

import BookDetailsPage from '../src/components/BookDetailsPage';
import React from 'react';

describe('BookDetailsPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders loading state initially', () => {
        useParams.mockReturnValue({ key: 'OL123M' });
        render(<BookDetailsPage />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('displays error when no book key is provided', async () => {
        useParams.mockReturnValue({ key: undefined });
        render(<BookDetailsPage />);
        expect(await screen.findByText('No book key provided.')).toBeInTheDocument();
    });

    it('renders book details after successful fetch', async () => {
        useParams.mockReturnValue({ key: 'OL123M' });
        global.fetch
            .mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () =>
                        Promise.resolve({
                            title: 'Pride and Prejudice',
                            authors: [{ author: { key: '/authors/OL1A' } }],
                            covers: [12345],
                            description: 'A classic novel',
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
        expect(screen.getByText((content, element) => {
            return element?.textContent?.includes('Author: Jane Austen') || false;
        })).toBeInTheDocument();
        expect(screen.getByText('A summary from Wikipedia')).toBeInTheDocument();
        expect(screen.getByText('Read more on Wikipedia')).toBeInTheDocument();
    });

    it('handles fetch error gracefully', async () => {
        useParams.mockReturnValue({ key: 'OL123M' });
        global.fetch.mockRejectedValue(new Error('Network error'));

        render(<BookDetailsPage />);

        expect(await screen.findByText('Failed to load book details. Please try again later.')).toBeInTheDocument();
    });
});
