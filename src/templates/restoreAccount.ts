export function restoreAccountTemplate(redirectUrl: string): string {
  return `<!DOCTYPE html>
  <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
  <head>
      <title></title>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <style>
      button {
        background-color: transparent;;
        transition: background-color .5s;
        color: #BB275C;
        min-width: 159px;
        min-height: 36px;          
        border: 1px solid #BB275C; 
        box-sizing: border-box;
        border-radius: 45px; 
        background-color: transparent;
        padding-top: 10px;
        padding-bottom: 10px;
      }
      button:hover {
        color: white;
        background-color: #BB275C;
      }
      .social-media > a{
        margin: 0px 10px;
        text-decoration: none;
        color: #cecece
      }
      @media (max-width: 600px) {
          table{
              font-size: large;
          }
          button{
              font-size: large;
              min-width: 220px;
              min-height: 50px;
          }
      }
        .social-media {
            padding-top: 50px;
            width: 100%;          
        }
        .social-media > a{
            margin: 0px 10px;
            text-decoration: none;
            color: #cecece
        }
        @media screen and (max-device-width: 414px) and (max-device-height: 776px) {
            .link > a > button{ 
               font-size: 30px;
            }
            .social-media > a > img {
                width: 35px;
                height: 35px;
            }
            .main-text {
                font-size:25px;
            }
          }
          @media only screen 
            and (device-width: 390px) 
            and (device-height: 844px) 
            and (-webkit-device-pixel-ratio: 3) { 
                .link > a > button{ 
                    font-size: 30px;
                }
                .social-media > a > img {
                    width: 35px;
                    height: 35px;
                }
                .main-text {
                    font-size:25px;
                }
            }
          @media only screen 
            and (device-width: 375px) 
            and (device-height: 812px) 
            and (-webkit-device-pixel-ratio: 3) {
                .link > a > button{ 
                    font-size: 30px;
                }
                .social-media > a > img {
                    width: 35px;
                    height: 35px;
                }
                .main-text {
                    font-size:25px;
                }
    
            }
          @media only screen 
            and (device-width: 428px) 
            and (device-height: 926px) 
            and (-webkit-device-pixel-ratio: 3) {
                .link > a > button{ 
                    font-size: 30px;
                }
                .social-media > a > img {
                    width: 35px;
                    height: 35px;
                }
                .main-text {
                    font-size:25px;
                }
            }
      </style>
  </head>
  <body marginheight="0" marginwidth="0" bottommargin="0" topmargin="0" leftmargin="0" rightmargin="0">
      <table width="100%" cellspacing="0" cellpading="0" border="0">
          <tr>
              <td align="center" valign="top">
                  <table width="700px" cellspacing="0" cellpading="0" border="0">
                      <tr>
                          <td>
                              <img src="https://desilist-dev.s3.us-east-2.amazonaws.com/main/email-banner-desilist_03.jpg" />
                          </td>
                      </tr>
                      <tr>
                          <td align="center" valign="top">
                              <h1 style=" color:#2B303E; ">
                                Your account has been disabled
                              </h1>
                          </td>
                      </tr>
                      <tr>
                          <td align="center" valign="top">
                              <p class="main-text" style="color:#575A63; ">
                                Please click on the following link to restore it
                              </p>
                          </td>
                      </tr>
                      <tr>
                          <td class="link" align="center" valign="top">
                              <a href='${redirectUrl}'>
                                  <button>
                                      Restore my account
                                  </button>
                              </a>
                          </td>
                      </tr>
                      <tr>
                        <td class="social-media" align="center">
                            <a href="https://www.facebook.com/SFDesilist">
                                <img src="https://desilist-dev.s3.us-east-2.amazonaws.com/social-icons/face-icon.png" />
                            </a>
                            <a href="https://www.instagram.com/desilistofficial">
                                <img src="https://desilist-dev.s3.us-east-2.amazonaws.com/social-icons/insta-icon.png" />
                            </a>
                        </td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
  </body>
</html>`;
}
