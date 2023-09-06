//import {PrismaClient} from '@prisma/client';
const {PrismaClient} = require('@prisma/client');
const {hash} = require('bcrypt');
const {faker} = require('@faker-js/faker');

const categoryMultiplier = 3;
const nUsers = 10;
const listingsPerUser = 10;

async function populateFakeData() {
  const users = new PrismaClient().user;
  const passwords = new PrismaClient().password;
  const locations = new PrismaClient().location;
  const subCategories = new PrismaClient().subcategory;
  const listings = new PrismaClient().listing;

  const userData = [];

  for (let i = 0; i < nUsers; ++i) {
    userData.push({
      full_name: faker.name.findName(),
      phone_number: faker.phone.phoneNumber('+5411########'),
      email: faker.internet.email(),
      role_id: 2,
      status_id: 1
    });
  }

  await users.createMany({
    data: userData,
    skipDuplicates: true
  });

  const createdUsers = await users.findMany({select: {id: true}, where: {role_id: 2}});

  const passwordData = [];
  const locationData = [];
  for (let i = 0; i < createdUsers.length; ++i) {
    passwordData.push({
      user_id: createdUsers[i].id,
      hash: await hash('12345', 10)
    });
    locationData.push({
      user_id: createdUsers[i].id,
      country: faker.address.country(),
      zip_code: faker.address.zipCode(),
      city: faker.address.city(),
      state: faker.address.state()
    });
  }

  await passwords.createMany({
    data: passwordData,
    skipDuplicates: true
  });

  await locations.createMany({
    data: locationData,
    skipDuplicates: true
  });

  const createdSubCategories = await subCategories.findMany({select: {id: true}});

  const listingData = [];
  for (let i = 0; i < createdUsers.length; ++i) {
    for (let j = 0; j < listingsPerUser; ++j) {
      listingData.push({
        title: faker.random.word(),
        description: 'listing description',
        price: faker.datatype.float(),
        location: {
          country: faker.address.country(),
          zip_code: faker.address.zipCode(),
          city: faker.address.city(),
          state: faker.address.state()
        },
        contact: {
          phone_number: faker.phone.phoneNumber('+5411########'),
          email: faker.internet.email()
        },
        website: faker.internet.url(),
        status_id: faker.helpers.arrayElement([1,2,3,5]),
        user_id: createdUsers[i].id,
        subcategory_id: Math.floor(
          Math.random() * (
            (createdSubCategories[createdSubCategories.length - 1].id) - createdSubCategories[0].id) + 1
            + createdSubCategories[0].id
        )
      });
    }
  }

  await listings.createMany({
    data: listingData,
    skipDuplicates: true
  });
}

populateFakeData()
  .then(() => {
    console.log('Registers inserted');
  })
  .catch((e) => {
    throw e;
  });
