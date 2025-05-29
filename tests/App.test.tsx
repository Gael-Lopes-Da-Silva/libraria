import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { Mock } from 'vitest';
import { useNavigate } from 'react-router-dom';
import * as Hooks from '../src/utils/Hooks';
import { MemoryRouter } from 'react-router-dom';

import App from '../src/components/AppPage';

vi.mock('../src/utils/Hooks', () => ({
    useModal: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
    return {
        ...actual,
        useNavigate: vi.fn(),
    };
});


describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (Hooks.useModal as ReturnType<typeof vi.fn>).mockReturnValue({
            isOpen: false,
            openModal: vi.fn(),
            closeModal: vi.fn(),
        });
    });

    it('renders without crashing', () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        expect(screen.getByText('Libraria')).toBeInTheDocument();
    });

    it('toggles theme when theme button is clicked', () => {
        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        const themeButton = screen.getByRole('button', { name: /toggle theme/i });
        fireEvent.click(themeButton);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        fireEvent.click(themeButton);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('handles quick search submission', () => {
        const mockNavigate = vi.fn();
        (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);

        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        const searchInput = screen.getByLabelText(/search books/i);
        const searchForm = screen.getByTestId('quick-search');

        fireEvent.change(searchInput, { target: { value: 'test book' } });
        fireEvent.submit(searchForm);
        expect(mockNavigate).toHaveBeenCalledWith('/search?query=test%20book');
    });

    it('opens advanced search modal', () => {
        const mockOpenModal = vi.fn();
        (Hooks.useModal as ReturnType<typeof vi.fn>).mockReturnValue({
            isOpen: false,
            openModal: mockOpenModal,
            closeModal: vi.fn(),
        });

        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );
        const advancedButton = screen.getByTestId('open-advanced-modal');
        fireEvent.click(advancedButton);
        expect(mockOpenModal).toHaveBeenCalled();
    });

    it('handles advanced search submission', async () => {
        const mockNavigate = vi.fn();
        const mockCloseModal = vi.fn();
        (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
        (Hooks.useModal as ReturnType<typeof vi.fn>).mockReturnValue({
            isOpen: false,
            openModal: vi.fn(),
            closeModal: mockCloseModal,
        });

        render(
            <MemoryRouter>
                <App />
            </MemoryRouter>
        );

        // 1) Ouvrir la modale
        fireEvent.click(screen.getByText('Advanced'));

        // 2) Attendre l'apparition du formulaire
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/enter author name/i)).toBeInTheDocument();
        });

        // 3) Remplir et soumettre
        fireEvent.change(screen.getByPlaceholderText(/enter author name/i), {
            target: { value: 'Jane Austen' },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter year/i), {
            target: { value: '1813' },
        });
        fireEvent.change(screen.getByPlaceholderText(/enter subject/i), {
            target: { value: 'Romance' },
        });

        const submitBtn = screen.getByLabelText('Advanced search submit');
        fireEvent.click(submitBtn);

        // 4) Attendre et vérifier
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith(
                '/search?query=author%3AJane%20Austen%20first_publish_year%3A1813%20subject%3ARomance'
            );
            expect(mockCloseModal).toHaveBeenCalled();
        });
    });

});
