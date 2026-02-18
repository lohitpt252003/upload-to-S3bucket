import React, { useState, useEffect } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [message, setMessage] = useState('');

  // 1. Fetch the list of files when the app loads
  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/files');
      const data = await response.json();
      setUploadedFiles(data);
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

    // 2. Prepare the file for transport
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      // 3. Send it to FastAPI
      const response = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData, // fetch automatically sets the correct Content-Type header
      });

      if (response.ok) {
        setMessage("Upload successful!");
        fetchFiles(); // Refresh the list
      } else {
        setMessage("Upload failed.");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      setMessage("Error uploading file.");
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>File Upload Demo</h1>

      {/* Upload Section */}
      <div style={{ marginBottom: "20px", border: "1px solid #ccc", padding: "10px" }}>
        <h3>Upload a File</h3>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} style={{ marginLeft: "10px" }}>
          Upload
        </button>
        <p>{message}</p>
      </div>

      {/* List Section */}
      <div>
        <h3>Uploaded Files</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {uploadedFiles.map((file, index) => (
            <div key={index} style={{ border: "1px solid #ddd", padding: "10px" }}>
              <p><strong>{file.name}</strong></p>
              {/* If it's an image, show a preview */}
              {file.name.match(/\.(jpeg|jpg|gif|png)$/) && (
                <img src={file.url} alt={file.name} width="100" />
              )}
              <br />
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                Download/View
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;