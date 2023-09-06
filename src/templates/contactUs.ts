export function contactUsTemplate(
  from: string,
  name: string,
  message: string
): string {
  return `<!DOCTYPE html>
      <html lang="en" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:v="urn:schemas-microsoft-com:vml">
      
      <head>
          <title></title>
          <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
          <meta content="width=device-width, initial-scale=1.0" name="viewport" />
          <style>
          .linea {
              border-top: 1px solid black;
              height: 2px;
              padding: 0;
              margin: 20px auto 0 auto;
            }
            .social-media {
                margin-top: 50px;
                display: flex;
                flex-direction: row;
                width: 100%;          
                align-items: center;
                justify-content: center;
            }
            .social-media > a{
                margin: 0px 10px;
            }
            .social-media a img{
                filter: opacity(0.2)
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
                      <table cellspacing="0" cellpading="0" border="0">
                          <tr>
                              <td>
                                <img src="https://i.ibb.co/cQ3DfQs/Message-Mail-ASSets-logo.png" />
                              </td>
                          </tr>
                          <tr>
                              <td align="center" valign="top">
                                  <h1 style=" color:#2B303E; ">
                                    Contact from Desilist
                                  </h1>
                              </td>
                          </tr>
                          <tr>
                              <td>
                                  <table>
                                      <tr>
                                          <td>
                                            <b>From:</b>
                                          <br/>
                                            <p class="main-text">${from}</p>
                                          <br/>
                                            <p class="main-text">${name}</p>
                                          </td>
                                      </tr>
                                      <div class="linea"></div>
                                      <tr>
                                          <td colspan="2">
                                          </td>
                                      </tr>
                                      <tr>
                                          <td colspan="2">
                                            <p class="main-text">${message}</p>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                          <tr>
                            <td class="social-media">
                                <a href="https://www.facebook.com/SFDesilist">
                                    <img src="https://desilist-dev.s3.us-east-2.amazonaws.com/social-icons/face-icon.webp" />
                                </a>
                                <a href="https://www.instagram.com/desilistofficial">
                                    <img src="https://desilist-dev.s3.us-east-2.amazonaws.com/social-icons/insta-icon.webp" />
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
