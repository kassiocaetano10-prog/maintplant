import fs from 'fs';

// Fake the export so we can require the plantData using dynamic import or just string manipulation
const content = fs.readFileSync('src/data/plantData.js', 'utf8');
const jsonStr = content.match(/export const PLANT_DATA = (\{[\s\S]*?\});/)[1];
const data = JSON.parse(jsonStr);

let sql = `\n-- Insert Valves from plantData.js\nINSERT INTO valves (zona, tag, marca, serie, kit, assento, dn, tipo, ult_kit, ult_man, fabricacao, atuador, lote, mariposa) VALUES\n`;

const values = data.valves.map(v => {
  const escape = (str) => {
    if (str === null || str === undefined) return 'NULL';
    return "'" + str.replace(/'/g, "''") + "'";
  };
  return `  (${escape(v.zona)}, ${escape(v.tag)}, ${escape(v.marca)}, ${escape(v.serie)}, ${escape(v.kit)}, ${escape(v.assento)}, ${escape(v.dn)}, ${escape(v.tipo)}, ${escape(v.ult_kit)}, ${escape(v.ult_man)}, ${escape(v.fabricacao)}, ${escape(v.atuador)}, ${escape(v.lote)}, ${escape(v.mariposa)})`;
});

sql += values.join(',\n') + ';\n';
fs.appendFileSync('supabase-schema.sql', sql);
console.log('Valves SQL generated successfully!');
