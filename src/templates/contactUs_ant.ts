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
    
        </style>
    </head>
    
    <body marginheight="0" marginwidth="0" bottommargin="0" topmargin="0" leftmargin="0" rightmargin="0">
        <table width="100%" cellspacing="0" cellpading="0" border="0">
            <tr>
                <td align="center" valign="top">
                    <table width="700px" cellspacing="0" cellpading="0" border="0">
                              <img src="https://i.ibb.co/W3RNVy4/Email-01.png" />
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
                                        <td><b>From:</b></td>
                                        <td>${from}</td>
                                    </tr>
                                    <tr>
                                        <td><b>Name:</b></td>
                                        <td>${name}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="2">
                                            <b>Message:</b>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="2">${message}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    
    </html>`;
}
