import { createClient } from 'redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Método não permitido');

  const { data } = req.body; // Ex: "7H"
  const client = createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_ENDPOINT.split(':')[0],
      port: parseInt(process.env.REDIS_ENDPOINT.split(':')[1])
    }
  });

  try {
    await client.connect();
    await client.set('carta_atual', data); // Salva a carta no Redis
    await client.disconnect();
    
    return res.status(200).json({ success: true });
  } catch (error) {
    if (client.isOpen) await client.disconnect();
    return res.status(500).json({ error: error.message });
  }
}
