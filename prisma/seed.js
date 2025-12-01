// // const { PrismaClient } = require("@prisma/client");
// // const { faker } = require("@faker-js/faker");

// // const prisma = new PrismaClient();

// // const createSlug = (text) => {
// //   return text
// //     .toLowerCase()
// //     .replace(/ /g, "-")
// //     .replace(/[^\w-]+/g, "");
// // };

// // // --- Data Pools for Seeding ---
// // const badgePool = [
// //   "LOW_KMS",
// //   "PREMIUM",
// //   "RARE_FIND",
// //   "MINT_CONDITION",
// //   "CUSTOM_BUILD",
// //   "ONE_OWNER",
// // ];
// // const tuningStagePool = ["STAGE1", "STAGE2", "STAGE3"];
// // const collectionTypePool = ["YBT", "DESIGNER", "WORKSHOP", "TORQUE_TUNER"];

// // // --- Main Seeding Function ---
// // async function main() {
// //   console.log("🌱 Starting the comprehensive seeding process...");

// //   // 1. CLEAR DATABASE
// //   console.log("🗑️  Clearing previous data...");
// //   // await prisma.car.deleteMany({});
// //   // await prisma.workshop.deleteMany({});
// //   // await prisma.designer.deleteMany({});
// //   // await prisma.dealer.deleteMany({});

// //   // 2. SEED DEALERS
// //   console.log("🤵 Seeding Dealers...");
// //   const dealersToCreate = [];
// //   for (let i = 0; i < 5; i++) {
// //     const companyName = faker.company.name();
// //     dealersToCreate.push({
// //       name: `${companyName} Motors`,
// //       email: faker.internet.email({ firstName: companyName.split(" ")[0] }),
// //       phone: faker.phone.number(),
// //       address: faker.location.streetAddress(),
// //       city: faker.location.city(),
// //       state: faker.location.state(),
// //     });
// //   }
// //   await prisma.dealer.createMany({ data: dealersToCreate });
// //   const dealers = await prisma.dealer.findMany();
// //   const dealerIds = dealers.map((d) => d.id);
// //   console.log(`✅ Seeded ${dealers.length} dealers.`);

// //   // 3. SEED DESIGNERS
// //   console.log("🎨 Seeding Designers...");
// //   const designersToCreate = [];
// //   for (let i = 0; i < 3; i++) {
// //     const name = faker.person.fullName();
// //     designersToCreate.push({
// //       name: name,
// //       slug: createSlug(name),
// //       title: faker.person.jobTitle(),
// //       description: faker.lorem.paragraph(),
// //       image: faker.image.avatar(),
// //       stats: {
// //         projects: faker.number.int({ min: 10, max: 150 }),
// //         experience: faker.number.int({ min: 10, max: 25 }),
// //         awards: faker.number.int({ min: 5, max: 15 }),
// //       },
// //     });
// //   }
// //   await prisma.designer.createMany({ data: designersToCreate });
// //   const designers = await prisma.designer.findMany();
// //   const designerIds = designers.map((d) => d.id);
// //   console.log(`✅ Seeded ${designers.length} designers.`);

// //   // 4. SEED WORKSHOPS
// //   console.log("🔧 Seeding Workshops...");
// //   const workshopsToCreate = [];
// //   for (let i = 0; i < 4; i++) {
// //     const name = `${faker.company.name()} Auto Works`;
// //     workshopsToCreate.push({
// //       name: name,
// //       slug: createSlug(name),
// //       title: "Certified Performance Center",
// //       description: faker.lorem.paragraphs(2),
// //       image: faker.image.urlLoremFlickr({ category: "technics" }),
// //       stats: {
// //         projects: faker.number.int({ min: 10, max: 150 }),
// //         experience: faker.number.int({ min: 10, max: 25 }),
// //         specialists: faker.number.int({ min: 10, max: 150 }),
// //       },
// //     });
// //   }
// //   await prisma.workshop.createMany({ data: workshopsToCreate });
// //   const workshops = await prisma.workshop.findMany();
// //   const workshopIds = workshops.map((w) => w.id);
// //   console.log(`✅ Seeded ${workshops.length} workshops.`);

// //   // 5. SEED CARS
// //   console.log("\n🚗 Seeding Cars with consistent data...");
// //   const numberOfCars = 100;
// //   const carsToCreate = [];
// //   const carImagePool = [
// //     "https://images.unsplash.com/photo-1503376780353-7e6692767b70",
// //     "https://images.unsplash.com/photo-1502877338535-766e1452684a",
// //   ];

// //   for (let i = 0; i < numberOfCars; i++) {
// //     const brand = faker.vehicle.manufacturer();
// //     const model = faker.vehicle.model();
// //     const carImages = faker.helpers.arrayElements(carImagePool, {
// //       min: 2,
// //       max: 5,
// //     });

// //     // ✨ NEW: Logic to ensure collection data is consistent
// //     const collectionType = faker.helpers.arrayElement(collectionTypePool);
// //     let designerId = null;
// //     let workshopId = null;
// //     let tuningStage = null;

// //     switch (collectionType) {
// //       case "DESIGNER":
// //         designerId = faker.helpers.arrayElement(designerIds);
// //         break;
// //       case "WORKSHOP":
// //         workshopId = faker.helpers.arrayElement(workshopIds);
// //         break;
// //       case "TORQUE_TUNER":
// //         tuningStage = faker.helpers.arrayElement(tuningStagePool);
// //         break;
// //       // For 'YBT' and other types, all special fields remain null
// //     }

// //     const carData = {
// //       // --- Relations (now consistent) ---
// //       dealerId: faker.helpers.arrayElement(dealerIds),
// //       designerId,
// //       workshopId,

// //       // --- Core Info ---
// //       title: `${brand} ${model}`,
// //       description: faker.lorem.paragraph(),
// //       status: faker.helpers.arrayElement([
// //         "AVAILABLE",
// //         "SOLD",
// //         "PENDING",
// //         "RESERVED",
// //       ]),
// //       collectionType,

// //       // --- ✨ NEWLY ADDED FIELDS ✨ ---
// //       tuningStage,
// //       badges: faker.helpers.arrayElements(badgePool, { min: 0, max: 2 }),

// //       // --- Other fields... ---
// //       sellingPrice: parseFloat(
// //         faker.commerce.price({ min: 500000, max: 5000000 })
// //       ),
// //       cutOffPrice: parseFloat(
// //         faker.commerce.price({ min: 450000, max: 4800000 })
// //       ),
// //       ybtPrice: parseFloat(faker.commerce.price({ min: 480000, max: 4900000 })),
// //       registrationYear: faker.date.past({ years: 10 }).getFullYear(),
// //       registrationNumber: `${faker.location.state({
// //         abbreviated: true,
// //       })}${faker.string.numeric(2)}${faker.string
// //         .alpha(2)
// //         .toUpperCase()}${faker.string.numeric(4)}`,
// //       kmsDriven: faker.number.int({ min: 10000, max: 150000 }),
// //       brand,
// //       city: faker.location.city(),
// //       engine: `${faker.number.int({ min: 1000, max: 5000 })} cc`,
// //       thumbnail: carImages[0],
// //       carImages,
// //     };
// //     carsToCreate.push(carData);
// //   }

// //   await prisma.car.createMany({ data: carsToCreate });
// //   console.log(`✅ Seeded ${carsToCreate.length} cars.`);
// // }

// // // --- Execute the Main Function ---
// // main()
// //   .catch((e) => {
// //     console.error("💥 FAILED TO SEED DATABASE:", e);
// //     process.exit(1);
// //   })
// //   .finally(async () => {
// //     console.log("\n👋 Seeding finished. Disconnecting Prisma Client.");
// //     await prisma.$disconnect();
// //   });
// ///////////////////////////////////////////////////////////////////////////////////
// const { PrismaClient } = require("@prisma/client");
// const { faker } = require("@faker-js/faker");

// const prisma = new PrismaClient();

// // --- Data Pools for Seeding ---
// const badgePool = [
//   "LOW_KMS",
//   "RARE_FIND",
//   "MINT_CONDITION",
//   "CUSTOM_BUILD",
//   "ONE_OWNER",
// ];
// const bikeBrandPool = [
//   "Royal Enfield",
//   "Harley-Davidson",
//   "Ducati",
//   "BMW",
//   "Kawasaki",
//   "Yamaha",
// ];
// const bikeSpecPool = [
//   "Dual-Channel ABS",
//   "LED Lighting",
//   "Slipper Clutch",
//   "Ride-by-Wire",
//   "Quick Shifter",
// ];
// const bikeImagePool = [
//   "https://images.unsplash.com/photo-1558981403-c5f9899a28bc",
//   "https://images.unsplash.com/photo-1625043834839-a8a5a1907a3c",
// ];

// // --- Main Seeding Function ---
// async function main() {
//   console.log("🌱 Starting the additive seeding process for bikes...");

//   // This script is additive. To clear bike data first, uncomment the line below:
//   // await prisma.bike.deleteMany({});

//   // 1. ENSURE YBT DEALER EXISTS
//   // =============================================
//   console.log("🤵 Ensuring 'YBT Superbikes' dealer exists...");
//   const ybtDealerName = "YBT";
//   // ✨ MODIFICATION: Use upsert to create the specific YBT dealer if it doesn't exist
//   await prisma.dealer.upsert({
//     where: { name: ybtDealerName },
//     update: {},
//     create: {
//       name: ybtDealerName,
//       city: "Pune",
//       state: "Maharashtra",
//       email: "contact@ybt.com",
//       phone: faker.phone.number(),
//       address: faker.location.streetAddress(),
//     },
//   });

//   // 2. FETCH THE YBT DEALER ID
//   // =============================================
//   const ybtDealer = await prisma.dealer.findUnique({
//     where: { name: ybtDealerName },
//   });

//   if (!ybtDealer) {
//     console.error("💥 Could not find or create the YBT Dealer. Exiting.");
//     process.exit(1);
//   }
//   console.log(`✅ Found YBT Dealer (ID: ${ybtDealer.id}) to link bikes to.`);

//   // 3. SEED BIKES
//   // =============================================
//   console.log("\n🏍️  Seeding Bikes...");
//   const numberOfBikes = 50;
//   const bikesToCreate = [];

//   for (let i = 0; i < numberOfBikes; i++) {
//     const brand = faker.helpers.arrayElement(bikeBrandPool);
//     const model = faker.vehicle.model();
//     const bikeImages = faker.helpers.arrayElements(bikeImagePool, {
//       min: 1,
//       max: 3,
//     });

//     const bikeData = {
//       // ✨ MODIFICATION: Assign all bikes to the specific YBT Dealer ID
//       dealerId: ybtDealer.id,

//       // --- Core Info ---
//       title: `${brand} ${model}`,
//       description: faker.lorem.paragraph(),
//       status: faker.helpers.arrayElement(["AVAILABLE", "SOLD", "PENDING"]),
//       collectionType: "YBT",
//       brand,
//       bikeUSP: faker.lorem.sentence(),
//       ybtPrice: parseFloat(faker.commerce.price({ min: 80000, max: 1500000 })),
//       registrationYear: faker.date.past({ years: 8 }).getFullYear(),
//       registrationNumber: `MH${faker.string.numeric(2)}${faker.string
//         .alpha(2)
//         .toUpperCase()}${faker.string.numeric(4)}`,
//       kmsDriven: faker.number.int({ min: 5000, max: 90000 }),
//       badges: faker.helpers.arrayElements(badgePool, { min: 0, max: 2 }),
//       specs: faker.helpers.arrayElements(bikeSpecPool, { min: 1, max: 3 }),
//       engine: `${faker.number.int({ min: 150, max: 1200 })} cc`,
//       thumbnail: bikeImages[0],
//       bikeImages,
//     };
//     bikesToCreate.push(bikeData);
//   }

//   await prisma.bike.createMany({ data: bikesToCreate, skipDuplicates: true });
//   console.log(
//     `✅ Added ${numberOfBikes} new bikes to the database, all linked to YBT.`
//   );
// }

// // --- Execute the Main Function ---
// main()
//   .catch((e) => {
//     console.error("💥 FAILED TO SEED DATABASE:", e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     console.log("\n👋 Seeding finished. Disconnecting Prisma Client.");
//     await prisma.$disconnect();
//   });

// prisma/seed.js

const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");
const slugify = require("slugify");

const prisma = new PrismaClient();

// ================= CONFIGURATION =================
const TOTAL_CARS = 1000;
const TOTAL_EVENTS = 250;
const BATCH_SIZE = 50; // Prevents DB timeouts

// ================= REAL DATA ASSETS =================
// Using high-quality placeholder images that look like cars/events
const CAR_IMAGES = [
  "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=800&q=80",
];

const EVENT_IMAGES = [
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=800&q=80", // Concert
  "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=800&q=80", // Show
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80", // Crowd
  "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80", // Tech
];

const SAMPLE_VIDEOS = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
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

  // 2. CREATE DEALERS (Crucial for Cars)
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
  // Execute dealer creation
  // Note: Using Promise.all for small batches is fine
  const dealers = [];
  for (const p of dealerPromises) {
    try {
      dealers.push(await p);
    } catch (e) {}
  }
  console.log(`✅ Created ${dealers.length} Dealers`);

  // 3. CREATE CATEGORIES (Crucial for Events)
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
  //  SEEDING CARS (BATCHED)
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

    // Logic: 20% Sold, 80% Available
    const status = Math.random() > 0.8 ? "SOLD" : "AVAILABLE";

    const carData = {
      title: title,
      description: faker.lorem.paragraph(),
      status: status,
      sellingPrice: price,
      cutOffPrice: price * 1.2, // 20% higher MRP
      ybtPrice: price,
      registrationYear: faker.number.int({ min: 2015, max: 2025 }),
      registrationNumber: faker.vehicle.vrm(),
      kmsDriven: faker.number.int({ min: 0, max: 80000 }),
      ownerCount: faker.number.int({ min: 1, max: 3 }),
      insurance: Math.random() > 0.5 ? "Comprehensive" : "Third Party",
      collectionType: "YBT", // Default

      // Relations
      dealerId: getRandom(dealers).id,

      // Arrays
      badges: Math.random() > 0.7 ? ["Trusted", "Verified"] : [],
      specs: ["Engine: V8", "0-100: 4s", "Torque: 500nm"],
      features: ["Sunroof", "Leather Seats", "Apple CarPlay", "360 Camera"],

      // Filters
      city: getRandom(CITIES),
      state: "Maharashtra",
      brand: brand,
      fuelType: getRandom(["PETROL", "DIESEL", "HYBRID", "ELECTRIC"]),
      transmission: getRandom(["AUTOMATIC", "MANUAL"]),

      // Media
      thumbnail: getRandom(CAR_IMAGES),
      carImages: getRandomSubarray(CAR_IMAGES, 3), // Get 3 random images
      videoUrls: Math.random() > 0.8 ? [SAMPLE_VIDEOS[0]] : [],
    };

    carBatch.push(prisma.car.create({ data: carData }));

    // Execute Batch
    if (carBatch.length >= BATCH_SIZE || i === TOTAL_CARS - 1) {
      await prisma.$transaction(carBatch);
      carBatch = [];
      process.stdout.write(`.`); // Progress indicator
    }
  }
  console.log(`\n✅ ${TOTAL_CARS} Cars Seeded!`);

  // ====================================================
  //  SEEDING EVENTS (BATCHED)
  // ====================================================
  console.log(`📅 Generating ${TOTAL_EVENTS} Events...`);

  let eventBatch = [];
  for (let i = 0; i < TOTAL_EVENTS; i++) {
    const title = faker.music.genre() + " Festival " + faker.location.city();

    // Logic: 40% Past Events, 60% Upcoming (To test "Smart Sort")
    const isUpcoming = Math.random() > 0.4;
    const startDate = isUpcoming
      ? faker.date.soon({ days: 90 }) // Next 90 days
      : faker.date.recent({ days: 360 }); // Last year

    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 6); // Lasts 6 hours

    // Create tickets logic
    const basePrice = parseFloat(faker.commerce.price({ min: 499, max: 5000 }));

    const eventData = {
      title: title,
      slug:
        slugify(title, { lower: true, strict: true }) +
        "-" +
        faker.string.alphanumeric(5),
      description: faker.lorem.paragraphs(2),
      type: "PUBLIC",
      status: "PUBLISHED",
      isFeatured: Math.random() > 0.9, // 10% featured
      location: `${faker.location.streetAddress()}, ${getRandom(CITIES)}`,
      startDate: startDate,
      endDate: endDate,

      // Images
      primaryImage: getRandom(EVENT_IMAGES),
      imageUrls: getRandomSubarray(EVENT_IMAGES, 3),

      creatorId: admin.id,

      // Connect Random Category
      categories: {
        connect: { id: getRandom(categories).id },
      },

      // Create Ticket Types inline
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
