import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';

import HomePage from '../src/components/HomePage';

describe('HomePage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('renders loading state initially', () => {
        render(<HomePage />);
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('renders recent changes after successful fetch', async () => {
        (global.fetch as unknown as Mock).mockResolvedValue({
            ok: true,
            json: () =>
                Promise.resolve([
                    {
                        id: '1',
                        comment: 'Updated book entry',
                        timestamp: '2025-05-28T12:00:00Z',
                        author: { displayname: 'Test User' },
                    },
                ]),
        });

        render(<HomePage />);
        expect(await screen.findByText('Updated book entry')).toBeInTheDocument();
        expect(screen.getByText(/By Test User on/i)).toBeInTheDocument();
    });

    it('falls back to mock data on fetch error', async () => {
        (global.fetch as unknown as Mock).mockRejectedValue(new Error('Network error'));

        render(<HomePage />);
        const errorMessage = await screen.findByText(/Failed to load recent changes:/i);
        expect(errorMessage).toBeInTheDocument();
    });

    it('displays no recent changes message when API returns empty array', async () => {
        (global.fetch as unknown as Mock).mockResolvedValue({
            ok: true,
            json: () => Promise.resolve([]),
        });

        render(<HomePage />);
        expect(await screen.findByText('No recent changes available from the library API.')).toBeInTheDocument();
    });
});
