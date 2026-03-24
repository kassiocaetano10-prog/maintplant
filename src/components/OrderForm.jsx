import React, { useMemo, useState } from 'react';

const OrderForm = ({ onClose, zones, valves = [], onSave }) => {
  const [formData, setFormData] = useState({
    zona: zones[0] || '',
    valveTag: '',
    tecnico: '',
    data_programada: new Date().toISOString().split('T')[0],
    obs: ''
  });

  const valveTags = useMemo(() => {
    const tags = valves
      .map((v) => (v?.tag || '').trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return Array.from(new Set(tags));
  }, [valves]);

  const valveSuggestions = useMemo(() => {
    const query = (formData.valveTag || '').trim().toLowerCase();
    if (!query) return valveTags.slice(0, 30);
    return valveTags
      .filter((tag) => tag.toLowerCase().includes(query))
      .slice(0, 30);
  }, [formData.valveTag, valveTags]);

  const handleSubmit = () => {
    if (!formData.tecnico || !formData.data_programada) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSave({
      ...formData,
      observacoes: formData.obs,
      status: 'aberta'
    });
  };

  return (
    <div id="oform" className="on">
      <div className="fsh">
        <div className="ftitle">⚡ Nova Ordem de Serviço</div>
        <div className="ff">
          <label className="fl">Zona</label>
          <select 
            className="fi" 
            value={formData.zona}
            onChange={(e) => setFormData({...formData, zona: e.target.value})}
          >
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="ff">
          <label className="fl">Nº da válvula</label>
          <input
            className="fi"
            placeholder="Ex: 2.30.4.16"
            list="valve-tags-list"
            value={formData.valveTag}
            onChange={(e) => setFormData({ ...formData, valveTag: e.target.value })}
          />
          <datalist id="valve-tags-list">
            {valveSuggestions.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </div>
        <div className="ff">
          <label className="fl">Técnico responsável</label>
          <input 
            className="fi" 
            placeholder="Nome do técnico"
            value={formData.tecnico}
            onChange={(e) => setFormData({...formData, tecnico: e.target.value})}
          />
        </div>
        <div className="ff">
          <label className="fl">Data programada</label>
          <input 
            className="fi" 
            type="date"
            value={formData.data_programada}
            onChange={(e) => setFormData({...formData, data_programada: e.target.value})}
          />
        </div>
        <div className="ff">
          <label className="fl">Observações</label>
          <input 
            className="fi" 
            placeholder="Prioridade, válvulas específicas..."
            value={formData.obs}
            onChange={(e) => setFormData({...formData, obs: e.target.value})}
          />
        </div>
        <button className="btn btn-p" onClick={handleSubmit} style={{ marginBottom: '8px' }}>Criar Ordem</button>
        <button className="btn btn-o" onClick={onClose}>Cancelar</button>
      </div>
    </div>
  );
};

export default OrderForm;
