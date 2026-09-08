export default {
  async sendWelcomeEmail(email, tempPassword, type = 'membership') {
    try {
      const fromEmail = process.env.SMTP_FROM || 'no-reply@creativatestudio.cloud';
      const isTicket = type === 'ticket';
      const subject = isTicket 
        ? `Welcome to CMF Global - Your Account Details`
        : `CMF Global - Membership Application Received`;
      
      console.log(`✉️ Sending Welcome (${type}) to: ${email} from ${fromEmail}`);

      await strapi.plugins['email'].services.email.send({
        to: email,
        from: fromEmail,
        subject: subject,
        html: `
          <h1>${isTicket ? 'Welcome to CMF Global!' : 'Application Received!'}</h1>
          <p>${isTicket 
            ? 'Thank you for your purchase. We have created a member account for you to manage your tickets and profile.' 
            : 'Thank you for applying for a CMF Global membership. Your application is currently <strong>pending approval</strong>.'
          }</p>
          <p>${isTicket 
            ? 'You can access your dashboard using the temporary credentials below:' 
            : 'Our team will review your details shortly. In the meantime, you can access your dashboard using the temporary credentials below:'
          }</p>
          <div style="background: #f4f4f4; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Login Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          ${isTicket ? '' : '<p>You will receive another email once your membership has been approved and activated.</p>'}
          <div style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3003'}" style="background: #1a1a1a; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Go to Dashboard</a>
          </div>
        `,
      });
      console.log(`✅ Welcome Email (${type}) SUCCESS`);
    } catch (err: any) {
      console.error('❌ EMAIL ERROR:', err.message);
    }
  },

  async sendActivationEmail(email, memberName) {
    try {
      const fromEmail = process.env.SMTP_FROM || 'no-reply@creativatestudio.cloud';
      
      await strapi.plugins['email'].services.email.send({
        to: email,
        from: fromEmail,
        subject: `Congratulations! Your CMF Global Membership is ACTIVE`,
        html: `
          <h1>Welcome to the Club, ${memberName}!</h1>
          <p>We are excited to inform you that your membership application has been <strong>approved and activated</strong>.</p>
          <p>Your membership validity has started counting from today.</p>
          <p>You can now log in to your dashboard to view your digital membership card and access exclusive member features.</p>
          <div style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3003'}" style="background: #1a1a1a; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Access My Dashboard</a>
          </div>
        `,
      });
      console.log('✅ Activation Email SUCCESS');
    } catch (err: any) {
      console.error('❌ ACTIVATION EMAIL ERROR:', err.message);
    }
  },

  async sendTicketEmail(attendeeId) {
    try {
      const attendee: any = await strapi.db.query('api::attendee.attendee').findOne({
        where: { id: attendeeId },
        populate: ['event', 'order']
      });

      if (!attendee) return;

      const event = attendee.event;
      const fromEmail = process.env.SMTP_FROM || 'no-reply@creativatestudio.cloud';

      const dateStr = new Date(event.startDateTime).toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
      const timeStr = new Date(event.startDateTime).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit'
      });

      await strapi.plugins['email'].services.email.send({
        to: attendee.email,
        from: fromEmail,
        subject: `🎟️ Your Official Ticket: ${event.title}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet">
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 50px; margin-bottom: 50px;">
              <tr>
                <td align="center">
                  <div style="max-width: 600px; background-color: #ffffff; border-radius: 40px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
                    
                    <!-- Header / Branding -->
                    <div style="background-color: #1a1a1a; padding: 40px 0; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 5px; font-weight: 900; text-transform: uppercase;">CMF GLOBAL</h1>
                      <p style="color: #E63946; margin: 5px 0 0; font-size: 10px; font-weight: bold; letter-spacing: 3px; text-transform: uppercase;">Official Event Invitation</p>
                    </div>

                    <!-- Main Content -->
                    <div style="padding: 50px 40px; text-align: center;">
                      
                      <div style="margin-bottom: 40px;">
                        <p style="margin: 0; font-size: 11px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 2px;">Your Ticket Reference</p>
                        <h2 style="margin: 10px 0 0; font-size: 36px; font-weight: 900; color: #1a1a1a; letter-spacing: 1px; font-family: 'Montserrat', sans-serif;">${attendee.referenceCode}</h2>
                      </div>

                      <div style="background-color: #fdf2f2; border: 2px solid #fee2e2; border-radius: 30px; padding: 40px 20px; margin-bottom: 40px;">
                        <h3 style="margin: 0; font-size: 24px; font-weight: 900; color: #1a1a1a; line-height: 1.2;">${event.title}</h3>
                        
                        <div style="margin-top: 25px; display: inline-block; padding: 15px 30px; background: #E63946; border-radius: 15px; color: #ffffff; font-weight: bold; font-size: 14px; line-height: 1.6;">
                          <div style="font-size: 16px; margin-bottom: 8px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">${event.location}</div>
                          ${dateStr} @ ${timeStr}
                        </div>
                      </div>

                      <div style="text-align: left; padding: 0 10px;">
                        <div style="margin-bottom: 25px;">
                          <p style="margin: 0; font-size: 11px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 1px;">Attendee Name</p>
                          <p style="margin: 5px 0 0; font-size: 18px; font-weight: 700; color: #1a1a1a;">${attendee.firstName} ${attendee.lastName}</p>
                        </div>
                        
                        <div>
                          <p style="margin: 0; font-size: 11px; font-weight: 900; color: #999; text-transform: uppercase; letter-spacing: 1px;">Company</p>
                          <p style="margin: 5px 0 0; font-size: 18px; font-weight: 700; color: #1a1a1a;">${attendee.companyName || 'N/A'}</p>
                        </div>
                      </div>

                    </div>

                    <!-- Footer -->
                    <div style="background-color: #f9f9f9; padding: 30px; text-align: center; border-top: 1px solid #eeeeee;">
                      <p style="margin: 0; font-size: 12px; color: #999; line-height: 1.5;">
                        Please present this digital ticket or provide your reference number at the registration counter for entry.
                      </p>
                      <p style="margin: 15px 0 0; font-size: 10px; color: #cccccc; text-transform: uppercase; font-weight: bold;">
                        &copy; 2026 CMF GLOBAL EVENT SERVICES
                      </p>
                    </div>

                  </div>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
      });
      console.log(`✅ Ticket Email sent to ${attendee.email}`);
    } catch (err: any) {
      console.error('❌ TICKET EMAIL ERROR:', err.message);
    }
  }
};
