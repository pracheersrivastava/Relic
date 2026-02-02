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

        const { sessionId, accessToken } = await request.json();

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID is required' },
                { status: 400 }
            );
        }

        // Retrieve the session from Stripe
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status !== 'paid') {
            return NextResponse.json(
                { error: 'Payment not completed' },
                { status: 400 }
            );
        }

        // Get access token from request body or session metadata
        const token = accessToken || session.metadata?.accessToken;

        if (!token) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Call backend to create enrollments (using the pay endpoint)
        const enrollResponse = await fetch(`${API_BASE_URL}/cart/pay`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        // Check content type before parsing
        const contentType = enrollResponse.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await enrollResponse.text();

            // Check if it's "Cart is empty" error - means already processed
            if (text.includes('Cart is empty')) {
                return NextResponse.json({
                    success: true,
                    message: 'Payment already processed - you are enrolled!',
                });
            }

            console.error('Backend returned non-JSON:', text.substring(0, 200));
            return NextResponse.json(
                { error: 'Backend error - please try again' },
                { status: 500 }
            );
        }

        if (!enrollResponse.ok) {
            const errorData = await enrollResponse.json();
            return NextResponse.json(
                { error: errorData.message || 'Failed to create enrollments' },
                { status: 500 }
            );
        }

        const enrollData = await enrollResponse.json();

        return NextResponse.json({
            success: true,
            message: 'Payment confirmed and courses enrolled',
            order: enrollData.data,
        });
    } catch (error: any) {
        console.error('Confirm Payment Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to confirm payment' },
            { status: 500 }
        );
    }
}
