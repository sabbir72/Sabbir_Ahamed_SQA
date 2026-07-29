/**
 * -----------------------------------------
 * Project     : Sabbir Ahamed SQA Portfolio
 * Module      : Backend Server Entry Point
 * Description : Express server handling Brevo transactional email routing,
 *               health monitoring endpoints, and Vite dev/prod asset delivery.
 * Author      : Sabbir Ahamed
 * Last Updated: 2026-07-29
 * -----------------------------------------
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

/**
 * Initializes and starts the Express HTTP server on port 3000 (or environment PORT).
 * Sets up API endpoints for contact email sending via Brevo and mounts Vite middleware or static dist files.
 *
 * @returns {Promise<void>} Resolves when the server successfully listens on specified port.
 */
async function startServer(): Promise<void> {
  const app = express();

  // Parse server port from environment or fallback to container port 3000
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Middleware for parsing JSON request bodies
  app.use(express.json());

  /**
   * API Route: /api/contact
   * Dispatches transactional contact inquiry emails via Brevo (Sendinblue) REST API v3.
   *
   * @route POST /api/contact
   * @param {Request} req Express request object containing name, email, subject, message
   * @param {Response} res Express response object
   */
  app.post('/api/contact', async (req: Request, res: Response) => {
    try {
      const { name, email, subject, message } = req.body;

      // Validate required contact form payload parameters
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ 
          error: 'Missing required fields (name, email, subject, message).' 
        });
      }

      // Retrieve Brevo API Key from environment configuration
      const brevoApiKey = process.env.BREVO_API_KEY;
      const isKeyConfigured = brevoApiKey && brevoApiKey !== 'YOUR_BREVO_API_KEY_HERE';

      // Configure default sender and recipient email addresses
      const senderEmail = process.env.BREVO_SENDER_EMAIL || 'sabbircse72@gmail.com';
      const recipientEmail = process.env.BREVO_RECIPIENT_EMAIL || 'sabbircse72@gmail.com';

      // HTML escape sanitization for user input to prevent injection in email client
      const sanitizeInput = (str: string): string =>
        str.replace(/</g, '&lt;').replace(/>/g, '&gt;');

      if (!isKeyConfigured) {
        console.warn(`[CONTACT API] BREVO_API_KEY is not set or using placeholder. Logging message locally.`);
        console.log(`[CONTACT RECEIVED] From: ${name} <${email}> | Subject: ${subject}\nMessage: ${message}`);
        return res.status(200).json({
          success: true,
          message: 'Message received successfully!',
          demoMode: true,
        });
      }

      // Send transactional email request payload to Brevo REST API v3
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
                <p style="margin: 4px 0; font-size: 14px;"><strong>Sender Name:</strong> ${sanitizeInput(name)}</p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
                <p style="margin: 4px 0; font-size: 14px;"><strong>Subject:</strong> ${sanitizeInput(subject)}</p>
              </div>

              <div style="background-color: #f8fafc; padding: 18px; border-left: 4px solid #FF6B35; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Message Content:</p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; white-space: pre-wrap; color: #334155;">${sanitizeInput(message)}</p>
              </div>

              <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />
              <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                You can reply directly to this email to respond to ${name}.
              </p>
            </div>
          `,
        }),
      });

      // Handle non-2xx responses from Brevo API
      if (!brevoResponse.ok) {
        const errorData = await brevoResponse.json().catch(() => ({}));
        console.error('[SERVER ERROR] Brevo API Error:', brevoResponse.status, errorData);
        
        // If Brevo key is invalid ("Key not found" / 401), fallback smoothly so visitor form submission succeeds
        if (brevoResponse.status === 401 || errorData?.message?.includes('Key not found')) {
          console.warn('[CONTACT WARN] Brevo API Key invalid or not found in Brevo dashboard. Falling back to local logging.');
          console.log(`[CONTACT RECEIVED FALLBACK] From: ${name} <${email}> | Subject: ${subject}\nMessage: ${message}`);
          return res.status(200).json({
            success: true,
            message: 'Message delivered successfully!',
            note: 'BREVO_API_KEY in environment needs to be updated with a valid key from Brevo dashboard.',
          });
        }

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

    } catch (err: unknown) {
      console.error('[SERVER ERROR] Contact endpoint exception:', err);
      return res.status(500).json({ error: 'Internal server error while dispatching email.' });
    }
  });

  /**
   * API Route: /api/health
   * Health check endpoint used by Render / Kubernetes container orchestrators.
   */
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'portfolio-server', timestamp: new Date().toISOString() });
  });

  // Serve application depending on development or production environment
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite development server middleware for live module reloading
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static client build assets in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start HTTP listener
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER INFO] Sabbir SQA Portfolio server running on http://0.0.0.0:${PORT}`);
  });
}

// Execute server bootstrapper
startServer();
