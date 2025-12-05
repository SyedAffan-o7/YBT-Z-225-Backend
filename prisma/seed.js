const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const slugify = require("slugify");

const prisma = new PrismaClient();

// ================= CONFIGURATION =================
const TOTAL_CARS = 1000;
const TOTAL_EVENTS = 250;
const BATCH_SIZE = 50;

// ================= REAL DATA ASSETS =================

// 1. DESKTOP IMAGES (1920x1080)
const DESKTOP_IMAGES = [
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=1920&h=1080&q=80",
];

// 2. MOBILE IMAGES (1080x1920)
const MOBILE_IMAGES = [
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=1080&h=1920&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1080&h=1920&q=80",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1080&h=1920&q=80",
  "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=1080&h=1920&q=80",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1080&h=1920&q=80",
];

const EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&h=1080&q=80",
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1920&h=1080&q=80",
];

// 3. REMOTE VIDEOS (Google Storage - Under 10MB)
const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
];

const BRANDS = [
  "BMW",
  "Audi",
  "Mercedes-Benz",
  "Porsche",
  "Lamborghini",
  "Ferrari",
  "Toyota",
  "Honda",
  "Tata",
  "Mahindra",
];
const CITIES = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai"];

// Helper to pick random item
const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Helper to get subarray
const getRandomSubarray = (arr, size) => {
  const shuffled = arr.slice(0);
  let i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor(Math.random() * (i + 1));
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
};

async function main() {
  console.log("🌱 Starting Superfast Seed...");

  // 1. ADMIN USER
  const admin = await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {},
    create: {
      email: "admin@gmail.com",
      name: "Super Admin",
      role: "ADMIN",
      password: "hashed-password-here",
    },
  });
  console.log("✅ Admin Ready");

  // 2. CREATE DEALERS
  console.log("🏭 Seeding Dealers...");
  const dealerPromises = Array.from({ length: 10 }).map(() =>
    prisma.dealer.create({
      data: {
        name: faker.company.name() + " Motors",
        email: faker.internet.email(),
        city: getRandom(CITIES),
        phone: faker.phone.number(),
        isActive: true,
      },
    })
  );

  const dealers = [];
  for (const p of dealerPromises) {
    try {
      dealers.push(await p);
    } catch (e) {}
  }
  console.log(`✅ Created ${dealers.length} Dealers`);

  // 3. CREATE CATEGORIES
  const catNames = ["Music", "Tech", "Auto Expo", "Workshop", "Meetup"];
  const categories = [];
  for (const name of catNames) {
    const slug = slugify(name, { lower: true });
    const cat = await prisma.eventCategory.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    categories.push(cat);
  }
  console.log("✅ Categories Ready");

  // ====================================================
  //  SEEDING CARS
  // ====================================================
  console.log(`🚗 Generating ${TOTAL_CARS} Cars...`);

  let carBatch = [];
  for (let i = 0; i < TOTAL_CARS; i++) {
    const brand = getRandom(BRANDS);
    const model = faker.vehicle.model();
    const title = `${brand} ${model} ${faker.vehicle.type()}`;
    const price = parseFloat(
      faker.commerce.price({ min: 500000, max: 20000000 })
    );

    // Prepare Media
    const selectedDesktopImages = getRandomSubarray(
      DESKTOP_IMAGES,
      faker.number.int({ min: 3, max: 8 })
    );
    const selectedMobileImages = getRandomSubarray(
      MOBILE_IMAGES,
      faker.number.int({ min: 3, max: 8 })
    );

    // Videos: 30% chance
    const hasVideo = Math.random() > 0.7;
    const selectedVideos = hasVideo ? [getRandom(SAMPLE_VIDEOS)] : [];
    const selectedMobileVideos = hasVideo ? [getRandom(SAMPLE_VIDEOS)] : [];

    const carData = {
      title: title,
      description: faker.lorem.paragraph(),
      status: Math.random() > 0.8 ? "SOLD" : "AVAILABLE",
      sellingPrice: price,
      cutOffPrice: price * 1.2,
      ybtPrice: price,
      registrationYear: faker.number.int({ min: 2015, max: 2025 }),
      registrationNumber: faker.vehicle.vrm(),
      kmsDriven: faker.number.int({ min: 0, max: 80000 }),
      ownerCount: faker.number.int({ min: 1, max: 3 }),
      insurance: Math.random() > 0.5 ? "Comprehensive" : "Third Party",
      collectionType: "YBT",
      dealerId: getRandom(dealers).id,
      badges: Math.random() > 0.7 ? ["Trusted", "Verified"] : [],
      specs: ["Engine: V8", "0-100: 4s", "Torque: 500nm"],
      features: ["Sunroof", "Leather Seats", "Apple CarPlay", "360 Camera"],
      city: getRandom(CITIES),
      state: "Maharashtra",
      brand: brand,
      fuelType: getRandom(["PETROL", "DIESEL", "HYBRID", "ELECTRIC"]),
      transmission: getRandom(["AUTOMATIC", "MANUAL"]),

      // --- MAPPED TO PRISMA SCHEMA ---
      thumbnail: selectedDesktopImages[0],
      mobileThumbnail: selectedMobileImages[0],

      carImages: selectedDesktopImages, // Fixed field name
      carImagesMobile: selectedMobileImages, // Fixed field name
      videoUrls: selectedVideos, // Fixed field name
      videoUrlsMobile: selectedMobileVideos, // Fixed field name
    };

    carBatch.push(prisma.car.create({ data: carData }));

    if (carBatch.length >= BATCH_SIZE || i === TOTAL_CARS - 1) {
      await prisma.$transaction(carBatch);
      carBatch = [];
      process.stdout.write(`.`);
    }
  }
  console.log(`\n✅ ${TOTAL_CARS} Cars Seeded!`);

  // ====================================================
  //  SEEDING EVENTS
  // ====================================================
  console.log(`📅 Generating ${TOTAL_EVENTS} Events...`);

  let eventBatch = [];
  for (let i = 0; i < TOTAL_EVENTS; i++) {
    const title = faker.music.genre() + " Festival " + faker.location.city();
    const isUpcoming = Math.random() > 0.4;
    const startDate = isUpcoming
      ? faker.date.soon({ days: 90 })
      : faker.date.recent({ days: 360 });
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 6);
    const basePrice = parseFloat(faker.commerce.price({ min: 499, max: 5000 }));

    // Prepare Event Media
    const selectedEventImages = getRandomSubarray(EVENT_IMAGES, 3);
    // Reuse car mobile images for events just to have data, or use specific event mobile images if you have them
    const selectedEventMobileImages = getRandomSubarray(MOBILE_IMAGES, 3);
    const hasVideo = Math.random() > 0.7;
    const selectedVideos = hasVideo ? [getRandom(SAMPLE_VIDEOS)] : [];

    const eventData = {
      title: title,
      slug:
        slugify(title, { lower: true, strict: true }) +
        "-" +
        faker.string.alphanumeric(5),
      description: faker.lorem.paragraphs(2),
      type: "PUBLIC",
      status: "PUBLISHED",
      isFeatured: Math.random() > 0.9,
      location: `${faker.location.streetAddress()}, ${getRandom(CITIES)}`,
      startDate: startDate,
      endDate: endDate,
      creatorId: admin.id,
      categories: { connect: { id: getRandom(categories).id } },

      // --- MAPPED TO PRISMA SCHEMA ---
      thumbnail: selectedEventImages[0], // Schema has 'thumbnail', not 'primaryImage'
      mobileThumbnail: selectedEventMobileImages[0],
      imageUrls: selectedEventImages,
      imageUrlsMobile: selectedEventMobileImages,
      videoUrls: selectedVideos,
      videoUrlsMobile: selectedVideos, // Reusing same videos for mobile for now

      ticketTypes: {
        create: [
          {
            name: "Early Bird",
            price: basePrice,
            quantity: 50,
            quantitySold: faker.number.int({ min: 0, max: 50 }),
          },
          {
            name: "VIP",
            price: basePrice * 2.5,
            quantity: 20,
            quantitySold: faker.number.int({ min: 0, max: 10 }),
          },
        ],
      },
    };

    eventBatch.push(prisma.event.create({ data: eventData }));

    if (eventBatch.length >= BATCH_SIZE || i === TOTAL_EVENTS - 1) {
      await prisma.$transaction(eventBatch);
      eventBatch = [];
      process.stdout.write(`.`);
    }
  }
  console.log(`\n✅ ${TOTAL_EVENTS} Events Seeded!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
