import { useState, useEffect } from 'react';
import { getAll, addScript, updateScript, deleteScript, setGlobalEnabled } from '../lib/storage';
import type { ExtensionState, ScriptEntry } from '../lib/types';

function App() {
  const [state, setState] = useState<ExtensionState | null>(null);
  const [newScript, setNewScript] = useState<Partial<ScriptEntry>>({
    name: '',
    type: 'css',
    urlPatterns: [],
    code: '',
    delayMs: 0,
    enabled: true,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadState();
  }, []);

  async function loadState() {
    const s = await getAll();
    setState(s);
  }

  async function handleAdd() {
    if (!newScript.name) return;
    const script: ScriptEntry = {
      id: crypto.randomUUID(),
      name: newScript.name || 'Untitled',
      type: newScript.type as 'css' | 'js',
      urlPatterns: newScript.urlPatterns || [],
      code: newScript.code || '',
      delayMs: newScript.delayMs || 0,
      enabled: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await addScript(script);
    setNewScript({ name: '', type: 'css', urlPatterns: [], code: '', delayMs: 0, enabled: true });
    loadState();
  }

  async function handleUpdate(id: string, updates: Partial<ScriptEntry>) {
    await updateScript(id, updates);
    loadState();
  }

  async function handleDelete(id: string) {
    if (window.confirm('Delete this script?')) {
      await deleteScript(id);
      loadState();
    }
  }

  async function handleToggleGlobal() {
    if (!state) return;
    await setGlobalEnabled(!state.globalEnabled);
    loadState();
  }

  if (!state) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>CSS & JS Injector Options</h1>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
        <label>
          <input type="checkbox" checked={state.globalEnabled} onChange={handleToggleGlobal} />
          Extension Globally Enabled
        </label>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Add New Script</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px' }}>
          <input 
            placeholder="Name" 
            value={newScript.name} 
            onChange={e => setNewScript({...newScript, name: e.target.value})} 
          />
          <select 
            value={newScript.type} 
            onChange={e => setNewScript({...newScript, type: e.target.value as 'css' | 'js'})}
          >
            <option value="css">CSS</option>
            <option value="js">JavaScript</option>
          </select>
          <input 
            placeholder="URL Patterns (comma separated)" 
            value={newScript.urlPatterns?.join(', ')} 
            onChange={e => setNewScript({...newScript, urlPatterns: e.target.value.split(',').map(s => s.trim())})} 
          />
          <input 
            type="number" 
            placeholder="Delay (ms)" 
            value={newScript.delayMs} 
            onChange={e => setNewScript({...newScript, delayMs: parseInt(e.target.value) || 0})} 
          />
          <button onClick={handleAdd}>Add Script</button>
        </div>
      </section>

      <section>
        <h2>Existing Scripts</h2>
        {state.scripts.length === 0 && <p>No scripts yet.</p>}
        {state.scripts.map(script => (
          <div key={script.id} style={{ border: '1px solid #eee', padding: '1rem', marginBottom: '1rem', opacity: script.enabled ? 1 : 0.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>{script.name}</strong> ({script.type})
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{script.urlPatterns.join(', ')}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleUpdate(script.id, { enabled: !script.enabled })}>
                  {script.enabled ? 'Disable' : 'Enable'}
                </button>
                <button onClick={() => setEditingId(editingId === script.id ? null : script.id)}>
                  {editingId === script.id ? 'Close' : 'Edit Code'}
                </button>
                <button onClick={() => handleDelete(script.id)} style={{ color: 'red' }}>Delete</button>
              </div>
            </div>
            
            {editingId === script.id && (
              <div style={{ marginTop: '1rem' }}>
                <textarea 
                  style={{ width: '100%', height: '200px', fontFamily: 'monospace' }} 
                  value={script.code} 
                  onChange={e => handleUpdate(script.id, { code: e.target.value })}
                />
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#888' }}>
                  Auto-saves on change.
                </div>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

export default App;
