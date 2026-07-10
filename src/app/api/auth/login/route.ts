import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';
import { LoginSchema } from 'src/lib/validation';
import { comparePassword, setAuthCookie } from 'src/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate inputs
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Email and password are required', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        profile: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Your account has been suspended. Please contact customer support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create session cookie
    const sessionUser = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    await setAuthCookie(sessionUser);

    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        approvedForWholesale: user.profile?.approvedForWholesale || false,
      },
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during login' },
      { status: 500 }
    );
  }
}
