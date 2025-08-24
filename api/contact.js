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

    // For now, we'll just log the email details since we don't have an email service configured
    // In production, you would integrate with a service like SendGrid, Mailgun, or Resend
    console.log('📧 Contact Form Submission:')
    console.log('📧 To:', inquiryEmail)
    console.log('📧 Subject:', `${subjectPrefix} ${subject}`)
    console.log('📧 From:', `${name} <${email}>`)
    console.log('📧 Message:', message)
    console.log('📧 Timestamp:', new Date().toISOString())

    // TODO: Integrate with email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // await sgMail.send({
    //   to: inquiryEmail,
    //   from: 'noreply@walk4health.co.nz',
    //   subject: `${subjectPrefix} ${subject}`,
    //   text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    //   html: `<h3>New Contact Form Submission</h3><p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Subject:</strong> ${subject}</p><p><strong>Message:</strong></p><p>${message.replace(/\n/g, '<br>')}</p>`
    // })

    // Return success (even though we're just logging for now)
    res.status(200).json({ 
      success: true, 
      message: 'Contact form submitted successfully',
      note: 'Email functionality is currently in development mode. Your message has been logged.'
    })

  } catch (error) {
    console.error('Error processing contact form:', error)
    res.status(500).json({ error: 'Failed to process contact form' })
  }
}
