import createMiddleware from 'next-intl/middleware';
import {routing} from './routing';

export default createMiddleware({
  ...routing,
  // Disable cookie-based locale detection to allow static rendering
  localeDetection: false
});

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(fr|en)/:path*']
};
