const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);

app.post('/data', async (req, res) => {
  const { device_id, timestamp, Temperatura, Umidade } = req.body;
  if (!device_id || timestamp == null || Temperatura == null || Umidade == null)
    return res.status(400).json({ error: 'Campos ausentes' });

  const { data, error } = await supabase
    .from('sensor_readings')
    .insert([{ device_id, timestamp, temperatura: Temperatura, umidade: Umidade }])
    .select('id, created_at').single();

  if (error) return res.status(500).json({ error: error.message });
  console.log(`📡 [${device_id}] Temp: ${Temperatura}°C | Umidade: ${Umidade}%`);
  res.status(201).json({ status: 'ok', id: data.id, created_at: data.created_at });
});

app.get('/data', async (req, res) => {
  const { device_id, limit = 50 } = req.query;
  let query = supabase.from('sensor_readings').select('*')
    .order('timestamp', { ascending: false }).limit(Number(limit));
  if (device_id) query = query.eq('device_id', device_id);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json({ count: data.length, data });
});

app.get('/health', async (req, res) => {
  const { error } = await supabase.from('sensor_readings').select('id').limit(1);
  if (error) return res.status(503).json({ status: 'error', detail: error.message });
  res.json({ status: 'ok', db: 'supabase connected' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));
