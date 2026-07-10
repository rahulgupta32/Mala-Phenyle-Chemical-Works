import { PrismaClient, Role, UserStatus, ProductStatus, InventoryLogType, PaymentMethod, PaymentStatus, OrderStatus, WholesaleAppStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Seed Shop Settings
  const settings = await prisma.shopSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      businessName: 'Mala Phenyle Chemical Works',
      businessAddress: 'Birgunj, Nepal',
      supportEmail: 'Sunilgupta335566@gmail.com',
      supportPhone: '+977 9855033186',
      supportPhoneAlternative: '+977 9845034186',
      whatsappViber: '+977 9855033186',
      freeDeliveryThreshold: 2000.00,
      minWholesaleOrderAmount: 10000.00,
      announcementText: 'Welcome to Mala Phenyle Chemical Works! Standard delivery across Nepal. Free delivery for retail orders above Rs. 2,000!',
      codEnabled: true,
      esewaEnabled: false,
      khaltiEnabled: false,
      fonepayEnabled: false,
      facebookUrl: 'https://facebook.com/malaphenyle',
      instagramUrl: 'https://instagram.com/malaphenyle',
    },
  });
  console.log('Seeded shop settings');

  // 2. Hash passwords
  const adminEmail = process.env.SEED_SUPERADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || 'admin@malachemicals.com';
  const adminPassword = process.env.SEED_SUPERADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD || 'SuperSecureAdminPassword123!';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const hashedUserPassword = await bcrypt.hash('Password123!', 10);

  // 3. Seed Users
  // Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: hashedAdminPassword,
    },
    create: {
      email: adminEmail,
      name: 'Mala Chem Owner (Super Admin)',
      password: hashedAdminPassword,
      role: Role.SUPERADMIN,
      phone: '+977 9855033186',
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`Seeded Super Admin user: ${superAdmin.email}`);

  // Regular Customer
  const customer = await prisma.user.upsert({
    where: { email: 'customer@malachemicals.com' },
    update: {},
    create: {
      email: 'customer@malachemicals.com',
      name: 'Ram Bahadur',
      password: hashedUserPassword,
      role: Role.CUSTOMER,
      phone: '+977 9800000001',
      status: UserStatus.ACTIVE,
      addresses: {
        create: [
          {
            name: 'Ram Bahadur',
            mobile: '+977 9800000001',
            province: 'Madhesh Province',
            district: 'Parsa',
            municipality: 'Birgunj Metropolitan City',
            ward: '8',
            street: 'Maisthan Tole',
            landmark: 'Near Maisthan Temple',
            isDefault: true,
          }
        ]
      }
    },
  });
  console.log(`Seeded standard customer: ${customer.email}`);

  // Delivery Staff
  const deliveryStaff = await prisma.user.upsert({
    where: { email: 'delivery@malachemicals.com' },
    update: {},
    create: {
      email: 'delivery@malachemicals.com',
      name: 'Shyam Sundar',
      password: hashedUserPassword,
      role: Role.DELIVERY,
      phone: '+977 9800000002',
      status: UserStatus.ACTIVE,
    },
  });
  console.log(`Seeded delivery staff: ${deliveryStaff.email}`);

  // Approved Wholesale Customer
  const wholesaleApproved = await prisma.user.upsert({
    where: { email: 'wholesale_approved@company.com' },
    update: {},
    create: {
      email: 'wholesale_approved@company.com',
      name: 'Hari Distributor',
      password: hashedUserPassword,
      role: Role.WHOLESALE,
      phone: '+977 9800000003',
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          companyName: 'Hari Cleaning Supplies Pvt. Ltd.',
          panNumber: '601234567',
          approvedForWholesale: true,
          minOrderValue: 10000.00,
        }
      },
      addresses: {
        create: [
          {
            name: 'Hari Distributor Warehouse',
            mobile: '+977 9800000003',
            province: 'Bagmati Province',
            district: 'Kathmandu',
            municipality: 'Kathmandu Metropolitan City',
            ward: '14',
            street: 'Kuleshwor Road',
            landmark: 'Near Nabil Bank',
            isDefault: true,
          }
        ]
      }
    },
  });
  console.log(`Seeded approved wholesaler: ${wholesaleApproved.email}`);

  // Pending Wholesale Customer
  const wholesalePending = await prisma.user.upsert({
    where: { email: 'wholesale_pending@company.com' },
    update: {},
    create: {
      email: 'wholesale_pending@company.com',
      name: 'Krishna Kirana Store',
      password: hashedUserPassword,
      role: Role.CUSTOMER, // role is CUSTOMER until admin approves application
      phone: '+977 9800000004',
      status: UserStatus.ACTIVE,
      profile: {
        create: {
          companyName: 'Krishna Kirana Store',
          panNumber: '609876543',
          approvedForWholesale: false,
        }
      },
      wholesaleApplications: {
        create: {
          companyName: 'Krishna Kirana Store',
          panNumber: '609876543',
          businessType: 'Retailer',
          status: WholesaleAppStatus.PENDING,
          adminNotes: 'Awaiting registration document validation.',
        }
      }
    },
  });
  console.log(`Seeded pending wholesaler: ${wholesalePending.email}`);

  // 4. Seed Categories
  const categoriesData = [
    { name: 'Phenyle', slug: 'phenyle', description: 'Strong white and black phenyle disinfectants' },
    { name: 'Toilet Cleaner', slug: 'toilet-cleaner', description: 'Acidic scaling and stain removal toilet cleaners' },
    { name: 'Liquid Soap', slug: 'liquid-soap', description: 'Fragrant liquid soaps for handwash' },
    { name: 'Detergent', slug: 'detergent', description: 'Washing powders and liquid detergents' },
    { name: 'Floor Cleaner', slug: 'floor-cleaner', description: 'Aromatic cleaning solutions for all floor types' },
    { name: 'Bathroom Cleaner', slug: 'bathroom-cleaner', description: 'Hard water stain and scum removers' },
    { name: 'Dishwash', slug: 'dishwash', description: 'High grease-cutting dishwashing liquids' },
    { name: 'Soap', slug: 'soap', description: 'Hygienic and toilet soaps' },
    { name: 'Industrial Cleaning Products', slug: 'industrial-cleaning', description: 'Heavy duty chemicals for commercial cleaning' },
    { name: 'Bulk Supplies', slug: 'bulk-supplies', description: 'Large quantities and concentrate solutions' }
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        status: true,
      },
    });
    categoriesMap[cat.slug] = createdCat.id;
  }
  console.log('Seeded product categories');

  // 5. Seed Products & Variants
  const productsData = [
    {
      name: 'Mala Premium White Phenyle',
      slug: 'mala-premium-white-phenyle',
      description: 'Mala Premium White Phenyle is formulated with high-quality pine oil, producing a dense milky-white emulsion when diluted. It disinfects thoroughly, kills 99.9% of germs, and leaves a pleasant pine fragrance. Best suited for household floors, hospitals, schools, and offices.',
      shortDescription: 'Premium germicidal Pine-oil based white disinfectant.',
      categorySlug: 'phenyle',
      sku: 'MALA-WPH-001',
      retailPrice: 150.00,
      wholesalePrice: 110.00,
      weightVolume: '1L',
      usageInstructions: 'Shake well before use. Mix 1 part of Mala White Phenyle with 40-50 parts of clean water (approx. 20ml in a bucket). Mop the floor surface gently. Do not mix with acid.',
      safetyInstructions: 'For external use only. Keep out of reach of children. Avoid contact with eyes. In case of accidental contact, flush eyes with plenty of water and seek medical advice.',
      ingredients: 'Pine Oil, Emulsifiers, Water, Stabilizers',
      variants: [
        { name: '1 Liter Bottle', sku: 'MALA-WPH-1L', retailPrice: 150.00, wholesalePrice: 110.00, stock: 100 },
        { name: '5 Liter Can', sku: 'MALA-WPH-5L', retailPrice: 650.00, wholesalePrice: 500.00, stock: 50 },
        { name: 'Carton (12x1L Bottles)', sku: 'MALA-WPH-CRT', retailPrice: 1600.00, wholesalePrice: 1250.00, stock: 20 },
      ]
    },
    {
      name: 'Mala Strong Black Phenyle',
      slug: 'mala-strong-black-phenyle',
      description: 'Mala Strong Black Phenyle is a powerful coal-tar based disinfectant fluid. It exhibits strong germicidal action and kills stubborn pathogens. Ideal for drains, toilets, public rest areas, animal shelters, and industrial yards. It provides long-lasting hygiene protection.',
      shortDescription: 'Industrial-grade coal-tar based black disinfectant.',
      categorySlug: 'phenyle',
      sku: 'MALA-BPH-002',
      retailPrice: 180.00,
      wholesalePrice: 130.00,
      weightVolume: '1L',
      usageInstructions: 'Mix 1 part of Mala Black Phenyle with 50-100 parts of water. Pour directly into drains, toilets, or use as a floor wash.',
      safetyInstructions: 'Poisonous. Dangerous if swallowed. Wear protective gloves when handling concentrate. Store in dark cool place away from foodstuff.',
      ingredients: 'Coal Tar Creosote Oil, Castor Oil Soap, Water',
      variants: [
        { name: '1 Liter Bottle', sku: 'MALA-BPH-1L', retailPrice: 180.00, wholesalePrice: 130.00, stock: 120 },
        { name: '5 Liter Can', sku: 'MALA-BPH-5L', retailPrice: 800.00, wholesalePrice: 600.00, stock: 40 },
      ]
    },
    {
      name: 'Mala Ultra Toilet Cleaner',
      slug: 'mala-ultra-toilet-cleaner',
      description: 'Mala Ultra Toilet Cleaner is an advanced thick formula that clings to the toilet bowl surface. It effectively removes tough yellow scale, rust spots, organic stains, and hard water rings. Contains disinfecting agents to leave the toilet hygienic and smelling fresh.',
      shortDescription: 'Thick active-formula stain-remover toilet cleaner.',
      categorySlug: 'toilet-cleaner',
      sku: 'MALA-TCL-003',
      retailPrice: 95.00,
      wholesalePrice: 75.00,
      weightVolume: '500ml',
      usageInstructions: 'Press sides of cap and turn counterclockwise. Squeeze liquid under the rim and around the bowl. Leave for 20 minutes, brush lightly, and flush.',
      safetyInstructions: 'Corrosive. Contains hydrochloric acid. Avoid skin and eye contact. Do not inhale fumes. Do not mix with bleach or other cleaning agents.',
      ingredients: 'Hydrochloric Acid 10.5% w/v, Cationic Surfactants, Fragrance, Color',
      variants: [
        { name: '500ml Bottle', sku: 'MALA-TCL-500M', retailPrice: 95.00, wholesalePrice: 75.00, stock: 180 },
        { name: '1 Liter Bottle', sku: 'MALA-TCL-1L', retailPrice: 175.00, wholesalePrice: 140.00, stock: 100 },
      ]
    },
    {
      name: 'Mala Lemon Fresh Handwash',
      slug: 'mala-lemon-fresh-handwash',
      description: 'Mala Lemon Fresh Handwash is a gentle, pH-balanced liquid hand soap. Fortified with glycerin and natural lemon extract, it cleanses dirt and grease while keeping skin soft and hydrated. Protects hands from germs and leaves a refreshing citrus scent.',
      shortDescription: 'Gentle, pH-balanced sanitizing liquid hand soap.',
      categorySlug: 'liquid-soap',
      sku: 'MALA-LSO-004',
      retailPrice: 140.00,
      wholesalePrice: 100.00,
      weightVolume: '1L',
      usageInstructions: 'Apply a small pump on wet hands. Rub thoroughly for 20 seconds to form rich lather, cover fingernails and wrists, then rinse clean with water.',
      safetyInstructions: 'For external use only. If swallowed accidentally, drink milk and seek medical advice. Discontinue use if irritation occurs.',
      ingredients: 'Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Citric Acid, Lemon extract',
      variants: [
        { name: '1 Liter Refill', sku: 'MALA-LSO-1L', retailPrice: 140.00, wholesalePrice: 100.00, stock: 90 },
        { name: '5 Liter Can', sku: 'MALA-LSO-5L', retailPrice: 600.00, wholesalePrice: 450.00, stock: 35 },
      ]
    },
    {
      name: 'Mala Super Clean Detergent Powder',
      slug: 'mala-super-clean-detergent-powder',
      description: 'Mala Super Clean Detergent Powder is engineered with advanced oxygen bleach and active enzymes. It penetrates fabric fibers to lift stubborn food, dirt, oil, and sweat stains. Protects whites and colors. Performs exceptionally well in both bucket washing and semi-automatic machines.',
      shortDescription: 'Active enzyme stain-removing washing powder.',
      categorySlug: 'detergent',
      sku: 'MALA-DET-005',
      retailPrice: 130.00,
      wholesalePrice: 95.00,
      weightVolume: '1kg',
      usageInstructions: 'For hand washing, dissolve 1 scoop (approx 40g) in half a bucket of water. Soak clothes for 30 minutes, wash, and rinse. Use 2 scoops for machine washes.',
      safetyInstructions: 'Do not ingest. Keep away from eyes. Wash hands after use. Keep out of damp environments to prevent clumping.',
      ingredients: 'Linear Alkylbenzene Sulfonate, Sodium Carbonate, Zeolite, Optical Brighteners, Enzymes',
      variants: [
        { name: '1 kg Pack', sku: 'MALA-DET-1K', retailPrice: 130.00, wholesalePrice: 95.00, stock: 250 },
        { name: '5 kg Bulk Pack', sku: 'MALA-DET-5K', retailPrice: 600.00, wholesalePrice: 450.00, stock: 80 },
      ]
    },
    {
      name: 'Mala Citrus Floor Cleaner',
      slug: 'mala-citrus-floor-cleaner',
      description: 'Mala Citrus Floor Cleaner is a versatile, no-rinse formula suitable for marble, granite, ceramic tiles, and wood. It lifts grease and footprints effortlessly, dries streak-free, and neutralizes odors with a fresh orange-citrus scent.',
      shortDescription: 'All-surface streak-free fragrant floor cleaner.',
      categorySlug: 'floor-cleaner',
      sku: 'MALA-FCL-006',
      retailPrice: 120.00,
      wholesalePrice: 90.00,
      weightVolume: '1L',
      usageInstructions: 'Mix 1 capful (approx. 15ml) in half a bucket of water (4L). Mop area as usual. No rinsing required.',
      safetyInstructions: 'Avoid direct eye contact. Do not swallow. Keep away from pets while wet.',
      ingredients: 'Non-ionic Surfactants, Fragrance, Solubilizers, Color',
      variants: [
        { name: '1 Liter Bottle', sku: 'MALA-FCL-1L', retailPrice: 120.00, wholesalePrice: 90.00, stock: 150 },
        { name: '5 Liter Can', sku: 'MALA-FCL-5L', retailPrice: 500.00, wholesalePrice: 380.00, stock: 60 },
      ]
    }
  ];

  for (const prod of productsData) {
    const categoryId = categoriesMap[prod.categorySlug];
    if (!categoryId) continue;

    // Create product
    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        shortDescription: prod.shortDescription,
        categoryId: categoryId,
        retailPrice: prod.retailPrice,
        wholesalePrice: prod.wholesalePrice,
        sku: prod.sku,
        weightVolume: prod.weightVolume,
        usageInstructions: prod.usageInstructions,
        safetyInstructions: prod.safetyInstructions,
        ingredients: prod.ingredients,
        status: ProductStatus.ACTIVE,
        stock: prod.variants.reduce((acc, v) => acc + v.stock, 0),
        images: {
          create: [
            {
              url: `/uploads/products/${prod.slug}.jpg`,
              isFeatured: true
            }
          ]
        }
      }
    });

    console.log(`Seeded Product: ${createdProduct.name}`);

    // Create variants & stock logs
    for (const v of prod.variants) {
      const createdVariant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
          productId: createdProduct.id,
          name: v.name,
          sku: v.sku,
          retailPrice: v.retailPrice,
          wholesalePrice: v.wholesalePrice,
          stock: v.stock,
        }
      });

      // Write inventory log for initial seeding
      await prisma.inventoryLog.create({
        data: {
          productId: createdProduct.id,
          variantId: createdVariant.id,
          quantity: v.stock,
          type: InventoryLogType.IN,
          notes: 'Initial inventory seeding.',
        }
      });
    }
  }

  // 6. Seed Delivery Zones
  const existingZonesCount = await prisma.deliveryZone.count();
  if (existingZonesCount === 0) {
    const zones = [
      { name: 'Birgunj Metropolitan Area', province: 'Madhesh Province', district: 'Parsa', deliveryFee: 50.00, freeDeliveryMinAmount: 1000.00 },
      { name: 'Kathmandu Valley', province: 'Bagmati Province', district: 'Kathmandu', deliveryFee: 120.00, freeDeliveryMinAmount: 2500.00 },
      { name: 'Lalitpur City Area', province: 'Bagmati Province', district: 'Lalitpur', deliveryFee: 120.00, freeDeliveryMinAmount: 2500.00 },
      { name: 'Bhaktapur Area', province: 'Bagmati Province', district: 'Bhaktapur', deliveryFee: 150.00, freeDeliveryMinAmount: 3000.00 },
      { name: 'Pokhara Valley', province: 'Gandaki Province', district: 'Kaski', deliveryFee: 180.00, freeDeliveryMinAmount: 3000.00 },
      { name: 'Eastern Districts Delivery', province: 'Koshi Province', district: 'Morang', deliveryFee: 200.00, freeDeliveryMinAmount: 4000.00 },
      { name: 'Western Terai Delivery', province: 'Lumbini Province', district: 'Rupandehi', deliveryFee: 200.00, freeDeliveryMinAmount: 4000.00 },
    ];

    for (const z of zones) {
      await prisma.deliveryZone.create({
        data: z
      });
    }
    console.log('Seeded delivery zones');
  } else {
    console.log('Delivery zones already seeded, skipping...');
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
