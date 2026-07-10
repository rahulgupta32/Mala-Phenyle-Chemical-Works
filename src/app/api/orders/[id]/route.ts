import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';
import { getAuthUser } from 'src/lib/auth';
import { OrderStatus, PaymentStatus, DeliveryStatus, InventoryLogType } from '@prisma/client';

// 1. Get single order details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthUser();
    
    // Support guest checking via query parameters (phone number & order number)
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('orderNumber');
    const phone = searchParams.get('phone');

    const order = await db.order.findUnique({
      where: { id },
      include: {
        address: true,
        items: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
            variant: true,
          },
        },
        deliveryAssignments: {
          include: {
            deliveryStaff: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Access control checks
    let isAuthorized = false;

    // Admin / Super Admin always authorized
    if (session && (session.role === 'ADMIN' || session.role === 'SUPERADMIN')) {
      isAuthorized = true;
    }
    // Delivery staff assigned to this order authorized
    else if (session && session.role === 'DELIVERY') {
      const assigned = order.deliveryAssignments.some((da) => da.deliveryStaffId === session.userId);
      if (assigned) isAuthorized = true;
    }
    // Registered owner authorized
    else if (session && order.userId === session.userId) {
      isAuthorized = true;
    }
    // Guest verification match (Order Number + Phone)
    else if (orderNumber && phone) {
      const matchOrderNum = order.orderNumber === orderNumber;
      const matchPhone = order.guestPhone === phone || order.address.mobile === phone;
      if (matchOrderNum && matchPhone) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized to view this order' }, { status: 401 });
    }

    return NextResponse.json(order);

  } catch (error) {
    console.error('Fetch order detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

// 2. Update order (Status, Payment, Delivery assignment, Tracking notes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getAuthUser();
    
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const isAdmin = session.role === 'ADMIN' || session.role === 'SUPERADMIN';
    const isDelivery = session.role === 'DELIVERY';
    const isCustomer = session.role === 'CUSTOMER' || session.role === 'WHOLESALE';

    if (!isAdmin && !isDelivery && !isCustomer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      orderStatus,
      paymentStatus,
      trackingNote,
      deliveryStaffId,
      deliveryNotes,
    } = body;

    if (isCustomer && orderStatus !== OrderStatus.CANCELLED) {
      return NextResponse.json({ error: 'Customers can only request order cancellation' }, { status: 403 });
    }

    // Execute updates in a database transaction
    const updatedOrder = await db.$transaction(async (tx) => {
      // Fetch current order state inside the transaction to prevent concurrent race conditions
      const txOrder = await tx.order.findUnique({
        where: { id },
        include: {
          items: true,
          deliveryAssignments: true,
        },
      });

      if (!txOrder) {
        throw new Error('Order not found');
      }

      // Check Customer ownership & state validation
      if (isCustomer && !isAdmin) {
        if (txOrder.userId !== session.userId) {
          throw new Error('You do not own this order');
        }
        if (txOrder.orderStatus !== OrderStatus.PENDING && txOrder.orderStatus !== OrderStatus.CONFIRMED) {
          throw new Error('Order can only be cancelled while pending or confirmed');
        }
      }

      // Delivery staff can only update status if assigned to this order, and cannot change payments/assignments
      if (isDelivery && !isAdmin) {
        const isAssigned = txOrder.deliveryAssignments.some((da) => da.deliveryStaffId === session.userId);
        if (!isAssigned) {
          throw new Error('You are not assigned to this order');
        }

        // Delivery staff can only update orderStatus (to limited statuses) and trackingNote
        const allowedStatuses: OrderStatus[] = [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.RETURNED, OrderStatus.CANCELLED];
        if (orderStatus && !allowedStatuses.includes(orderStatus as OrderStatus)) {
          throw new Error('Delivery staff cannot set this order status');
        }
      }

      const updateData: any = {};

      if (orderStatus) {
        updateData.orderStatus = orderStatus as OrderStatus;
      }
      if (paymentStatus && isAdmin) {
        updateData.paymentStatus = paymentStatus as PaymentStatus;
      }
      if (trackingNote) {
        updateData.trackingNote = trackingNote;
      }

      // A. Handles Cancellation Inventory Restoration
      if (orderStatus === OrderStatus.CANCELLED && txOrder.orderStatus !== OrderStatus.CANCELLED) {
        // Only restore if the order has not been marked delivered or returned
        if (txOrder.orderStatus !== OrderStatus.DELIVERED && txOrder.orderStatus !== OrderStatus.RETURNED) {
          for (const item of txOrder.items) {
            if (item.variantId) {
              // Restore variant stock
              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { increment: item.quantity } },
              });

              // Log inventory change
              await tx.inventoryLog.create({
                data: {
                  productId: item.productId,
                  variantId: item.variantId,
                  quantity: item.quantity,
                  type: InventoryLogType.RESTORED,
                  notes: `Restored stock from cancelled order: ${txOrder.orderNumber}`,
                  adminId: session.userId,
                },
              });

              // Update product aggregated stock
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });
            } else {
              // Restore base product stock
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } },
              });

              // Log inventory change
              await tx.inventoryLog.create({
                data: {
                  productId: item.productId,
                  quantity: item.quantity,
                  type: InventoryLogType.RESTORED,
                  notes: `Restored stock from cancelled order: ${txOrder.orderNumber}`,
                  adminId: session.userId,
                },
              });
            }
          }
          
          updateData.trackingNote = trackingNote || 'Order cancelled. Inventory restored.';
        }
      }

      // B. Handles Delivery Assignments (Admin only)
      if (deliveryStaffId && isAdmin) {
        // Check if delivery staff exists
        const staff = await tx.user.findUnique({
          where: { id: deliveryStaffId, role: 'DELIVERY' },
        });

        if (!staff) {
          throw new Error('Selected delivery staff user not found');
        }

        // Upsert delivery assignment
        const existingAssignment = txOrder.deliveryAssignments[0];
        if (existingAssignment) {
          await tx.deliveryAssignment.update({
            where: { id: existingAssignment.id },
            data: {
              deliveryStaffId,
              status: DeliveryStatus.ASSIGNED,
              notes: deliveryNotes || 'Assigned to new delivery staff',
            },
          });
        } else {
          await tx.deliveryAssignment.create({
            data: {
              orderId: txOrder.id,
              deliveryStaffId,
              status: DeliveryStatus.ASSIGNED,
              notes: deliveryNotes || 'Assigned to delivery staff',
            },
          });
        }
        
        updateData.trackingNote = `Order assigned to delivery staff: ${staff.name}`;
      }

      // C. Handle Delivery Notes from Delivery Staff
      if (isDelivery && deliveryNotes) {
        const assignment = await tx.deliveryAssignment.findFirst({
          where: {
            orderId: txOrder.id,
            deliveryStaffId: session.userId,
          },
        });
        if (assignment) {
          await tx.deliveryAssignment.update({
            where: { id: assignment.id },
            data: {
              notes: deliveryNotes,
              status: orderStatus === OrderStatus.DELIVERED ? DeliveryStatus.DELIVERED : 
                      orderStatus === OrderStatus.CANCELLED ? DeliveryStatus.FAILED : DeliveryStatus.ASSIGNED,
            },
          });
        }
      }

      // Update Order
      const finalOrder = await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          address: true,
          items: true,
        },
      });

      return finalOrder;
    });

    // Write Admin Activity Log
    if (isAdmin) {
      await db.adminActivityLog.create({
        data: {
          adminId: session.userId,
          action: 'UPDATE_ORDER',
          details: `Updated order ${updatedOrder.orderNumber} status to ${orderStatus || updatedOrder.orderStatus}`,
        },
      });
    }

    return NextResponse.json({
      message: 'Order updated successfully',
      order: updatedOrder,
    });

  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order details' }, { status: 500 });
  }
}
