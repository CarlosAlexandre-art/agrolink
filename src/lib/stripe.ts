import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const COMISSAO = 0.05 // 5% AgroLink
