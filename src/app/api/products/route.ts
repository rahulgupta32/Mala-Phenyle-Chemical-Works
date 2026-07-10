import { NextRequest, NextResponse } from 'next/server';
import { db } from 'src/lib/db';
import { getAuthUser } from 'src/lib/auth';
import { ProductStatus, InventoryLogType } from '@prisma/client';

// Helper to slugify product names
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

// 1. Get products (Public Catalog with filters)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const categorySlug = searchParams.get('category') || '';
    const status = searchParams.get('status') || ''; // 'ACTIVE', 'DRAFT', etc.
    const limit = Number(searchParams.get('limit')) || 24;
    const page = Number(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    // Build Prisma query filters
    const where: any = {};

    // Standard client storefront only sees ACTIVE products.
    // Admin dashboard can filter by status.
    const session = await getAuthUser();
    const isAdmin = session && (session.role === 'ADMIN' || session.role === 'SUPERADMIN');
    
    if (isAdmin && status) {
      if (status !== 'ALL') {
        where.status = status as ProductStatus;
      }
    } else {
      where.status = ProductStatus.ACTIVE;
    }

    // Search query filter (name, shortDescription)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { shortDescription: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Category filter
    if (categorySlug) {
      where.category = {
        slug: categorySlug,
      };
    }

    // Fetch total count and products
    const [total, products] = await Promise.all([
      db.product.count({ where }),
      db.product.findMany({
        where,
        include: {
          category: true,
          images: true,
          variants: {
            orderBy: { retailPrice: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// 2. Add product (Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getAuthUser();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPERADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      shortDescription,
      categoryId,
      retailPrice,
      wholesalePrice,
      discountedPrice,
      sku,
      barcode,
      stock,
      lowStockThreshold,
      status,
      weightVolume,
      usageInstructions,
      safetyInstructions,
      ingredients,
      imageUrl,
      variants, // Optional array of size variants
    } = body;

    if (!name || !description || !categoryId || !sku || retailPrice === undefined || wholesalePrice === undefined) {
      return NextResponse.json({ error: 'Missing required product fields' }, { status: 400 });
    }

    // Generate unique slug
    let slug = slugify(name);
    const existingSlug = await db.product.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    // Create the product
    const product = await db.product.create({
      data: {
        name,
        slug,
        description,
        shortDescription: shortDescription || '',
        categoryId,
        retailPrice: Number(retailPrice),
        wholesalePrice: Number(wholesalePrice),
        discountedPrice: discountedPrice ? Number(discountedPrice) : null,
        sku,
        barcode: barcode || null,
        stock: Number(stock || 0),
        lowStockThreshold: Number(lowStockThreshold || 5),
        status: status || ProductStatus.ACTIVE,
        weightVolume: weightVolume || '1L',
        usageInstructions,
        safetyInstructions,
        ingredients,
        images: imageUrl ? {
          create: [{ url: imageUrl, isFeatured: true }]
        } : undefined,
      },
      include: {
        images: true,
      }
    });

    // If variants are supplied, create them
    const createdVariants = [];
    if (variants && Array.isArray(variants) && variants.length > 0) {
      let totalStock = 0;
      for (const v of variants) {
        const variant = await db.productVariant.create({
          data: {
            productId: product.id,
            name: v.name,
            sku: v.sku,
            retailPrice: Number(v.retailPrice),
            wholesalePrice: Number(v.wholesalePrice),
            discountedPrice: v.discountedPrice ? Number(v.discountedPrice) : null,
            stock: Number(v.stock || 0),
          },
        });
        createdVariants.push(variant);
        totalStock += Number(v.stock || 0);

        // Log initial stock for variant
        if (Number(v.stock) > 0) {
          await db.inventoryLog.create({
            data: {
              productId: product.id,
              variantId: variant.id,
              quantity: Number(v.stock),
              type: InventoryLogType.IN,
              notes: `Initial seed inventory for variant: ${v.name}`,
              adminId: session.userId,
            },
          });
        }
      }

      // Update aggregated stock on main product
      await db.product.update({
        where: { id: product.id },
        data: { stock: totalStock },
      });
    } else {
      // Log initial stock for base product (no variants)
      if (Number(stock) > 0) {
        await db.inventoryLog.create({
          data: {
            productId: product.id,
            quantity: Number(stock),
            type: InventoryLogType.IN,
            notes: 'Initial seed inventory for base product',
            adminId: session.userId,
          },
        });
      }
    }

    // Log admin activity
    await db.adminActivityLog.create({
      data: {
        adminId: session.userId,
        action: 'CREATE_PRODUCT',
        details: `Created product "${name}" (SKU: ${sku})`,
      },
    });

    return NextResponse.json({
      message: 'Product created successfully',
      product: {
        ...product,
        variants: createdVariants,
      },
    }, { status: 201 });

  } catch (error: any) {
    console.error('Create product error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A product with this SKU or SKU variant already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
