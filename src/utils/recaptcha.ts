import config from '@/config';

import axios from 'axios';
import {recaptchaException} from '@/errors/recaptcha.error';

export default class reCaptcha {
  private version = config.recaptcha.version;
  private secretKey = config.recaptcha.private;
  private validScore = config.recaptcha.score | 0.5;

  public validate = async (token: string): Promise<boolean> => {
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';

    try {
      if (token === undefined || token === '' || token === null) {
        throw recaptchaException();
      }
      const response = await axios.post(verifyUrl, null, {
        params: {
          secret: this.secretKey,
          response: token
        }
      });

      if (this.version === 2) {
        if (!response.data.success) {
          throw recaptchaException();
        }
      }

      if (this.version === 3) {
        if (response.data.score < this.validScore) {
          throw recaptchaException();
        }
      }

      return true;
    } catch {
      throw recaptchaException();
    }
  };
}
