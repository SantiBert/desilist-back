export function newChatMessageTemplate(
  fullname: string,
  image: string,
  message: string,
  redirectUrl: string,
  unsubscribe: string
): string {
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
            color: #282D29;
            min-width: 159px;
            min-height: 36px;
            border: 1px solid #282D29;
            box-sizing: border-box;
            border-radius: 45px; 
            background-color: transparent;
            padding-top: 10px;
            padding-bottom: 10px;
          }
          button:hover {
            color: white;
            background-color: #282D29;
            border: 1px;
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
                                  <img src="https://desilist-dev.s3.us-east-2.amazonaws.com/social-icons/email-logo.png" />
                              </td>
                          </tr>
                          <tr style=''>
                              <td style='
                              display: flex;
                              margin-top: 55px;
                              margin-bottom: 12px;
                              align-items: center;
                              width:80%; min-width:270px; margin-left:auto; margin-right:auto;
                              '>
                                  <img src='${image}' 
                                  style='
                                  width: 35px;
                                  height: 35px;
                                  border-radius: 50%;
                                  margin-right: 12px;
                                  object-fit: cover'
                                  >
                                  <h3 style=" color:#2B303E; display:block; line-height: 6px">
                                          ${fullname}
                                  </h3>
                              </td>
                          </tr>
                          <hr style='width:80%; min-width:270px; margin-left:auto; margin-right:auto;'>
                          <tr style='width:80%; min-width:270px; margin-left:auto; margin-right:auto;'>
                              <td align="center" valign="top">
                                  <p style=" color:#575A63; margin-top: 26px;
                                  margin-bottom: 56px;">
                                  ${message}
                                  </p>
                              </td>
                          </tr>
                          <tr style='width:80%; min-width:270px; margin-left:auto; margin-right:auto;'>
                              <td align="center" valign="top">
                                  <a href='${redirectUrl}'>
                                      <button style='
                                      margin-bottom: 80px;padding: 8px 16px;'>
                                          View message in Desilist
                                      </button>
                                  </a>
                              </td>
                          </tr>
                          <hr style='width:80%; min-width:270px; margin-left:auto; margin-right:auto;'>
                          <tr style='width:80%; min-width:270px; margin-left:auto; margin-right:auto;'>
                              <td align="center" valign="top">
                                  <p style=" color:#575A63; margin-top: 24px;
                                  margin-bottom: 33px;">
                                  if you don't want to get any more mails about your <br>
                                  notification on desilist <a href='${unsubscribe}' style='color:#04A169; font-weight:bold; text-decoration: none' >click here</a>
                                  </p>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      
      </html>`;
}
