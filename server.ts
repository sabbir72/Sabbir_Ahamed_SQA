import 'dotenv/config';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Route: Contact form Brevo email delivery
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Missing required fields (name, email, subject, message).' });
      }

      const brevoApiKey = process.env.BREVO_API_KEY;
      if (!brevoApiKey) {
        console.warn('BREVO_API_KEY is not defined in environment variables.');
        return res.status(503).json({ 
          error: 'Brevo API key is missing. Please set BREVO_API_KEY in your server environment settings.' 
        });
      }

      const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sabbircse72@gmail.com';
      const recipientEmail = process.env.BREVO_RECIPIENT_EMAIL || 'sabbircse72@gmail.com';

      // Send transactional email via Brevo REST API v3
      const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoApiKey,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: `${name} (Portfolio Form)`,
            email: senderEmail,
          },
          to: [
            {
              email: recipientEmail,
              name: 'Sabbir Ahamed',
            },
          ],
          replyTo: {
            email: email,
            name: name,
          },
          subject: `[Portfolio Contact] ${subject}`,
          htmlContent: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
              <div style="margin-bottom: 20px; text-align: center;">
                <h2 style="color: #FF6B35; margin: 0; font-size: 22px;">New Portfolio Inquiry</h2>
                <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Sent from your SQA Portfolio Contact Form</p>
              </div>
              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
              
              <div style="margin-bottom: 16px;">
                <p style="margin: 4px 0; font-size: 14px;"><strong>Sender Name:</strong> ${name.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Subject:</strong> ${subject.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>

              <div style="background-color: #f8fafc; padding: 18px; border-left: 4px solid #FF6B35; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Message Content:</p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #334155;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
              </div>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                You can reply directly to this email to respond to ${name}.
              </p>
            </div>
          `,
        }),
      });

      if (!brevoResponse.ok) {
        const errorData = await brevoResponse.json().catch(() => ({}));
        console.error('Brevo API Error:', brevoResponse.status, errorData);
        return res.status(brevoResponse.status).json({
          error: errorData?.message || 'Failed to deliver email through Brevo API.',
          details: errorData
        });
      }

      const responseData = await brevoResponse.json().catch(() => ({}));
      return res.status(200).json({ 
        success: true, 
        message: 'Message delivered successfully via Brevo!', 
        messageId: responseData?.messageId 
      });

    } catch (err: any) {
      console.error('Contact endpoint error:', err);
      return res.status(500).json({ error: 'Internal server error while dispatching email.' });
    }
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'portfolio-server' });
  });

  // Serve Vite app
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
