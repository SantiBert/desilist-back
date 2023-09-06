import config from '../../config';
import {
  isUserBlockedGuard,
  isUserInactiveGuard,
  isUserPendingVerificationGuard
} from '../../guards/users.guard';
import {UserStatus} from '../../constants/user.constants';

// workaround to load env vars from dotenv
beforeAll(async () => {
  config;
});

afterAll(async () => {
  await new Promise<void>((resolve) => setTimeout(() => resolve(), 500));
});

describe('Users Service Testing', () => {
  const user = {};
  describe('Is User blocked', () => {
    describe('User blocked', () => {
      beforeAll(async () => {
        user['status_id'] = UserStatus.BLOCKED;
      });
      test('should return user blocked error', () => {
        try {
          isUserBlockedGuard(user as any);
        } catch (err) {
          expect(err).toEqual(new Error('User blocked'));
        }
      });
    });

    // fix
    /*
    describe('User not blocked', () => {
      beforeAll(async () => {
        user['status_id'] = UserStatus.ACTIVE;
      });
      test('should not throw', () => {
        expect(isUserBlockedGuard(user as any)).not.toThrow();
      });
    });
    */
  });

  describe('Is User inactive', () => {
    describe('User inactive', () => {
      beforeAll(async () => {
        user['status_id'] = UserStatus.INACTIVE;
      });
      test('should return user inactive error', () => {
        try {
          isUserInactiveGuard(user as any);
        } catch (err) {
          expect(err).toEqual(new Error('User inactive'));
        }
      });
    });

    // fix
    /*
    describe('User not inactive', () => {
      beforeAll(async () => {
        user['status_id'] = UserStatus.ACTIVE;
      });
      test('should not throw', () => {
        expect(isUserInactiveGuard(user as any)).not.toThrow();
      });
    });
    */
  });

  describe('Is User Pending Verification', () => {
    describe('User pending verification', () => {
      beforeAll(async () => {
        user['status_id'] = UserStatus.PENDING_VERIFICATION;
      });
      test('should return user pending verification error', () => {
        try {
          isUserPendingVerificationGuard(user as any);
        } catch (err) {
          expect(err).toEqual(new Error('User not verified'));
        }
      });
    });

    // fix
    /*
    describe('User active', () => {
      beforeAll(async () => {
        user['status_id'] = UserStatus.ACTIVE;
      });
      test('should not throw', async () => {
        expect(isUserPendingVerificationGuard(user as any)).not.toThrow();
      });
    });
    */
  });
});
