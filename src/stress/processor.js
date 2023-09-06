const {faker} = require('@faker-js/faker');

function generateSignupData(requestParams, ctx, ee, next) {
  ctx.vars['full_name'] = faker.name.findName();
  ctx.vars['phone_number'] = faker.phone.phoneNumber('+5411########');
  ctx.vars['country'] = faker.address.country();
  ctx.vars['zip_code'] = faker.address.zipCode();
  ctx.vars['city'] = faker.address.city();
  ctx.vars['state'] = faker.address.state();
  ctx.vars['photo'] = null;
  ctx.vars['bio'] = null;
  ctx.vars['email'] = `${Date.now()}${Math.random()}@gmail.com`;
  ctx.vars['password'] = faker.internet.password(10);

  return next();
}

module.exports = {
  generateSignupData
};
