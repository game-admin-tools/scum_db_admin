import { useEffect } from 'react';
import './index.css';

declare global {
  interface Window {
    electron?: {
      appReady: () => void;
    };
  }
}

function App() {
  useEffect(() => {
    // Notify Main process that React is ready, so it can close splash and show main window
    const timer = setTimeout(() => {
      window.electron?.appReady();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%', flexDirection: 'row' }}>
      {/* Sidebar */}
      <nav style={{
        width: '250px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          color: 'var(--accent)',
          marginBottom: '40px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span>SDA</span>
          <span style={{ fontSize: '0.8rem', opacity: 0.7, color: 'var(--text-secondary)' }}>v{__APP_VERSION__}</span>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {['Dashboard', 'Databases', 'Users', 'Settings'].map((item, index) => (
            <li key={item} style={{ marginBottom: '10px' }}>
              <a href="#" style={{
                display: 'block',
                padding: '10px 15px',
                borderRadius: '8px',
                color: index === 0 ? '#fff' : 'var(--text-secondary)',
                backgroundColor: index === 0 ? 'var(--accent)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}>
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <header style={{ marginBottom: '40px' }}>
          <h1 style={{ margin: 0 }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome to SCUM DB Admin.</p>
        </header>

        {/* Empty Dashboard Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{
              backgroundColor: 'var(--bg-secondary)',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-secondary)',
              borderStyle: 'dashed'
            }}>
              Empty Widget {i}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
