import React, { useState, useEffect } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/files');
      if (response.ok) {
        const data = await response.json();
        setUploadedFiles(data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setMessage("Uploading...");
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setMessage("Upload successful!");
        setSelectedFile(null); // Clear selection
        fetchFiles(); // Refresh list immediately
      } else {
        setMessage("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      setMessage("Error uploading file.");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Arial, sans-serif", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center" }}>My Video & File Manager</h1>

      {/* Upload Section */}
      <div style={{ 
        background: "#f9f9f9", 
        padding: "20px", 
        borderRadius: "8px", 
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        marginBottom: "30px" 
      }}>
        <h3>Upload New File</h3>
        <input type="file" onChange={handleFileChange} />
        <button 
          onClick={handleUpload} 
          style={{ 
            padding: "8px 16px", 
            marginLeft: "10px", 
            background: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer" 
          }}
        >
          Upload
        </button>
        {message && <p style={{ marginTop: "10px", color: message.includes("Error") ? "red" : "green" }}>{message}</p>}
      </div>

      {/* Gallery Section */}
      <div>
        <h3>Your Files</h3>
        {uploadedFiles.length === 0 && <p>No files uploaded yet.</p>}
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
          {uploadedFiles.map((file, index) => (
            <div key={index} style={{ border: "1px solid #ddd", borderRadius: "8px", overflow: "hidden", background: "white" }}>
              
              {/* VIDEO PLAYER */}
              {file.name.match(/\.(mp4|webm|ogg|mov)$/i) ? (
                <video width="100%" height="200" controls style={{ background: "black" }}>
                  <source src={file.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : 
              /* IMAGE PREVIEW */
              file.name.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                <img src={file.url} alt={file.name} style={{ width: "100%", height: "200px", objectFit: "cover" }} />
              ) : (
              /* GENERIC FILE ICON */
                <div style={{ height: "200px", background: "#eee", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   📄 File
                </div>
              )}

              <div style={{ padding: "10px" }}>
                <p style={{ margin: "0 0 10px 0", fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {file.name}
                </p>
                <a 
                  href={file.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: "none", color: "#007bff", fontSize: "0.9em" }}
                >
                  Download / View Full
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;