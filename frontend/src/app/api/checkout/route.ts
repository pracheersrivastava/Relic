import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

export async function POST(request: NextRequest) {
    try {
        // Initialize Stripe lazily to avoid build-time errors
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { error: 'Stripe is not configured' },
                { status: 500 }
            );
        }
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Get access token from request body
        const body = await request.json();
        const accessToken = body.accessToken;

        if (!accessToken) {
            return NextResponse.json(
                { error: 'Unauthorized - please login' },
                { status: 401 }
            );
        }

        // Fetch user's cart from backend
        const cartResponse = await fetch(`${API_BASE_URL}/cart`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });

        if (!cartResponse.ok) {
            return NextResponse.json(
                { error: 'Failed to fetch cart' },
                { status: 500 }
            );
        }

        const cartData = await cartResponse.json();
        const cart = cartData.data;

        if (!cart.items || cart.items.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        // Build line items for Stripe Checkout
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = cart.items.map((item: any) => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.courseId?.title || 'Course',
                    description: item.courseId?.description?.substring(0, 100) || 'Online course',
                    images: item.courseId?.thumbnail ? [item.courseId.thumbnail] : [],
                },
                unit_amount: Math.round((item.courseId?.price || item.price || 0) * 100), // Stripe uses cents
            },
            quantity: 1,
        }));

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${request.headers.get('origin')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${request.headers.get('origin')}/checkout/cancel`,
            metadata: {
                accessToken: accessToken, // Pass token to verify on success
            },
        });

        return NextResponse.json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
