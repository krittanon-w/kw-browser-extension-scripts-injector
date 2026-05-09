function App() {
  return (
    <div style={{ width: '300px', padding: '1rem' }}>
      <h1>Injector Popup</h1>
      <button onClick={() => chrome.runtime.openOptionsPage()}>
        Open Options
      </button>
    </div>
  )
}

export default App
