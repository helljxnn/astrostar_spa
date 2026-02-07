import { useState } from 'react';

const AddNoteModal = ({ isOpen, onClose, onSave, loading = false }) => {
  const [noteText, setNoteText] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!noteText.trim()) {
      return;
    }

    const success = await onSave(noteText.trim());
    
    if (success) {
      setNoteText('');
      onClose();
    }
  };

  const handleClose = () => {
    setNoteText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <h3 className="text-lg font-semibold text-gray-800">Agregar Nota</h3>
          <p className="text-sm text-gray-500 mt-1">
            Documenta información adicional o aclaraciones sobre esta compra
          </p>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Escribe tu nota aquí..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent resize-none"
            required
            autoFocus
            disabled={loading}
          />

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-blue text-white rounded-lg hover:bg-primary-purple transition-colors disabled:opacity-50"
              disabled={loading || !noteText.trim()}
            >
              {loading ? 'Guardando...' : 'Guardar Nota'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNoteModal;
