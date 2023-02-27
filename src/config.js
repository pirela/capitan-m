import dotenv from 'dotenv'
dotenv.config()

const config = {
  port: process.env.PORT || 4400,
  nodeEnv: process.env.NODE_ENV || 'development',
  secretApi: process.env.SECRET_API || 'SECRET_API_123_TEST',
  mpAccessToken: process.env.MP_ACCESS_TOKEN || '',
  emailUser: process.env.EMAIL_USER || '',
  emailDefTo: process.env.EMAIL_DEFT_TO || '',
  emailPass: process.env.EMAIL_PASS || '',
  emailAlias: process.env.EMAIL_ALIAS || ''
}

export default config
