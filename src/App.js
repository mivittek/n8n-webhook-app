import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import ReactMarkdown from 'react-markdown';

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState('SMS');
  const [dropdownOpen, setDropdownOpen] = useState(false); // New state for dropdown

  const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook-test/8f737c09-7579-4a6b-ac6a-bfcd1a71784b';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setLoading(true);
    setResponse('');

    try {
      const result = await axios.post(N8N_WEBHOOK_URL, {
        prompt: prompt,
        messageType: messageType,
        timestamp: new Date().toISOString()
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000
      });

      let processedResponse = result.data.message || JSON.stringify(result.data, null, 2);
      
      if (typeof processedResponse === 'string') {
        processedResponse = processedResponse.replace(/\\n/g, '\n');
      }
      
      setResponse(processedResponse);
      toast.success('Response received successfully!');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response. Please check your connection and try again.');
      setResponse('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(response)
      .then(() => {
        toast.success('Response copied to clipboard!');
      })
      .catch(() => {
        toast.error('Failed to copy to clipboard');
      });
  };

  const handleClear = () => {
    setPrompt('');
    setResponse('');
  };

  const handleMessageTypeSelect = (type) => {
    setMessageType(type);
    setDropdownOpen(false);
  };

  const convertToMarkdown = (text) => {
    if (!text) return '';
    
    let markdown = text;
    
    markdown = markdown
      .replace(/^(Vážený.*?[,:]?)$/gm, '### $1')
      .replace(/^(Dobrý deň.*?[,:]?)$/gm, '### $1')
      .replace(/^(Milý.*?[,:]?)$/gm, '### $1')
      .replace(/^(S úctou.*?)$/gm, '\n---\n\n*$1*')
      .replace(/^(S pozdravom.*?)$/gm, '\n---\n\n*$1*')
      .replace(/^(Srdečne.*?)$/gm, '\n---\n\n*$1*')
      .replace(/^(S vďakou.*?)$/gm, '\n---\n\n*$1*')
      .replace(/^(Váš tím.*?)$/gm, '**$1**')
      .replace(/^(Tím .*?)$/gm, '**$1**')
      .replace(/\b(DÔLEŽITÉ|UPOZORNENIE|POZNÁMKA|TIP|NOVINKA|AKCIA)\b:/g, '\n**🔔 $1:**')
      .replace(/^(Ďakujeme.*?)$/gm, '*$1*')
      .replace(/^[•·]\s/gm, '- ')
      .replace(/^(\d+)\.\s/gm, '$1. ')
      .replace(/\n\n/g, '\n\n');
    
    return markdown;
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Copywriter Assistant</h1>
        
        <form onSubmit={handleSubmit} className="prompt-form">
          <div className="form-group">
            <label>Typ správy:</label>
            <div className="dropdown-container">
              <button
                type="button"
                className="dropdown-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                disabled={loading}
              >
                {messageType} ▼
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div 
                    className="dropdown-item"
                    onClick={() => handleMessageTypeSelect('SMS')}
                  >
                    SMS
                  </div>
                  <div 
                    className="dropdown-item"
                    onClick={() => handleMessageTypeSelect('Mail')}
                  >
                    Mail
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="prompt">Zadajte váš prompt:</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Napíšte vašu správu sem..."
              rows="6"
              disabled={loading}
            />
          </div>
          
          <div className="button-group">
            <button type="submit" disabled={loading} className="send-button">
              {loading ? 'Odosiela sa...' : 'Odoslať'}
            </button>
            <button type="button" onClick={handleClear} className="clear-button">
              Vymazať
            </button>
          </div>
        </form>

        {(loading || response) && (
          <div className="response-section">
            <div className="response-header">
              <h2>Odpoveď:</h2>
              {response && !loading && (
                <button onClick={handleCopy} className="copy-button">
                  Kopírovať odpoveď
                </button>
              )}
            </div>
            
            <div className="response-container">
              {loading ? (
                <div className="loader">
                  <div className="spinner"></div>
                  <p>Čakám na odpoveď...</p>
                </div>
              ) : (
                <div className="formatted-response">
                  <ReactMarkdown
                    components={{
                      h3: ({children}) => <h3 className="markdown-greeting">{children}</h3>,
                      hr: () => <hr className="markdown-divider" />,
                      p: ({children}) => <p className="markdown-paragraph">{children}</p>,
                      strong: ({children}) => <strong className="markdown-bold">{children}</strong>,
                      em: ({children}) => <em className="markdown-italic">{children}</em>,
                      ul: ({children}) => <ul className="markdown-list">{children}</ul>,
                      ol: ({children}) => <ol className="markdown-list-ordered">{children}</ol>,
                      li: ({children}) => <li className="markdown-list-item">{children}</li>
                    }}
                  >
                    {convertToMarkdown(response)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
}

export default App;