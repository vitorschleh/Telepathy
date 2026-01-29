import { createClient } from 'redis';

export default async function handler(req, res) {
  // 1. Segurança: Só aceita envios (POST)
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { data } = req.body; // O app manda: { "data": "7H" }

  // 2. Conexão Simplificada com a URL completa
  const client = createClient({
    url: process.env.REDIS_URL
  });

  try {
    if (!client.isOpen) await client.connect();

    // 3. Grava a carta no Redis
    await client.set('carta_atual', data);
    
    await client.disconnect();
    
    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Erro no envio:", error);
    if (client.isOpen) await client.disconnect();
    return res.status(500).json({ error: error.message });
  }
}
