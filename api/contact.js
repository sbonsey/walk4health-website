import sgMail from '@sendgrid/mail'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { name, email, subject, message } = req.body

    console.log('📧 Contact form submission received:', { name, email, subject, message: message.substring(0, 100) + '...' })

    // Validate required fields
    if (!name || !email || !subject || !message) {
      console.error('❌ Missing required fields:', { name: !!name, email: !!email, subject: !!subject, message: !!message })
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get email configuration
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

    console.log('🔍 Redis config check:', {
      hasRedisUrl: !!redisUrl,
      hasRedisToken: !!redisToken,
      redisUrl: redisUrl ? '***SET***' : 'NOT SET'
    })

    if (!redisUrl || !redisToken) {
      console.error('❌ Redis environment variables not set')
      return res.status(500).json({ error: 'Email configuration not available' })
    }

    // Get email config from Redis
    let inquiryEmail = 'admin@walk4health.co.nz'
    let subjectPrefix = '[Walk4Health]'

    try {
      console.log('🔍 Fetching email config from Redis...')
      const configResponse = await fetch(`${redisUrl}/get/walk4health:email-config`, {
        headers: {
          'Authorization': `Bearer ${redisToken}`
        }
      })

      console.log('🔍 Email config response status:', configResponse.status)

      if (configResponse.ok) {
        const configResult = await configResponse.json()
        console.log('🔍 Email config result:', configResult)

        if (configResult.result) {
          const config = JSON.parse(configResult.result)
          inquiryEmail = config.inquiryEmail || inquiryEmail
          subjectPrefix = config.subjectPrefix || subjectPrefix
          console.log('✅ Using configured email settings:', { inquiryEmail, subjectPrefix })
        } else {
          console.log('⚠️ No email config found in Redis, using defaults')
        }
      } else {
        console.log('⚠️ Failed to fetch email config, using defaults')
      }
    } catch (configError) {
      console.error('⚠️ Error fetching email config, using defaults:', configError)
    }

    const resendApiKey = process.env.RESEND_API_KEY
    const sendgridApiKey = process.env.SENDGRID_API_KEY
    const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@walk4health.co.nz'
    const sendgridFromName = process.env.SENDGRID_FROM_NAME || 'Walk4Health Website'
    const activeProvider = resendApiKey ? 'Resend' : sendgridApiKey ? 'SendGrid' : 'None'

    console.log('🔍 Email service check:', {
      hasResendKey: !!resendApiKey,
      hasSendgridKey: !!sendgridApiKey,
      sendgridFromEmail,
      activeProvider
    })

    if (!resendApiKey && !sendgridApiKey) {
      console.error('❌ No email provider API key configured')
      return res.status(500).json({ error: 'Email service not configured. Please contact the administrator.' })
    }

    let emailResponse
    if (sendgridApiKey) {
      sgMail.setApiKey(sendgridApiKey)
      console.log('📧 Sending email via SendGrid SDK...')
      const msg = {
        to: inquiryEmail,
        from: { email: sendgridFromEmail, name: sendgridFromName },
        replyTo: { email, name },
        subject: `${subjectPrefix} ${subject}`,
        text: `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n\n---\nThis message was sent from the Walk4Health website contact form.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">New Contact Form Submission</h2>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Subject:</strong> ${subject}</p>
              <p><strong>Message:</strong></p>
              <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
                ${message.replace(/\n/g, '<br>')}
              </div>
            </div>
            <p style="color: #64748b; font-size: 14px;">
              This message was sent from the Walk4Health website contact form.
            </p>
          </div>
        `
      }

      try {
        const response = await sgMail.send(msg)
        console.log('✅ SendGrid response received:', { statusCode: response?.[0]?.statusCode })
        emailResponse = {
          ok: true,
          status: 202,
          body: ''
        }
      } catch (sgError) {
        console.error('❌ SendGrid API error:', sgError.code, sgError.message, sgError.response?.body)
        emailResponse = {
          ok: false,
          status: sgError.code || sgError.response?.statusCode || 500,
          body: sgError.response?.body || sgError.message
        }
      }
    } else {
      console.log('📧 Sending email via Resend...')
      emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: inquiryEmail,
            subject: `${subjectPrefix} ${subject}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #2563eb;">New Contact Form Submission</h2>
                <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Name:</strong> ${name}</p>
                  <p><strong>Email:</strong> ${email}</p>
                  <p><strong>Subject:</strong> ${subject}</p>
                  <p><strong>Message:</strong></p>
                  <div style="background-color: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
                    ${message.replace(/\n/g, '<br>')}
                  </div>
                </div>
                <p style="color: #64748b; font-size: 14px;">
                  This message was sent from the Walk4Health website contact form.
                </p>
              </div>
            `,
            text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent from the Walk4Health website contact form.
            `
        })
      })
    }

    console.log('📧 Email provider API response status:', emailResponse.status)

    if (!emailResponse.ok) {
      let errorText = ''
      if (typeof emailResponse.text === 'function') {
        errorText = await emailResponse.text()
      } else {
        errorText = emailResponse.body || ''
      }
      console.error('❌ Email provider API error:', emailResponse.status, errorText)

      if (sendgridApiKey) {
        if (emailResponse.status === 401) {
          throw new Error('Invalid SendGrid API key - please check email service configuration')
        } else if (emailResponse.status === 403) {
          throw new Error('SendGrid API key not authorized or sending domain not verified')
        } else if (emailResponse.status === 400) {
          throw new Error('Invalid SendGrid payload or sender email. Verify the `from` address is allowed.')
        }
      } else {
        if (emailResponse.status === 401) {
          throw new Error('Invalid Resend API key - please check email service configuration')
        } else if (emailResponse.status === 403) {
          throw new Error('Domain not verified - please verify your Resend sending domain')
        } else if (emailResponse.status === 422) {
          throw new Error('Invalid email format or domain')
        }
      }
      throw new Error(`Email service error: ${emailResponse.status} - ${errorText}`)
    }

    if (sendgridApiKey) {
      console.log('✅ Email sent successfully via SendGrid')
    } else {
      console.log('✅ Email sent successfully via Resend')
    }

    // Return success
    res.status(200).json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon!'
    })

  } catch (error) {
    console.error('❌ Error processing contact form:', error)

    // Return more specific error messages
    let errorMessage = 'Failed to process contact form. Please try again later.'

    if (error.message.includes('API key') || error.message.includes('Invalid SendGrid API key')) {
      errorMessage = 'Email service configuration error. Please contact the administrator.'
    } else if (error.message.includes('SendGrid API key not authorized') || error.message.includes('sender email')) {
      errorMessage = 'Email service setup error. Please contact the administrator.'
    } else if (error.message.includes('Domain not verified')) {
      errorMessage = 'Email service setup incomplete. Please contact the administrator.'
    } else if (error.message.includes('Invalid email format')) {
      errorMessage = 'Invalid email format. Please check your email address.'
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message
    })
  }
}
