import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
    return (
        <>
        </>
    )
}

export default App

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
