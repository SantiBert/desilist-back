//import {PrismaClient} from '@prisma/client';
const {PrismaClient, Prisma} = require('@prisma/client');
const fs = require('fs').promises;

const roleData = [{name: 'Admin'}, {name: 'User'}, {name: 'Guest'}];

const permData = [
  {name: 'Console', description: 'Console access for admins', action: 'ALL'},
  {name: 'View', description: 'View publications', action: 'READ'},
  {name: 'Post', description: 'Post publications', action: 'WRITE'},
  {name: 'Modify', description: 'Edit publications', action: 'EDIT'},
  {name: 'Remove', description: 'Delete publications', action: 'DELETE'}
];

const permRoleData = [
  {permission_id: 1, role_id: 1},
  {permission_id: 2, role_id: 2},
  {permission_id: 3, role_id: 2},
  {permission_id: 4, role_id: 2},
  {permission_id: 5, role_id: 2},
  {permission_id: 2, role_id: 3}
];

const statusData = [
  {name: 'ACTIVE'},
  {name: 'INACTIVE'},
  {name: 'PENDING_VERIFICATION'},
  {name: 'DISABLED'},
  {name: 'BLOCKED'}
];

const categoryData = [
  {name: 'Community'},
  {name: 'Entertainment'},
  {name: 'Retail Jobs'},
  {name: 'Professional Jobs'},
  {name: 'Personal Services'},
  {name: 'Professional Services'},
  {name: 'Items For Sale'},
  {name: 'Real State'}
];

const subCategoryData = [
  {category_id: 1, name: 'Restaurants & Grocery Stores'},
  {category_id: 1, name: 'Rideshared'},
  {category_id: 1, name: 'Community & Events'},
  {category_id: 2, name: 'Party Supplies & Vendors'},
  {category_id: 2, name: 'Music & Dance'},
  {category_id: 2, name: 'Actors & Models'},
  {category_id: 3, name: 'Transportation & Delivery'},
  {category_id: 3, name: 'C-Store & Restaurants'},
  {category_id: 3, name: 'Hotel & Motel'},
  {category_id: 3, name: 'Construction & Home Repair'},
  {category_id: 4, name: 'Admin/Office'},
  {category_id: 4, name: 'Technology/Software/IT'},
  {category_id: 4, name: 'Sales & Marketing'},
  {category_id: 5, name: 'Nanny & Elderly Care'},
  {category_id: 5, name: 'Tutors & Translators'},
  {category_id: 5, name: 'Cleaning & Cooking'},
  {category_id: 6, name: 'Lawyers'},
  {category_id: 6, name: 'CPA & Insurance Agents'},
  {category_id: 6, name: 'Doctors & Dental'},
  {category_id: 6, name: 'Travel Agents'},
  {category_id: 7, name: 'Personal Items & Clothes'},
  {category_id: 7, name: 'Home Goods & Furniture'},
  {category_id: 8, name: 'Real Estate & Mortage Agents'},
  {category_id: 8, name: 'Biz For Sale'},
  {category_id: 8, name: 'For Rent & Roomates'},
  {category_id: 8, name: 'Homes For Sale'}
];

const listingStatusData = [
  {name: 'ACTIVE'},
  {name: 'INACTIVE'},
  {name: 'DRAFT'},
  {name: 'FLAGGED'},
  {name: 'RE POST'}
];

const basicPricingData = [
  {name: '14 days package', duration: 14},
  {name: '30 days package', duration: 30},
  {name: '60 days package', duration: 60},
  {name: '90 days package', duration: 90}
];

const promotePricingData = [
  {name: '14 days package', duration: 14},
  {name: '30 days package', duration: 30},
  {name: '60 days package', duration: 60},
  {name: '90 days package', duration: 90}
];

const listingFlagReportReasonData = [
  {name: 'It\'s suspicious or spam', description: ''},
  {name: 'It displays sensitive photos or videos', description: ''},
  {name: 'It\'s abusive or harmful', description: ''},
  {name: 'Other', description: ''},
];

const notificationMessageData = [
  {title: 'You have a new Message', message: '$userName has sent you a message.', description: '', vars: 'userName'},
  {title: 'Your listing has been flagged', message: 'One of your listings has been flagged as not appropiate, click to find out more.', description: ''},
  {title: 'Your listing is about to expire', message: 'Update your listing to keep it active!', description: ''},
  {title: 'Your promoted listing is about to expire', message: 'Update your listing to keep it active!', description: ''},
  {title: 'Your listing has been edited', message: 'We made some changes on your listing, click to see more!', description: ''},
  {title: 'Complete your account information', message: 'Complete your profile to improve your engagement with future clients and vendors.', description: ''},
  {title: 'Your listing was promoted!', message: 'We promote one of your listings!', description: ''}
]

async function populate() {
  const role = new PrismaClient().role;
  const perm = new PrismaClient().permission;
  const permRole = new PrismaClient().permissionInRole;
  const status = new PrismaClient().status;
  const category = new PrismaClient().category;
  const subCategory = new PrismaClient().subcategory;
  const listingStatus = new PrismaClient().listingStatus;
  const basicPricing = new PrismaClient().basicPricingPackage;
  const promotePricing = new PrismaClient().promotePricingPackage;
  const subcategoryPricing = new PrismaClient().subcategoryPricing;
  const listingFlagReportReason = new PrismaClient().listingFlagReportReason;
  const notificationMessage = new PrismaClient().notificationMessage;

  await role.createMany({
    data: roleData,
    skipDuplicates: true
  });

  await perm.createMany({
    data: permData,
    skipDuplicates: true
  });

  await permRole.createMany({
    data: permRoleData,
    skipDuplicates: true
  });

  await status.createMany({
    data: statusData,
    skipDuplicates: true
  });

  await category.createMany({
    data: categoryData,
    skipDuplicates: true
  });

  await subCategory.createMany({
    data: subCategoryData,
    skipDuplicates: true
  });

  await listingStatus.createMany({
    data: listingStatusData,
    skipDuplicates: true
  });

  await basicPricing.createMany({
    data: basicPricingData,
    skipDuplicates: true
  });

  await promotePricing.createMany({
    data: promotePricingData,
    skipDuplicates: true
  });

  // create subcategory pricing
  const subc = await subCategory.findMany();
  const bpric = await basicPricing.findMany();
  const ppric = await promotePricing.findMany();
  const subcPric = [];

  for (let i = 0; i < subc.length; ++i) {
    for (let j = 0; j < bpric.length; ++j) {
      subcPric.push({
        subcategory_id: subc[i].id,
        basic_pricing_id: bpric[j].id,
        promote_pricing_id: ppric[j].id,
        basic_per_day: 0,
        promote_per_day: 0
      });
    }
  }

  await subcategoryPricing.createMany({
    data: subcPric,
    skipDuplicates: true
  });

  await listingFlagReportReason.createMany({
    data: listingFlagReportReasonData,
    skipDuplicates: true
  });

  await notificationMessage.createMany({
    data: notificationMessageData,
    skipDuplicates: true
  });
}

populate()
  .then(() => {
    console.log('Registers inserted');
  })
  .catch(async (e) => {
    await fs.writeFile('polulate.log', e.message);
    throw e;
  });
