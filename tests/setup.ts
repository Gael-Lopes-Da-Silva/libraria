import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock fetch globally
global.fetch = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
    BrowserRouter: ({ children }: { children: any }) => children,
    Routes: ({ children }: { children: any }) => children,
    Route: ({ element }: { element: any }) => element,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ search: '' })),
    useParams: vi.fn(() => ({ key: undefined })),
}));

// Mock useModal hook
vi.mock('../utils/Hooks', () => ({
    useModal: vi.fn().mockReturnValue({
        isOpen: false,
        openModal: vi.fn(),
        closeModal: vi.fn(),
    }),
}));
