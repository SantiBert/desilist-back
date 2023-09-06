//import {PrismaClient} from '@prisma/client';
const {PrismaClient} = require('@prisma/client');
const {faker} = require('@faker-js/faker');

const N_REGISTERS = 10000;

async function stress() {
  const users = new PrismaClient().user;
  const locations = new PrismaClient().location;
  const passwords = new PrismaClient().password;

  let fakedUsers = [];

  for (let i = 0; i < N_REGISTERS; ++i) {
    fakedUsers.push(genUser());
  }

  const start = Date.now();

  const nCreatedUsers = await users.createMany({
    data: fakedUsers,
    skipDuplicates: true
  });
  console.log('users inserted');

  const createdUsers = await users.findMany({select: {id: true}});
  console.log('users retrieved');

  let fakedPasswords = [];
  let fakedLocations = [];

  for (let i = 0; i < createdUsers.length; ++i) {
    fakedPasswords.push(genPassword(createdUsers[i].id));
    fakedLocations.push(genLocation(createdUsers[i].id));
  }

  await passwords.createMany({
    data: fakedPasswords
  });
  console.log('passwords inserted');

  await locations.createMany({
    data: fakedLocations
  });
  console.log('locations inserted');

  const end = Date.now();

  console.log(`Process duration (Create ${nCreatedUsers.count} users): ${(end - start) / 1000} seconds`);
}

function genUser() {
  return {
    full_name: faker.name.findName(),
    email: faker.internet.email(),
    alternative_email: null,
    phone_number: faker.phone.phoneNumber(),
    bio: null,
    role_id: 2,
    status_id: 1,
    photo: null
  };
}

function genLocation(userId) {
  return {
    country: faker.address.country(),
    zip_code: faker.address.zipCode(),
    city: faker.address.city(),
    state: faker.address.state(),
    user_id: userId
  };
}

function genPassword(userId) {
  return {
    hash: faker.internet.password(),
    work_factor: null,
    user_id: userId
  };
}

stress()
  .then(() => {
    console.log('Registers inserted');
  })
  .catch((e) => {
    throw e;
  });
