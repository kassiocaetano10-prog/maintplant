import React, { useState } from 'react';

const OrderForm = ({ onClose, zones, onSave }) => {
  const [formData, setFormData] = useState({
    zona: zones[0] || '',
    tech: '',
    date: new Date().toISOString().split('T')[0],
    obs: ''
  });

  const handleSubmit = () => {
    if (!formData.tech || !formData.date) {
      alert('Preencha os campos obrigatórios');
      return;
    }
    onSave({ ...formData, status: 'aberta' });
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
          <label className="fl">Técnico responsável</label>
          <input 
            className="fi" 
            placeholder="Nome do técnico"
            value={formData.tech}
            onChange={(e) => setFormData({...formData, tech: e.target.value})}
          />
        </div>
        <div className="ff">
          <label className="fl">Data programada</label>
          <input 
            className="fi" 
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
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
