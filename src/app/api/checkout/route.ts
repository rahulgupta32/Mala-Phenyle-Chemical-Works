import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';
import { getAuthUser } from 'src/lib/auth';
import { CheckoutSchema } from 'src/lib/validation';
import { InventoryLogType, PaymentStatus, OrderStatus, PaymentMethod } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const session = await getAuthUser();

    // 1. Validate request body
    const parsed = CheckoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid checkout information', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const {
      isGuest,
      guestName,
      guestPhone,
      guestEmail,
      addressId,
      shippingAddress,
      paymentMethod,
      notes,
    } = parsed.data;

    // Guest vs Registered checkout checks
    if (isGuest && (!guestName || !guestPhone || !shippingAddress)) {
      return NextResponse.json({ error: 'Guest checkout requires name, phone, and shipping address' }, { status: 400 });
    }
    if (!isGuest && !session) {
      return NextResponse.json({ error: 'Authentication required for registered checkout' }, { status: 401 });
    }

    // 2. Fetch Shop Settings (for free delivery threshold)
    const settings = await db.shopSettings.findUnique({
      where: { id: 'default' },
    });
    const freeDeliveryThreshold = settings ? Number(settings.freeDeliveryThreshold) : 2000.00;

    // 3. Resolve Cart Items & validate inventory stock
    const itemsToProcess: Array<{
      productId: string;
      variantId: string | null;
      quantity: number;
      name: string;
      price: number;
    }> = [];

    if (!isGuest && session) {
      // Registered User: Retrieve from database cart
      const cart = await db.cart.findUnique({
        where: { userId: session.userId },
        include: {
          items: {
            include: {
              product: true,
              variant: true,
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
      }

      // Check wholesale approval status
      const userProfile = await db.customerProfile.findUnique({
        where: { userId: session.userId }
      });
      const isWholesaleApproved = session.role === 'WHOLESALE' && userProfile?.approvedForWholesale;

      for (const item of cart.items) {
        // Enforce Wholesale Minimum Order amount if wholesale role is active
        // Enforce base price selection (retail vs wholesale)
        let price = Number(item.product.retailPrice);
        if (isWholesaleApproved) {
          price = Number(item.product.wholesalePrice);
        } else if (item.product.discountedPrice) {
          price = Number(item.product.discountedPrice);
        }

        let variantName = '';
        if (item.variant) {
          price = isWholesaleApproved 
            ? Number(item.variant.wholesalePrice) 
            : (item.variant.discountedPrice ? Number(item.variant.discountedPrice) : Number(item.variant.retailPrice));
          variantName = ` (${item.variant.name})`;
        }

        itemsToProcess.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          name: `${item.product.name}${variantName}`,
          price,
        });
      }
    } else {
      // Guest User: Retrieve from body payload
      const guestItems = body.items; // Expects array of { productId, variantId, quantity }
      if (!guestItems || !Array.isArray(guestItems) || guestItems.length === 0) {
        return NextResponse.json({ error: 'Cart items are required for checkout' }, { status: 400 });
      }

      for (const item of guestItems) {
        const product = await db.product.findUnique({
          where: { id: item.productId },
          include: { variants: true },
        });

        if (!product) {
          return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
        }

        let price = product.discountedPrice ? Number(product.discountedPrice) : Number(product.retailPrice);
        let variantName = '';

        if (item.variantId) {
          const variant = product.variants.find((v) => v.id === item.variantId);
          if (!variant) {
            return NextResponse.json({ error: `Variant not found: ${item.variantId}` }, { status: 404 });
          }
          price = variant.discountedPrice ? Number(variant.discountedPrice) : Number(variant.retailPrice);
          variantName = ` (${variant.name})`;
        }

        itemsToProcess.push({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          name: `${product.name}${variantName}`,
          price,
        });
      }
    }

    // 4. Calculate Subtotal and validate stock levels
    let subtotal = 0;
    for (const item of itemsToProcess) {
      subtotal += item.price * item.quantity;

      // Validate stock levels
      if (item.variantId) {
        const variant = await db.productVariant.findUnique({
          where: { id: item.variantId },
        });
        if (!variant || variant.stock < item.quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for variant "${item.name}". Available: ${variant?.stock || 0}, Requested: ${item.quantity}` 
          }, { status: 400 });
        }
      } else {
        const product = await db.product.findUnique({
          where: { id: item.productId },
        });
        if (!product || product.stock < item.quantity) {
          return NextResponse.json({ 
            error: `Insufficient stock for product "${item.name}". Available: ${product?.stock || 0}, Requested: ${item.quantity}` 
          }, { status: 400 });
        }
      }
    }

    // 5. Enforce Wholesale minimum order amount
    if (!isGuest && session && session.role === 'WHOLESALE') {
      const minWholesaleVal = settings ? Number(settings.minWholesaleOrderAmount) : 10000.00;
      if (subtotal < minWholesaleVal) {
        return NextResponse.json({
          error: `Wholesale orders must meet the minimum order amount of Rs. ${minWholesaleVal.toLocaleString()}. Your subtotal is Rs. ${subtotal.toLocaleString()}.`
        }, { status: 400 });
      }
    }

    // 6. Calculate Delivery Charge based on address
    let destProvince = '';
    let destDistrict = '';
    
    if (isGuest && shippingAddress) {
      destProvince = shippingAddress.province;
      destDistrict = shippingAddress.district;
    } else if (!isGuest && session) {
      // Find address
      const addr = await db.address.findUnique({
        where: { id: addressId },
      });
      if (!addr) {
        return NextResponse.json({ error: 'Selected address not found' }, { status: 404 });
      }
      destProvince = addr.province;
      destDistrict = addr.district;
    }

    // Look up delivery zone by district/province
    const deliveryZone = await db.deliveryZone.findFirst({
      where: {
        OR: [
          { district: { equals: destDistrict, mode: 'insensitive' } },
          { province: { equals: destProvince, mode: 'insensitive' } },
        ],
      },
    });

    let deliveryCharge = deliveryZone ? Number(deliveryZone.deliveryFee) : 150.00; // default shipping
    
    // Apply free delivery logic
    if (subtotal >= freeDeliveryThreshold) {
      deliveryCharge = 0;
    }

    const discountAmount = 0.00; // Coupon discounts to be added in Phase 2
    const grandTotal = subtotal + deliveryCharge - discountAmount;

    // 7. Process Order Placement in Transaction (Deduct stock, create logs, clear cart, create order)
    const finalOrder = await db.$transaction(async (tx) => {
      // Create Address if guest or new address
      let targetAddressId = addressId;
      if (isGuest && shippingAddress) {
        const guestAddr = await tx.address.create({
          data: {
            name: shippingAddress.name,
            mobile: shippingAddress.mobile,
            province: shippingAddress.province,
            district: shippingAddress.district,
            municipality: shippingAddress.municipality,
            ward: shippingAddress.ward,
            street: shippingAddress.street,
            landmark: shippingAddress.landmark || null,
            googleMapsLink: shippingAddress.googleMapsLink || null,
          },
        });
        targetAddressId = guestAddr.id;
      }

      // Generate Order Number safely via YearlyOrderSequence row lock
      const currentYear = new Date().getFullYear();
      const seqRecord = await tx.yearlyOrderSequence.upsert({
        where: { year: currentYear },
        update: { sequence: { increment: 1 } },
        create: { year: currentYear, sequence: 1 },
      });

      const nextSeq = seqRecord.sequence;
      const orderNumber = `MALA-${currentYear}-${String(nextSeq).padStart(6, '0')}`;

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: isGuest ? null : session?.userId,
          addressId: targetAddressId!,
          totalAmount: subtotal,
          deliveryCharge,
          discountAmount,
          grandTotal,
          paymentMethod: paymentMethod as PaymentMethod,
          paymentStatus: paymentMethod === 'COD' ? PaymentStatus.PENDING : PaymentStatus.PENDING,
          orderStatus: OrderStatus.PENDING,
          notes,
          trackingNote: 'Order placed successfully. Awaiting confirmation.',
          guestName: isGuest ? guestName : null,
          guestPhone: isGuest ? guestPhone : null,
          guestEmail: isGuest ? guestEmail : null,
        },
      });

      // Create Order Items, Deduct stock & Write InventoryLogs
      for (const item of itemsToProcess) {
        await tx.orderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: item.price * item.quantity,
          },
        });

        // Deduct stock and log
        if (item.variantId) {
          // Variant stock update
          const variant = await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });

          // Write InventoryLog
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              variantId: item.variantId,
              quantity: -item.quantity,
              type: InventoryLogType.OUT,
              notes: `Stock deducted for order: ${orderNumber}`,
            },
          });

          // Update product aggregated stock
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });

        } else {
          // Base product stock update
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } },
          });

          // Write InventoryLog
          await tx.inventoryLog.create({
            data: {
              productId: item.productId,
              quantity: -item.quantity,
              type: InventoryLogType.OUT,
              notes: `Stock deducted for order: ${orderNumber}`,
            },
          });
        }
      }

      // Clear Cart for registered user
      if (!isGuest && session) {
        const userCart = await tx.cart.findUnique({
          where: { userId: session.userId },
        });
        if (userCart) {
          await tx.cartItem.deleteMany({
            where: { cartId: userCart.id },
          });
        }
      }

      return newOrder;
    });

    return NextResponse.json({
      message: 'Order placed successfully',
      orderNumber: finalOrder.orderNumber,
      orderId: finalOrder.id,
      grandTotal: finalOrder.grandTotal,
    }, { status: 201 });

  } catch (error) {
    console.error('Checkout placing order error:', error);
    return NextResponse.json({ error: 'Failed to process checkout and place order' }, { status: 500 });
  }
}
