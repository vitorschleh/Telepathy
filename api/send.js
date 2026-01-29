import { createClient } from 'redis';

export default async function handler(req, res) {
  // Configuração simples e direta
  const client = createClient({
    url: process.env.REDIS_URL
  });

  try {
    if (req.method !== 'POST') return res.status(405).send('Só aceita POST');

    if (!client.isOpen) await client.connect();
    
    // O App manda { "data": "7H" }
    const { data } = req.body; 
    
    // Grava no Redis
    await client.set('carta_atual', data);
    
    await client.disconnect();
    return res.status(200).json({ success: true });
    
  } catch (error) {
    console.error(error);
    if (client.isOpen) await client.disconnect();
    return res.status(500).json({ error: error.message });
  }
}
