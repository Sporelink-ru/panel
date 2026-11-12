import { useState, useRef } from 'react';
import { loadAuth } from '../auth';

export default function SkinUploader() {
  const auth = loadAuth();
  const [status, setStatus] = useState<string | null>(null);

  const [skinFile, setSkinFile] = useState<File | null>(null);
  const [skinPreview, setSkinPreview] = useState<string | null>(null);
  const [skinModel, setSkinModel] = useState<'slim' | 'classic'>('slim');
  const skinInputRef = useRef<HTMLInputElement>(null);

  const [capeFile, setCapeFile] = useState<File | null>(null);
  const [capePreview, setCapePreview] = useState<string | null>(null);
  const capeInputRef = useRef<HTMLInputElement>(null);

  if (!auth) return null;

  const handleSkinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setSkinFile(file); setSkinPreview(URL.createObjectURL(file)); setStatus(null); }
  };

  const handleCapeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setCapeFile(file); setCapePreview(URL.createObjectURL(file)); setStatus(null); }
  };

  const uploadTexture = async (type: 'skin' | 'cape', file: File) => {
    setStatus(`Загрузка ${type === 'skin' ? 'скина' : 'плаща'}...`);
    const formData = new FormData();
    formData.append('file', file);
    if (type === 'skin') formData.append('model', skinModel);

    try {
      const res = await fetch(`/hub/api/user/profile/${auth!.selectedProfile.id}/${type}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${auth!.accessToken}` },
        body: formData,
      });

      if (res.ok) {
        setStatus(`✅ ${type === 'skin' ? 'Скин' : 'Плащ'} успешно обновлен!`);
      } else {
        const err = await res.json();
        setStatus(`❌ Ошибка: ${err.error || res.statusText}`);
      }
    } catch (e) {
      setStatus(`❌ Сетевая ошибка: ${(e as Error).message}`);
    }
  };

  return (
    <div className="page-content animate-in">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Настройки текстур</h2>
        
        <div style={{ display: 'flex', gap: 32, marginTop: 24 }}>
          {/* БЛОК СКИНА */}
          <div style={{ flex: 1 }}>
            <h3>Скин</h3>
            <div className="form-group">
              <label className="file-upload-label">
                {skinFile ? skinFile.name : 'Выбрать PNG файл'}
                <input type="file" accept="image/png" onChange={handleSkinChange} ref={skinInputRef} style={{ display: 'none' }} />
              </label>
            </div>
            
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <label className="custom-radio">
                <input type="radio" checked={skinModel === 'slim'} onChange={() => setSkinModel('slim')} />
                <span className="checkmark"></span>
                <span>Slim (Alex)</span>
              </label>
              <label className="custom-radio">
                <input type="radio" checked={skinModel === 'classic'} onChange={() => setSkinModel('classic')} />
                <span className="checkmark"></span>
                <span>Classic (Steve)</span>
              </label>
            </div>

            <button onClick={() => skinFile && uploadTexture('skin', skinFile)} disabled={!skinFile} style={{ width: '100%' }}>
              Загрузить скин
            </button>
          </div>

          {/* ПРЕВЬЮ СКИНА */}
          <div style={{ width: 128, height: 128, background: 'var(--bg)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {skinPreview ? <img src={skinPreview} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Нет</div>}
          </div>
        </div>

        <hr style={{ borderColor: 'var(--border)', margin: '32px 0' }} />

        <div style={{ display: 'flex', gap: 32 }}>
          {/* БЛОК ПЛАЩА */}
          <div style={{ flex: 1 }}>
            <h3>Плащ (Cape)</h3>
            <div className="form-group">
              <label className="file-upload-label">
                {capeFile ? capeFile.name : 'Выбрать PNG (64x32)'}
                <input type="file" accept="image/png" onChange={handleCapeChange} ref={capeInputRef} style={{ display: 'none' }} />
              </label>
            </div>
            <button onClick={() => capeFile && uploadTexture('cape', capeFile)} disabled={!capeFile} style={{ width: '100%' }}>
              Загрузить плащ
            </button>
          </div>

          {/* ПРЕВЬЮ ПЛАЩА */}
          <div style={{ width: 128, height: 64, background: 'var(--bg)', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
            {capePreview ? <img src={capePreview} style={{ width: '100%', height: '100%', objectFit: 'contain', imageRendering: 'pixelated' }} /> : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>Нет</div>}
          </div>
        </div>

        {status && <div style={{ marginTop: 24, color: status.includes('✅') ? 'var(--success)' : 'var(--danger)' }}>{status}</div>}
      </div>
    </div>
  );
}