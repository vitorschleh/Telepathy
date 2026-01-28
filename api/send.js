import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // CORS (Permite que seu site fale com essa API)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { text } = req.query; // Ex: "7 %E2%99%A5"
  if (!text) return res.status(400).json({ error: 'Texto faltando' });

  try {
    // 1. Conecta no Supabase
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_KEY
    );

    // 2. Separa Valor e Naipe
    const partes = text.split(' ');
    const valor = partes[0];
    const naipe = partes[1];

    // 3. Atualiza a carta no banco (ID 'atual')
    const { error } = await supabase
      .from('cartas')
      .update({ valor: valor, naipe: naipe })
      .eq('id', 'atual');

    if (error) throw error;

    // 4. Manda pro Telegram (Seu backup)
    const token = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.CHAT_ID;
    if (token && chatId) {
        await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`);
    }

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("Erro Supabase:", error);
    return res.status(500).json({ error: 'Erro ao salvar' });
  }
}
