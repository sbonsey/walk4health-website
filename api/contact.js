export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    const { name, email, subject, message } = req.body
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get email configuration
    const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
    const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
    
    if (!redisUrl || !redisToken) {
      console.error('Redis environment variables not set')
      return res.status(500).json({ error: 'Email configuration not available' })
    }

    // Get email config from Redis
    const configResponse = await fetch(`${redisUrl}/get/walk4health:email-config`, {
      headers: {
        'Authorization': `Bearer ${redisToken}`
      }
    })
    
    let inquiryEmail = 'admin@walk4health.co.nz'
    let subjectPrefix = '[Walk4Health]'
    
    if (configResponse.ok) {
      const configResult = await configResponse.json()
      if (configResult.result) {
        const config = JSON.parse(configResult.result)
        inquiryEmail = config.inquiryEmail || inquiryEmail
        subjectPrefix = config.subjectPrefix || subjectPrefix
      }
    }

    // Check if Vercel Send API key is configured
    const sendApiKey = process.env.SENDGRID_API_KEY
    if (!sendApiKey) {
      console.error('Vercel Send API key not configured')
      return res.status(500).json({ error: 'Email service not configured' })
    }

    // Send email using Vercel Send
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'noreply@walk4health.co.nz',
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

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('Vercel Send API error:', emailResponse.status, errorText)
      throw new Error(`Email service error: ${emailResponse.status}`)
    }

    const emailResult = await emailResponse.json()
    console.log('📧 Email sent successfully:', emailResult)

    // Return success
    res.status(200).json({ 
      success: true, 
      message: 'Contact form submitted successfully. We will get back to you soon!'
    })

  } catch (error) {
    console.error('Error processing contact form:', error)
    res.status(500).json({ error: 'Failed to process contact form. Please try again later.' })
  }
}
