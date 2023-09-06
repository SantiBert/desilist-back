/* eslint-disable @typescript-eslint/no-require-imports */
// eslint-disable-next-line @typescript-eslint/naming-convention
const {PrismaClient} = require('@prisma/client');
const csv = require('csvtojson');
const path = require('path');
// const fs = require('fs').promises;

const resourcesPath = `${path.resolve(__dirname)}/resources`;

const countryData = [
  {name: 'United States', alpha2: 'US', alpha3: 'USA', iso: '840'}
];

async function populate(): Promise<void> {
  const country = new PrismaClient().country;
  const state = new PrismaClient().state;
  const city = new PrismaClient().city;
  const zipcode = new PrismaClient().zipCode;

  await country.createMany({
    data: countryData,
    skipDuplicates: true
  });

  // create states
  const stateFilePath = `${resourcesPath}/USA/states.csv`;
  const jsonStatesArray = await csv().fromFile(stateFilePath);

  jsonStatesArray.forEach(function (element) {
    element.country_id = 1;
  });

  await state.createMany({
    data: jsonStatesArray,
    skipDuplicates: true
  });

  // // create cities
  const states = await state.findMany({select: {id: true, abbr: true}});
  const statesId = {};

  for (let i = 0; i < states.length; ++i) {
    statesId[states[i].abbr] = states[i].id;
  }

  const cityFilePath = `${resourcesPath}/USA/cities.csv`;
  const jsonCitiesArray = await csv().fromFile(cityFilePath);

  // // for convenience we storage the state abbr with state_id name
  jsonCitiesArray.forEach(function (element) {
    element.state_id = statesId[element.state_id];
  });
  const middleIndex = Math.ceil(jsonCitiesArray.length / 2);

  const firstHalf = jsonCitiesArray.splice(0, middleIndex);
  const secondHalf = jsonCitiesArray.splice(-middleIndex);

  await city.createMany({
    data: firstHalf,
    skipDuplicates: true
  });
  await city.createMany({
    data: secondHalf,
    skipDuplicates: true
  });

  //create zipcodes
  const cities = await city.findMany({
    select: {id: true, name: true, state: {select: {abbr: true}}}
  });
  const citiesId = {};

  // fix: bad performance
  for (let i = 0; i < states.length; ++i) {
    citiesId[states[i].abbr] = {};
    for (let j = 0; j < cities.length; ++j) {
      if (cities[j].state.abbr === states[i].abbr) {
        Object.assign(citiesId[states[i].abbr], {
          [cities[j].name]: cities[j].id
        });
      }
    }
  }

  const zipcodeFilePath = `${resourcesPath}/USA/zipcodes.csv`;
  const jsonZipcodesArray = await csv().fromFile(zipcodeFilePath);
  // for convenience we storage the city with city_id name
  // fix: bad performance
  for (let i = 0; i < jsonZipcodesArray.length; ++i) {
    const cityId =
      citiesId[jsonZipcodesArray[i].state][jsonZipcodesArray[i].city_id];
    jsonZipcodesArray[i].city_id = cityId;
  }

  for (let i = 0; i < jsonZipcodesArray.length; ++i) {
    delete jsonZipcodesArray[i].state;
  }

  await zipcode.createMany({
    data: jsonZipcodesArray,
    skipDuplicates: true
  });
}

populate()
  .then(() => {
    console.log('Registers inserted');
  })
  .catch(async (e) => {
    // uncomment next line to write error to log file
    // await fs.writeFile('polulate.log', e.message);
    throw e;
  });
