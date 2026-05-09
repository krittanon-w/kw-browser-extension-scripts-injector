import { useState, useEffect } from 'react';
import { getAll, addScript, updateScript, deleteScript, setGlobalEnabled } from '../lib/storage';
import type { ExtensionState, ScriptEntry } from '../lib/types';
import { CodeEditor } from '../components/CodeEditor';
import { exportData, importData } from '../lib/import-export';

function App() {
  const [state, setState] = useState<ExtensionState | null>(null);
  const [newPattern, setNewPattern] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadState();
  }, []);

  async function loadState() {
    const s = await getAll();
    setState(s);
  }

  async function handleAdd() {
    if (!newPattern.trim()) return;
    const script: ScriptEntry = {
      id: crypto.randomUUID(),
      cssCode: '',
      jsCode: '',
      urlPatterns: [newPattern.trim()],
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addScript(script);
    setNewPattern('');
    loadState();
  }

  async function handleUpdate(id: string, updates: Partial<ScriptEntry>) {
    await updateScript(id, updates);
    loadState();
  }

  async function handleDelete(id: string) {
    if (window.confirm('Delete this injector?')) {
      await deleteScript(id);
      loadState();
    }
  }

  async function handleToggleGlobal() {
    if (!state) return;
    await setGlobalEnabled(!state.globalEnabled);
    loadState();
  }

  if (!state) return <div style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto', boxSizing: 'border-box' }}>
      <h1>CSS & JS Injector Options</h1>
      
      <div style={{ marginBottom: '3rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#333' }}>Enable / Disable Extension</span>
        <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transform: 'scale(1.5)', marginRight: '1rem' }}>
          <input type="checkbox" checked={state.globalEnabled} onChange={handleToggleGlobal} />
        </label>
      </div>

      <section style={{ marginBottom: '3rem', padding: '1.5rem', border: '1px solid #eee', borderRadius: '8px' }}>
        <h2 style={{ marginTop: 0 }}>Create New Injector</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <input 
            style={{ flex: 1, padding: '0.6rem', borderRadius: '4px', border: '1px solid #ccc' }}
            placeholder="Enter a URL pattern (e.g. *://example.com/*)..." 
            value={newPattern} 
            onChange={e => setNewPattern(e.target.value)} 
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button 
            style={{ padding: '0.6rem 2rem', borderRadius: '4px', border: 'none', background: '#02abff', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            onClick={handleAdd}
          >
            Create
          </button>
        </div>
      </section>

      <section>
        <h2 style={{ marginBottom: '1.5rem' }}>Injectors</h2>
        {state.scripts.length === 0 && <p style={{ color: '#666' }}>No injectors configured yet.</p>}
        {state.scripts.map(script => (
          <div key={script.id} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '2rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', backgroundColor: '#fff', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', gap: '1rem', alignItems: 'center', overflow: 'hidden', minWidth: 0 }}>
                {editingId !== script.id && (
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: script.enabled ? '#333' : '#999' }}>
                    {script.urlPatterns[0] || 'No patterns'}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label className="switch" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={script.enabled} 
                    onChange={() => {
                      const newEnabled = !script.enabled;
                      handleUpdate(script.id, { enabled: newEnabled });
                      if (!newEnabled && editingId === script.id) {
                        setEditingId(null);
                      }
                    }} 
                  />
                  <span style={{ fontSize: '1rem', color: '#666' }}>{script.enabled ? 'On' : 'Off'}</span>
                </label>
                
                <button 
                  style={{ 
                    minWidth: '100px',
                    padding: '0.6rem 1rem', 
                    borderRadius: '6px', 
                    border: 'none', 
                    background: '#02abff', 
                    color: '#fff', 
                    cursor: script.enabled ? 'pointer' : 'not-allowed', 
                    fontWeight: 'bold',
                    opacity: script.enabled ? 1 : 0.5,
                    textAlign: 'center'
                  }}
                  disabled={!script.enabled}
                  onClick={() => setEditingId(editingId === script.id ? null : script.id)}
                >
                  {editingId === script.id ? 'Close' : 'Edit'}
                </button>
                <button 
                  style={{ 
                    minWidth: '100px',
                    padding: '0.6rem 1rem', 
                    borderRadius: '6px', 
                    border: '1px solid #ff4d4f', 
                    background: '#fff', 
                    color: '#ff4d4f', 
                    cursor: 'pointer',
                    textAlign: 'center'
                  }}
                  onClick={() => handleDelete(script.id)}
                >
                  Delete
                </button>
              </div>
            </div>

            {editingId === script.id && (
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: 0, width: '100%' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.8rem', color: '#888', fontWeight: 'normal' }}>URL Patterns (one per line)</h3>
                  <CodeEditor 
                    value={script.urlPatterns.join('\n')} 
                    language="text"
                    onChange={text => handleUpdate(script.id, { urlPatterns: text.split('\n').map(s => s.trim()).filter(s => s) })} 
                  />
                </div>

                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#02abff', fontWeight: 'bold' }}>Custom CSS</h3>
                  <CodeEditor 
                    value={script.cssCode} 
                    language="css"
                    onChange={cssCode => handleUpdate(script.id, { cssCode })}
                  />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.8rem', color: '#f59e0b', fontWeight: 'bold' }}>Custom JavaScript</h3>
                  <CodeEditor 
                    value={script.jsCode} 
                    language="js"
                    onChange={jsCode => handleUpdate(script.id, { jsCode })}
                  />
                </div>
                <div style={{ fontSize: '0.95rem', color: '#888', fontStyle: 'italic', marginTop: '1rem' }}>
                  Changes are saved automatically as you type.
                </div>
              </div>
            )}
          </div>
        ))}
      </section>

      <section style={{ marginTop: '5rem', padding: '2rem', borderTop: '2px solid #eee' }}>
        <h2 style={{ marginTop: 0 }}>Backup & Restore</h2>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button 
            style={{ padding: '0.6rem 1.2rem', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}
            onClick={() => exportData(state)}
          >
            Export All (JSON)
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>Import from file:</span>
            <input 
              type="file" 
              accept=".json" 
              style={{ fontSize: '0.9rem' }}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const mode = window.confirm('Merge with existing scripts? (Cancel to Replace all)') ? 'merge' : 'replace';
                try {
                  await importData(file, mode, state);
                  loadState();
                  alert('Import successful!');
                } catch (err: any) {
                  alert(`Import failed: ${err.message}`);
                }
                e.target.value = ''; 
              }} 
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
