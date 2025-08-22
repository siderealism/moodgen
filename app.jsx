const { useState, useEffect } = React;

function App() {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    fetch('images.json')
      .then((res) => res.json())
      .then((data) => setImages(data));
  }, []);

  function loadVibe() {
    if (!images.length) return;
    const choice = images[Math.floor(Math.random() * images.length)];
    setCurrent(choice);
  }

  return (
    <div className="app">
      <h1>vibedealer</h1>
      <button onClick={loadVibe} disabled={!images.length}>load a vibe</button>
      {current && (
        <div className="vibe">
          <img src={current} alt="a random vibe" />
        </div>
      )}
      <footer>© {new Date().getFullYear()}</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
