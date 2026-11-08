import { useState, useRef } from 'react';
import { loadAuth } from '../auth';

export default function SkinUploader() {
  const auth = loadAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [model, setModel] = useState<'slim' | 'classic'>('slim');
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!auth) return null;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setStatus(null);
    }
  }

  async function uploadSkin() {
    if (!file) return;
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);

    try {
      const res = await fetch(`/hub/api/user/profile/${auth!.selectedProfile.id}/skin`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${auth!.accessToken}` },
        body: formData,
      });

      if (res.ok) {
        setStatus('✅ Skin uploaded! Restart Minecraft to see changes.');
      } else {
        const err = await res.json();
        setStatus(`❌ Error: ${err.error || res.statusText}`);
      }
    } catch (e) {
      setStatus(`❌ Network error: ${(e as Error).message}`);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>Skin Uploader</h2>
      
      <div style={{ marginBottom: 16 }}>
        <input 
          type="file" 
          accept="image/png" 
          onChange={handleFileChange} 
          ref={fileInputRef} 
          style={{ display: 'none' }}
        />
        <button onClick={() => fileInputRef.current?.click()}>
          Choose PNG File (64x64 or 64x32)
        </button>
      </div>

      {preview && (
        <div style={{ marginBottom: 16, border: '1px solid #ccc', padding: 10, display: 'inline-block' }}>
          <p style={{ margin: '0 0 10px 0' }}>Preview:</p>
          <img 
            src={preview} 
            alt="Skin preview" 
            style={{ width: 128, height: 128, imageRendering: 'pixelated' }} 
          />
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <label>Model: </label>
        <select value={model} onChange={(e) => setModel(e.target.value as any)}>
          <option value="slim">Slim (Alex)</option>
          <option value="classic">Classic (Steve)</option>
        </select>
      </div>

      <div>
        <button 
          onClick={uploadSkin} 
          disabled={!file} 
          style={{ padding: '8px 16px', fontWeight: 'bold' }}
        >
          Upload Skin
        </button>
      </div>

      {status && (
        <div style={{ marginTop: 16, color: status.includes('✅') ? 'green' : 'crimson' }}>
          {status}
        </div>
      )}
    </div>
  );
}