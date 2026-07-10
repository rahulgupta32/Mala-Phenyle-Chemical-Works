import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';
import { getAuthUser } from 'src/lib/auth';

// Helper to get or create a cart for the user
async function getOrCreateCart(userId: string) {
  let cart = await db.cart.findUnique({
    where: { userId },
  });
  if (!cart) {
    cart = await db.cart.create({
      data: { userId },
    });
  }
  return cart;
}

// 1. Fetch user's cart
export async function GET() {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ items: [] }); // Guest cart is handled client-side/in-memory
    }

    const cart = await db.cart.findUnique({
      where: { userId: session.userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({ items: cart ? cart.items : [] });
  } catch (error) {
    console.error('Fetch cart error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

// 2. Add item to cart
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, variantId, quantity } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json({ error: 'Product ID and valid quantity are required' }, { status: 400 });
    }

    // Check product and variant stock
    const product = await db.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    let availableStock = product.stock;
    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return NextResponse.json({ error: 'Product size variant not found' }, { status: 404 });
      }
      availableStock = variant.stock;
    }

    // Get or create user cart
    const cart = await getOrCreateCart(session.userId);

    // Check if item already in cart
    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
        },
      },
    });

    const targetQuantity = (existingItem?.quantity || 0) + quantity;

    // Enforce stock limit
    if (targetQuantity > availableStock) {
      return NextResponse.json(
        { error: `Cannot add. Requested quantity (${targetQuantity}) exceeds available stock (${availableStock}).` },
        { status: 400 }
      );
    }

    // Upsert cart item
    const cartItem = await db.cartItem.upsert({
      where: {
        cartId_productId_variantId: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
        },
      },
      update: { quantity: targetQuantity },
      create: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
      },
    });

    return NextResponse.json({ message: 'Item added to cart', item: cartItem });

  } catch (error) {
    console.error('Add cart item error:', error);
    return NextResponse.json({ error: 'Failed to add item to cart' }, { status: 500 });
  }
}

// 3. Update quantity or delete item
export async function PUT(request: NextRequest) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json({ error: 'Item ID and quantity are required' }, { status: 400 });
    }

    const cartItem = await db.cartItem.findUnique({
      where: { id: itemId },
      include: {
        product: true,
        variant: true,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });
    }

    // If quantity is 0, delete the item
    if (quantity <= 0) {
      await db.cartItem.delete({ where: { id: itemId } });
      return NextResponse.json({ message: 'Item removed from cart' });
    }

    // Enforce stock limit
    const availableStock = cartItem.variant ? cartItem.variant.stock : cartItem.product.stock;
    if (quantity > availableStock) {
      return NextResponse.json(
        { error: `Cannot update. Requested quantity (${quantity}) exceeds available stock (${availableStock}).` },
        { status: 400 }
      );
    }

    // Update quantity
    const updated = await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    return NextResponse.json({ message: 'Cart updated', item: updated });

  } catch (error) {
    console.error('Update cart item error:', error);
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

// 4. Remove item
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAuthUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    const cart = await db.cart.findUnique({
      where: { userId: session.userId },
    });

    if (!cart) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    if (itemId) {
      // Remove specific item
      await db.cartItem.delete({
        where: { id: itemId, cartId: cart.id },
      });
      return NextResponse.json({ message: 'Item removed from cart' });
    } else {
      // Clear entire cart
      await db.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
      return NextResponse.json({ message: 'Cart cleared successfully' });
    }

  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json({ error: 'Failed to remove item from cart' }, { status: 500 });
  }
}
