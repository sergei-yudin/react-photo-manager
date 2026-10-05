import { type ChangeEvent, useState } from 'react';

type Photo = { id: string; name: string; url: string };

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result)));
    reader.addEventListener('error', () => reject(new Error(reader.error?.message || 'File reading error')));
    reader.readAsDataURL(file);
  });
}

export default function App() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState('');

  const select = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = Array.from(input.files ?? []).filter((file) => file.type.startsWith('image/'));
    try {
      const urls = await Promise.all(files.map(fileToDataUrl));
      const added = files.map((file, index) => ({ id: `${crypto.randomUUID()}-${index}`, name: file.name, url: urls[index] }));
      setPhotos((current) => [...current, ...added]);
      setError('');
    } catch {
      setError('Не удалось прочитать выбранное изображение.');
    } finally {
      input.value = '';
    }
  };

  return (
    <main className="photo-manager">
      <h1>Менеджер фото</h1>
      <label className="upload-area">
        <span className="upload-icon">＋</span>
        <span>Click to select</span>
        <small>Можно выбрать несколько изображений</small>
        <input aria-label="Выбрать фотографии" className="file-input" type="file" accept="image/*" multiple onChange={select} />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      {photos.length === 0 ? <p className="empty">Выбранные фотографии появятся здесь</p> : <section className="preview-grid" aria-label="Выбранные фотографии">
        {photos.map((photo) => <article className="preview-item" key={photo.id}>
          <img src={photo.url} alt={photo.name} className="preview-image" />
          <button type="button" className="remove-btn" aria-label={`Удалить ${photo.name}`} onClick={() => setPhotos((current) => current.filter((item) => item.id !== photo.id))}>✕</button>
        </article>)}
      </section>}
    </main>
  );
}
