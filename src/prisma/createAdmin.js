const {PrismaClient} = require('@prisma/client');
const {hash} = require('bcrypt');
const fs = require('fs');
const path = require('path');
const params = process.argv;

const mandatoryParams = ['full_name', 'email', 'password', 'zip_code'];
const credentialsPath = `${path.resolve(__dirname)}/creds/`;

async function createAdmin() {
  const users = new PrismaClient().user;
  const passwords = new PrismaClient().password;
  const locations = new PrismaClient().location;

  const admin = JSON.parse(fs.readFileSync(credentialsPath + params[2], {encoding: 'utf8'}));

  for (let i = 0; i < mandatoryParams.length; ++i) {
    if (admin[mandatoryParams[i]] === undefined) {
      throw new Error(`Param ${mandatoryParams[i]} missing`);
    }
  }

  const user = await users.findUnique({select: {id: true}, where: {email: admin.email}});
  if (user) {
    throw new Error(`User ${admin.email} already exists`);
  }

  const adminData = {
    full_name: admin.full_name,
    email: admin.email,
    role_id: 1,
    status_id: 1
  };

  const createdAdmin = await users.create({
    select: {id: true},
    data: adminData
  });

  await passwords.create({
    data:
    {
      user_id: createdAdmin.id,
      hash: await hash(admin.password, 10)
    }
  });

  await locations.create({
    data:
    {
      user_id: createdAdmin.id,
      zip_code: admin.zip_code,
      country: admin.country || null,
      city: admin.city || null,
      state: admin.state || null
    }
  });
}

createAdmin()
  .then(() => {
    console.log('Created');
  })
  .catch((e) => {
    throw e;
  });
