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

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY
    console.log('🔍 Email service check:', { 
      hasResendKey: !!resendApiKey,
      keySource: process.env.RESEND_API_KEY ? 'RESEND_API_KEY' : process.env.SENDGRID_API_KEY ? 'SENDGRID_API_KEY' : 'NONE'
    })
    
    if (!resendApiKey) {
      console.error('❌ Resend API key not configured')
      return res.status(500).json({ error: 'Email service not configured. Please contact the administrator.' })
    }

    // Send email using Resend
    console.log('📧 Sending email via Resend...')
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          // Using Resend's default verified domain for immediate functionality
          // Change to 'noreply@walk4health.org.nz' once domain verification is fully complete
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

    console.log('📧 Resend API response status:', emailResponse.status)
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text()
      console.error('❌ Resend API error:', emailResponse.status, errorText)
      
      // Provide more specific error messages
      if (emailResponse.status === 401) {
        throw new Error('Invalid API key - please check email service configuration')
      } else if (emailResponse.status === 403) {
        throw new Error('Domain not verified - please verify noreply@walk4health.co.nz with Resend')
      } else if (emailResponse.status === 422) {
        throw new Error('Invalid email format or domain')
      } else {
        throw new Error(`Email service error: ${emailResponse.status} - ${errorText}`)
      }
    }

    const emailResult = await emailResponse.json()
    console.log('✅ Email sent successfully:', emailResult)

    // Return success
    res.status(200).json({ 
      success: true, 
      message: 'Contact form submitted successfully. We will get back to you soon!'
    })

  } catch (error) {
    console.error('❌ Error processing contact form:', error)
    
    // Return more specific error messages
    let errorMessage = 'Failed to process contact form. Please try again later.'
    
    if (error.message.includes('API key')) {
      errorMessage = 'Email service configuration error. Please contact the administrator.'
    } else if (error.message.includes('Domain not verified')) {
      errorMessage = 'Email service setup incomplete. Please contact the administrator.'
    } else if (error.message.includes('Invalid email format')) {
      errorMessage = 'Invalid email format. Please check your email address.'
    }
    
    res.status(500).json({ error: errorMessage })
  }
}
