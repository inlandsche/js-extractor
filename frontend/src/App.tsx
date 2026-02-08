import { useState } from 'react';
import { Copy, Coins, Castle } from 'lucide-react';
import './index.css';

// Types
interface ResultItem {
  type: string;
  key: string;
  value: string;
  line: number;
}

interface AnalysisResponse {
  success: boolean;
  results: ResultItem[];
  fileName?: string;
  error?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'paste' | 'upload'>('paste');
  const [textInput, setTextInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setActiveTab('upload');
    }
  };

  const analyze = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      let response;
      const API_URL = 'http://localhost:3001/api';

      if (activeTab === 'paste') {
        if (!textInput.trim()) throw new Error("Please enter some text to analyze");

        response = await fetch(`${API_URL}/analyze-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textInput })
        });
      } else {
        if (!file) throw new Error("Please select a file to analyze");

        const formData = new FormData();
        formData.append('file', file);

        response = await fetch(`${API_URL}/analyze-file`, {
          method: 'POST',
          body: formData
        });
      }

      const data: AnalysisResponse = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      setResults(data.results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Group results by type
  const groupedResults = results ? results.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, ResultItem[]>) : {};

  return (
    <>
      <div className="container">
        {/* Header - Mario Scoreboard Style */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-header)', marginBottom: '2rem', fontSize: '0.8rem', color: '#fff' }}>
          <div>
            <p style={{ color: 'red' }}>MARIO</p>
            <p>000000</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#ffcc00' }}>x 00</p>
            <p><Coins size={16} className="coin-icon" /> x0</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'white' }}>WORLD</p>
            <p>1-1</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: 'white' }}>TIME</p>
            <p>365</p>
          </div>
        </div>

        <header className="mario-header">
          <h1 style={{ marginBottom: '0.5rem' }}>SUPER JS EXTRACTOR</h1>
          <p style={{ color: '#fff', fontSize: '1.2rem' }}>
            PRESS START TO SCAN CODE
          </p>
        </header>

        {/* Main Input Section */}
        <div style={{ marginBottom: '3rem' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button
              className={`btn ${activeTab === 'paste' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('paste')}
              style={{ flex: 1 }}
            >
              PASTE CODE
            </button>
            <button
              className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('upload')}
              style={{ flex: 1 }}
            >
              UPLOAD FILE
            </button>
          </div>

          {/* Input Area */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {activeTab === 'paste' ? (
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="// INSERT YOUR CODE HERE..."
                style={{ height: '224px' }}
              />
            ) : (
              <div className="upload-area">
                <input
                  type="file"
                  id="file-upload"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{ display: 'none' }}
                />
                <label htmlFor="file-upload" style={{ textAlign: 'center', cursor: 'pointer' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1.2rem' }}>?</div>
                  <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1rem', marginBottom: '1rem', color: '#ffd700' }}>
                    DROP FILE HERE
                  </h3>
                  <p>{file ? `SELECTED: ${file.name}` : "HIT THE BLOCK TO SELECT"}</p>
                </label>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button
              className="btn btn-primary"
              onClick={analyze}
              disabled={loading}
              style={{ fontSize: '1.5rem', padding: '1.5rem 3rem' }}
            >
              {loading ? 'WARPING...' : 'START LEVEL!'}
            </button>
          </div>

          {error && (
            <div style={{
              marginTop: '2rem',
              padding: '1rem',
              background: '#000',
              color: 'red',
              border: '4px solid red',
              fontFamily: 'var(--font-header)',
              fontSize: '0.8rem',
              textAlign: 'center'
            }}>
              GAME OVER: {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div>
            <h2 style={{ marginBottom: '2rem', textAlign: 'center', color: '#fff' }}>
              <Castle size={32} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
              LEVEL COMPLETE
            </h2>

            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', border: '4px solid #fff', background: '#000' }}>
                <p style={{ fontFamily: 'var(--font-header)', lineHeight: '2' }}>
                  THANK YOU MARIO!<br />
                  BUT OUR PRINCESS IS IN ANOTHER CASTLE!<br />
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>(NO SECRETS FOUND)</span>
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '2rem' }}>
                {Object.entries(groupedResults).map(([type, items]) => (
                  <div key={type} className="result-card">
                    <div className="result-header">
                      {type.toUpperCase()}
                    </div>
                    <div>
                      {items.map((item, idx) => (
                        <div key={idx} className="result-row">
                          <div className="line-num">L{item.line}</div>
                          <div style={{ flex: 1, wordBreak: 'break-all' }}>
                            {item.value}
                          </div>
                          <button
                            onClick={() => copyToClipboard(item.value)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#fff',
                              cursor: 'pointer'
                            }}
                            title="Copy"
                          >
                            <Copy size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Ground Decoration */}
      <div className="ground-footer"></div>
    </>
  );
}

export default App;
