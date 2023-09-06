interface ApiVersion {
  major: number;
  minor: number;
  fix: number;
}

const API_VERSION = process.env.API_MINIMAL_SUPPORTED_VERSION?.split('.');
const MAJOR = Number(API_VERSION ? API_VERSION[0] : 1);
const MINOR = Number(API_VERSION ? API_VERSION[1] : 0);
const FIX = Number(API_VERSION ? API_VERSION[2] : 0);

export const SUPPORTED_VERSIONS: ApiVersion[] = [
  {major: MAJOR, minor: MINOR, fix: FIX}
];

export const VERSION_FORMAT_REGEX = /^(\*|\d+(\.\d+){0,2}(\.\*)?)$/;
