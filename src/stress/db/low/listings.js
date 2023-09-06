//import {PrismaClient} from '@prisma/client';
const {PrismaClient} = require('@prisma/client');
const {faker} = require('@faker-js/faker');

const N_LISTINGS = 5;
const N_SUBCATEGORIES = 5;

async function stress() {
  const users = new PrismaClient().user;
  const subCategories = new PrismaClient().subcategory;
  const listings = new PrismaClient().listing;

  const createdUsers = await users.findMany({select: {id: true}});
  console.log('users retrieved');

  let fakedSubcategories = [];

  for (let i = 0; i < N_SUBCATEGORIES; ++i) {
    fakedSubcategories.push(genSubcategory());
  }
  console.log('subcategories created');

  await subCategories.createMany({data: fakedSubcategories});

  let fakedListings = [];

  for (let i = 0; i < createdUsers.length; ++i) {
    for (let j = 0; j < N_LISTINGS; ++j)
      fakedListings.push(genListing(createdUsers[i].id));
  }
  console.log('listings created');

  const start = Date.now();

  const nCreatedListings = await listings.createMany({
    data: fakedListings
  });
  console.log('listings inserted');

  const end = Date.now();

  console.log(`Process duration (Create ${nCreatedListings.count} listings): ${(end - start) / 1000} seconds`);
}

function genListing(userId) {
  return {
    title: faker.datatype.string(),
    description: faker.datatype.string(),
    images: [],
    price: faker.datatype.float({min: 100, max: 500}),
    location: {city: faker.address.city(), state: faker.address.state(), zip_code: faker.address.zipCode()},
    contact: {email: faker.internet.email(), phone: faker.phone.phoneNumber()},
    website: faker.internet.url(),
    subcategory_id: faker.datatype.number({min: 1, max: N_SUBCATEGORIES}),
    status_id: faker.datatype.number({min: 1, max: 4}),
    user_id: userId,
    custom_fields: {}
  };
}

function genSubcategory() {
  return {
    category_id: faker.datatype.number({min: 1, max: 8}),
    name: faker.datatype.string(20),
    description: faker.datatype.string(),
    icon: null,
    image: null,
    custom_fields: []
  };
}

stress()
  .then(() => {
    console.log('Registers inserted');
  })
  .catch((e) => {
    throw e;
  });
