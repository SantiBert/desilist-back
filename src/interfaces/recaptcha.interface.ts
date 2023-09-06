export interface recaptchaResponse {
  success: true | false;
  challenge_ts: Date; // timestamp of the challenge load (ISO format yyyy-MM-dd'T'HH:mm:ssZZ)
  hostname: string; // the hostname of the site where the reCAPTCHA was solved
  'error-codes': string[]; // optional
  score?: number; // the score for this request (0.0 - 1.0) ONLY V3
  action?: string; // the action name for this request (important to verify) ONLY V3
}
