import App from '@/app';
import AdminCategoriesRoute from '@/routes/admin/categories.route';
import AdminListingsRoute from '@/routes/admin/listings.route';
import AdminSubCategoriesRoute from '@/routes/admin/subCategories.route';
import AdminEventSubcategoryRoute from './routes/admin/eventSubCategories.route';
import AdminUsersRoute from '@/routes/admin/users.route';
import AdminBannersRoute from '@/routes/admin/banners.route';
import AdminListingPackagesRoute from './routes/admin/listingPackages.route';
import AuthRoute from '@routes/auth.route';
import AttendanceRoute from './routes/attendance.route';
import HealthRoute from '@/routes/health.route';
import UsersRoute from '@routes/users.route';
import validateEnv from '@utils/validateEnv';
import PublicRoute from './routes/public.route';
import CategoriesRoute from './routes/categories.route';
import SubCategoriesRoute from './routes/subCategories.route';
import SubcategoriesPricingRoute from './routes/subcategoriesPricing.route';
import ListingsRoute from './routes/listings.route';
import AdminDashboardRoute from './routes/admin/dashboard.route';
import PaymentsRoute from './routes/payments.route';
import CustomersRoute from './routes/customers.route';
import PaymentMethodsRoute from './routes/paymentMethods.route';
import LiveStreamingRoute from './routes/liveStreamings.route';
import EventPriceRoute from './routes/eventPrice.route';
import EventSubcategoryRoute from './routes/eventSubCategories.route';
import EventBookmarksRoute from './routes/eventBookmarks.route';
import TokensRoute from './routes/tokens.route';
import BookmarksRoute from './routes/bookmarks.route';
import NotificationsRoute from './routes/notifications.routes';
import ChatsRoute from './routes/chats.route';
import BannersRoute from './routes/banners.route';
import ListingPackagesRoute from './routes/listingPackages.route';
import PreferencesRoute from './routes/preferences.routes';
import ListingFlagReportReasonsRoute from './routes/listingFlagReportReasons.route';
import AdminListingFlagRoute from './routes/admin/listingsFlag.route';
import ListingFlagRoute from './routes/listingFlag.route';
import MediaRoute from './routes/media.route';
import DesilistTermsRoute from './routes/desilistTerms.route';
import EventsRoute from './routes/event.route';
import TimezoneRoute from './routes/timezones.route';
import AdminDesilistTermsRoute from './routes/admin/desilistTerms.route';
import EventPaymentsRoute from './routes/eventPayments.route';
import EventTicketsPaymentsRoute from './routes/eventTicketsPayment.route';
import LocationRoute from './routes/locations.route';
import EventTicketRoute from './routes/eventTicket.route';
import EventTicketTypeRoute from './routes/eventTicketType.route';
import EventManagement from './routes/eventManagement.route';
import AdminEventPendingRoute from './routes/admin/eventAppoval.route';
import AdminEventsRoute from './routes/admin/event.route';
import LandingRoute from './routes/landing.route';
import EventPendingRoute from './routes/eventAppoval.route';
validateEnv();

const app = new App([
  new AdminCategoriesRoute(),
  new AdminListingsRoute(),
  new AdminSubCategoriesRoute(),
  new AdminEventSubcategoryRoute(),
  new AdminUsersRoute(),
  new AdminListingPackagesRoute(),
  new AttendanceRoute(),
  new HealthRoute(),
  new UsersRoute(),
  new AuthRoute(),
  new PublicRoute(),
  new CategoriesRoute(),
  new SubCategoriesRoute(),
  new SubcategoriesPricingRoute(),
  new ListingsRoute(),
  new AdminDashboardRoute(),
  new PaymentsRoute(),
  new CustomersRoute(),
  new PaymentMethodsRoute(),
  new TokensRoute(),
  new BookmarksRoute(),
  new AdminBannersRoute(),
  new NotificationsRoute(),
  new ChatsRoute(),
  new BannersRoute(),
  new ListingPackagesRoute(),
  new PreferencesRoute(),
  new ListingFlagReportReasonsRoute(),
  new AdminListingFlagRoute(),
  new ListingFlagRoute(),
  new LiveStreamingRoute(),
  new MediaRoute(),
  new EventPriceRoute(),
  new EventSubcategoryRoute(),
  new EventBookmarksRoute(),
  new EventManagement(),
  new DesilistTermsRoute(),
  new TimezoneRoute(),
  new AdminDesilistTermsRoute(),
  new DesilistTermsRoute(),
  new EventPaymentsRoute(),
  new EventTicketsPaymentsRoute(),
  new LocationRoute(),
  new EventTicketRoute(),
  new EventTicketTypeRoute(),
  new AdminEventPendingRoute(),
  new AdminEventsRoute(),
  new EventsRoute(),
  new LandingRoute(),
  new EventPendingRoute()
]);

app.listen();
