import {VERSION_FORMAT_REGEX} from '@/constants/apiVersion';
import {invalidVersionFormatException} from '@/errors/generics.erros';

export const checkVersionFormat = (version: string): void => {
  if (!VERSION_FORMAT_REGEX.test(version)) {
    throw invalidVersionFormatException('Invalid version format');
  }
};
