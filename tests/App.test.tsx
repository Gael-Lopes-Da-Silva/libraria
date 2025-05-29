import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useNavigate } from 'react-router-dom';
import { useModal } from '../src/utils/Hooks';

import App from '../src/components/AppPage';
import React from 'react';

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useModal.mockReturnValue({
            isOpen: false,
            openModal: vi.fn(),
            closeModal: vi.fn(),
        });
    });

    it('renders without crashing', () => {
        render(<App />);
        expect(screen.getByText('Libraria')).toBeInTheDocument();
    });

    it('toggles theme when theme button is clicked', () => {
        render(<App />);
        const themeButton = screen.getByRole('button', { name: /toggle theme/i });
        fireEvent.click(themeButton);
        expect(document.documentElement.classList.contains('dark')).toBe(true);
        fireEvent.click(themeButton);
        expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('handles quick search submission', () => {
        const mockNavigate = vi.fn();
        useNavigate.mockReturnValue(mockNavigate);

        render(<App />);
        const searchInput = screen.getByLabelText(/search books/i);
        const searchForm = screen.getByRole('form', { name: /quick search/i });

        fireEvent.change(searchInput, { target: { value: 'test book' } });
        fireEvent.submit(searchForm);
        expect(mockNavigate).toHaveBeenCalledWith('/search?query=test%20book');
    });

    it('opens advanced search modal', () => {
        const mockOpenModal = vi.fn();
        useModal.mockReturnValue({
            isOpen: false,
            openModal: mockOpenModal,
            closeModal: vi.fn(),
        });

        render(<App />);
        const advancedButton = screen.getByRole('button', { name: /advanced/i });
        fireEvent.click(advancedButton);
        expect(mockOpenModal).toHaveBeenCalled();
    });

    it('handles advanced search submission', async () => {
        const mockNavigate = vi.fn();
        const mockCloseModal = vi.fn();
        useNavigate.mockReturnValue(mockNavigate);
        useModal.mockReturnValue({
            isOpen: true,
            openModal: vi.fn(),
            closeModal: mockCloseModal,
        });

        render(<App />);

        const authorInput = screen.getByPlaceholderText(/enter author name/i);
        const yearInput = screen.getByPlaceholderText(/enter year/i);
        const subjectInput = screen.getByPlaceholderText(/enter subject/i);
        const advancedSearchButton = screen.getByRole('button', { name: /advanced search submit/i });

        fireEvent.change(authorInput, { target: { value: 'Jane Austen' } });
        fireEvent.change(yearInput, { target: { value: '1813' } });
        fireEvent.change(subjectInput, { target: { value: 'Romance' } });
        fireEvent.click(advancedSearchButton);

        expect(mockNavigate).toHaveBeenCalledWith(
            '/search?query=author%3AJane%20Austen%20first_publish_year%3A1813%20subject%3ARomance'
        );
        expect(mockCloseModal).toHaveBeenCalled();
    });
});
