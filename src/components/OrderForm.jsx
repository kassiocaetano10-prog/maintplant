import React, { useMemo, useState } from 'react';
import { useLang } from '../i18n/LangContext';

const OrderForm = ({ onClose, zones, valves = [], onSave, showToast }) => {
  const { t } = useLang();
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
      showToast?.(t('fill_required_fields'), 'warning');
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
        <div className="ftitle">{t('new_order')}</div>
        <div className="ff">
          <label className="fl">{t('zone_label')}</label>
          <select 
            className="fi" 
            value={formData.zona}
            onChange={(e) => setFormData({...formData, zona: e.target.value})}
          >
            {zones.map(z => <option key={z} value={z}>{z}</option>)}
          </select>
        </div>
        <div className="ff">
          <label className="fl">{t('valve_number')}</label>
          <input
            className="fi"
            placeholder={t('valve_number_placeholder')}
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
          <label className="fl">{t('responsible_tech')}</label>
          <input 
            className="fi" 
            placeholder={t('responsible_tech_placeholder')}
            value={formData.tecnico}
            onChange={(e) => setFormData({...formData, tecnico: e.target.value})}
          />
        </div>
        <div className="ff">
          <label className="fl">{t('scheduled_date')}</label>
          <input 
            className="fi" 
            type="date"
            value={formData.data_programada}
            onChange={(e) => setFormData({...formData, data_programada: e.target.value})}
          />
        </div>
        <div className="ff">
          <label className="fl">{t('observations')}</label>
          <input 
            className="fi" 
            placeholder={t('order_notes_placeholder')}
            value={formData.obs}
            onChange={(e) => setFormData({...formData, obs: e.target.value})}
          />
        </div>
        <button className="btn btn-p" onClick={handleSubmit} style={{ marginBottom: '8px' }}>{t('create_order')}</button>
        <button className="btn btn-o" onClick={onClose}>{t('cancel')}</button>
      </div>
    </div>
  );
};

export default OrderForm;
