export default async function handler(req, res) {
  // 1. Segurança Básica: Configura cabeçalhos (CORS) para aceitar conexão do seu site
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Se for apenas um "ping" (OPTIONS), responde que está tudo ok
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // 2. Pega a mensagem que veio do PWA
  const { text } = req.query;

  if (!text) {
    return res.status(400).json({ error: 'Texto não fornecido' });
  }

  // 3. Pega os segredos do cofre da Vercel
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Erro de Configuração na Vercel (Token/ID faltando)' });
  }

  try {
    // 4. Manda pro Telegram
    const url = `https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.ok) {
      return res.status(200).json({ success: true, message: 'Enviado com sucesso' });
    } else {
      return res.status(500).json({ error: 'Telegram recusou', details: data });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
}
