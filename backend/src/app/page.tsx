export default function Home() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>AI Diary API Server</h1>
      <p>This is the API server for AI Diary.</p>
      <h2>Endpoints</h2>
      <ul>
        <li>
          <code>POST /api/analyze</code> - Analyze diary content
        </li>
      </ul>
      <p style={{ marginTop: '2rem', color: '#666' }}>
        Frontend: <a href="http://localhost:5173">http://localhost:5173</a>
      </p>
    </div>
  )
}
