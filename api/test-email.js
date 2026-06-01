import sgMail from '@sendgrid/mail'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    console.log('🧪 Email test endpoint called')

    const sendgridApiKey = process.env.SENDGRID_API_KEY

    if (!sendgridApiKey) {
      console.error('❌ SENDGRID_API_KEY not configured')
      return res.status(500).json({
        error: 'SendGrid not configured',
        message: 'SENDGRID_API_KEY environment variable is not set'
      })
    }

    const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@walk4health.co.nz'
    const sendgridFromName = process.env.SENDGRID_FROM_NAME || 'Walk4Health Website'
    const sendgridKeyLooksValid = typeof sendgridApiKey === 'string' && sendgridApiKey.startsWith('SG.')

    console.log('🔍 SendGrid key check:', {
      hasSendgridKey: !!sendgridApiKey,
      sendgridKeyLooksValid
    })

    if (!sendgridKeyLooksValid) {
      console.error('❌ SENDGRID_API_KEY does not look like a SendGrid key')
      return res.status(500).json({
        error: 'SendGrid API key appears invalid',
        message: 'SENDGRID_API_KEY must begin with SG.'
      })
    }

    // Validate SendGrid API key directly before sending
    const validationResponse = await fetch('https://api.sendgrid.com/v3/user/account', {
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`
      }
    })

    const validationBody = await validationResponse.text()
    console.log('🔍 SendGrid key validation status:', validationResponse.status)
    if (!validationResponse.ok) {
      console.error('❌ SendGrid key validation failed:', validationBody)
      return res.status(500).json({
        error: 'SendGrid API key validation failed',
        status: validationResponse.status,
        details: validationBody
      })
    }

    sgMail.setApiKey(sendgridApiKey)

    console.log('📧 Sending test email via SendGrid...')

    // Send test email
    const msg = {
      to: process.env.TEST_EMAIL_RECIPIENT || 'admin@walk4health.co.nz',
      from: { email: sendgridFromEmail, name: sendgridFromName },
      subject: '[Walk4Health] Test Email - SendGrid API',
      html: `
        <h2>🧪 Walk4Health Email System Test</h2>
        <p>This is a test email from the Walk4Health website.</p>
        <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
        <p><strong>Service:</strong> SendGrid Official API</p>
        <p>If you received this email, the SendGrid email system is working correctly.</p>
      `
    }

    const result = await sgMail.send(msg)

    console.log('✅ Test email sent successfully via SendGrid')
    console.log('📨 SendGrid Response:', { statusCode: result?.[0]?.statusCode })

    res.status(200).json({
      success: true,
      message: 'Test email sent successfully via SendGrid',
      timestamp: new Date().toISOString(),
      recipient: msg.to,
      statusCode: result?.[0]?.statusCode || 202
    })

  } catch (error) {
    console.error('❌ Email test endpoint error:', error)
    res.status(500).json({
      error: 'Email test failed',
      message: error.message,
      details: error.response?.body || error.toString()
    })
  }
}
