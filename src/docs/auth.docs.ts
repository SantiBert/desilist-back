/**
 * @openapi
 * /signup:
 *   post:
 *     description: User signup
 *     summary: Create a new user.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: new user
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserSignUp'
 *     responses:
 *       200:
 *         description: Returns created user email and send otp for activation.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserSignUpResponse'
 *       400:
 *         description: Bad user data.
 *       409:
 *         description: User already exists.
 *       500:
 *         description: Server error.
 *
 * /activate_account:
 *   post:
 *     description: Account activation
 *     summary: Activate the account of the registered user.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: activate accounts
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserActivateAccount'
 *     responses:
 *       200:
 *         description: Activate user's account and return session credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserActivateAccountResponse'
 *       400:
 *         description: Bad user data.
 *       404:
 *         description: You're not a register user.
 *       409:
 *         description: Account already validated || OTP expired.
 *       500:
 *         description: Server error.
 *
 * /login:
 *   post:
 *     description: User login
 *     summary: Login an existing user.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: login user
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Returns logged user id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserLoginResponse'
 *       400:
 *         description: Bad incoming data.
 *       404:
 *         description: You're not a register user.
 *       409:
 *         description: User or Password wrong || Cannot create Session.
 *       500:
 *         description: Server error.
 * /logout:
 *   post:
 *     description: User logout
 *     summary: logout an existing user.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: logout token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserLogoutToken'
 *     - name: logout user
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserLogout'
 *     responses:
 *       200:
 *         description: Returns logout confirm
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserLogoutResponse'
 *       400:
 *         description: Bad incoming data.
 *       404:
 *         description: You're not a register user || Authentication token missing.
 *       500:
 *         description: Server error.
 *
 * /reset_password_verify:
 *   post:
 *     description: Verify the account that ask for password reset
 *     summary: Verify the user's account.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: reset password verify
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserResetPasswordVerify'
 *     responses:
 *       200:
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserResetPasswordVerifyResponse'
 *       400:
 *         description: Bad user data.
 *       404:
 *         description: You're not a register user.
 *       409:
 *         description: You're not an active user.
 *       500:
 *         description: Server error.
 *
 * /reset_password_email:
 *   post:
 *     description: Verify the account that ask for password reset via email
 *     summary: Verify the user's account via email.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: reset password verify
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserResetPasswordEmailVerify'
 *     responses:
 *       200:
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserResetPasswordEmailVerifyResponse'
 *       400:
 *         description: Bad user data.
 *       404:
 *         description: You're not a register user.
 *       409:
 *         description: You're not an active user.
 *       500:
 *         description: Server error.
 *
 * /reset_password_sms:
 *   post:
 *     description: Verify the account that ask for password reset via sms
 *     summary: Verify the user's account via sms.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: reset password verify
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserResetPasswordSMSVerify'
 *     responses:
 *       200:
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserResetPasswordSMSVerifyResponse'
 *       400:
 *         description: Bad user data.
 *       404:
 *         description: You're not a register user.
 *       409:
 *         description: You're not an active user.
 *       500:
 *         description: Server error.
 *
 * /change_password_email:
 *   post:
 *     description: Change user's password
 *     summary: Persist user's new password.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: change password
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserChangeEmailPassword'
 *     responses:
 *       200:
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserChangeEmailPasswordResponse'
 *       400:
 *         description: Bad user data.
 *       404:
 *         description: You're not a register user.
 *       409:
 *         description: You're not an active user.
 *       500:
 *         description: Server error.
 *
 * /change_password_sms:
 *   post:
 *     description: Change user's password
 *     summary: Persist user's new password.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: change password
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserChangeSMSPassword'
 *     responses:
 *       200:
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserChangeSMSPasswordResponse'
 *       400:
 *         description: Bad user data.
 *       404:
 *         description: You're not a register user.
 *       409:
 *         description: You're not an active user.
 *       500:
 *         description: Server error.
 *
 * /send_confirmation:
 *   post:
 *     description: Send confirmation
 *     summary: Persist user's new password.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: send confirmation
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserResendVericationCode'
 *     responses:
 *       200:
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserResendVericationCodeResponse'
 *       400:
 *         description: Bad incoming data.
 *       404:
 *         description: You're not a register user.
 *       409:
 *         description: You're not an active user. | User block. | User inactive.
 *       500:
 *         description: Server error.
 *
 * /validate_otp:
 *   post:
 *     description: OTP code validation
 *     summary: Get an otp from the user and make validations to it.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: validate OTP
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserValidateOTP'
 *     responses:
 *       200:
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserValidateOTPResponse'
 *       400:
 *         description: Bad user data.
 *       404:
 *         description: You're not a register user.
 *       409:
 *         description: You're not an active user || OTP validation error.
 *       500:
 *         description: Server error.
 *
 * /validate_email:
 *   post:
 *     description: Validate if an email already exists or not
 *     summary: Get an email and make the validation.
 *     tags:
 *     - auth
 *     parameters:
 *     - name: validate email
 *       in: body
 *       description: user data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/UserValidateEmail'
 *     responses:
 *       200:
 *         description: OK.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/UserValidateEmailResponse'
 *       400:
 *         description: Bad incoming data.
 *       409:
 *         description: The email (email) already exists.
 *       500:
 *         description: Server error.
 *
 * definitions:
 *   schemas:
 *     UserSignUp:
 *       type: object
 *       properties:
 *         full_name:
 *           type: string
 *           description: The user's name
 *           example: Bart Simpson
 *         phone_number:
 *           type: string
 *           description: The user's phone number
 *           example: +5491155667788
 *         photo:
 *           type: string
 *           description: The user's photo in base64
 *           example: data:image/jpg;base64,iVBORw0KGgoAAA...
 *         bio:
 *           type: string
 *           description: The user's biography
 *           example: Some bio
 *         email:
 *           type: string
 *           description: The user's email
 *           example: bart@gmail.com
 *         password:
 *           type: string
 *           description: The user's password
 *           example: simpsons
 *     UserSignUpResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: The user's email.
 *               example: example@mail.com
 *         message:
 *           type: string
 *           description: Result message.
 *           example: User created.
 *
 *     UserActivateAccount:
 *       type: object
 *       properties:
 *         hash:
 *           type: base64
 *           description: Verification hash.
 *           example: eyJlbWFpbCI...
 *     UserActivateAccountResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Account has been activated.
 *
 *     UserLogin:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email
 *           example: bart@gmail.com
 *         password:
 *           type: string
 *           description: The user's password
 *           example: simpsons
 *     UserLoginResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: The user ID.
 *               example: 8e2a51ff-ed05-4bb1-a15d-82b7ea8e4749
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Login successful
 *
 *     UserLogout:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The user's Id
 *           example: 8e2a51ff-ed05-4bb1-a15d-82b7ea8e4749
 *     UserLogoutResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: The user ID.
 *               example: 8e2a51ff-ed05-4bb1-a15d-82b7ea8e4749
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Logout successful
 *
 *     UserResetPassword:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email.
 *           example: bart@gmail.com
 *         flow:
 *           type: string
 *           description: The validation flow (EMAIL or SMS).
 *           example: EMAIL | SMS
 *     UserResetPasswordResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: OTP code sent.
 *
 *     UserResetPasswordVerify:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email.
 *           example: bart@gmail.com
 *     UserResetPasswordVerifyResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *               description: user's email.
 *               example: example@mail.com
 *             phone_number:
 *               type: string
 *               desctiprion: if exist, obfuscated user's phone number.
 *               example: (********)5566 || null
 *         message:
 *           type: string
 *           description: Result message.
 *           example: OTP code sent.
 *
 *     UserResetPasswordEmailVerify:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email.
 *           example: bart@gmail.com
 *     UserResetPasswordEmailVerifyResponse:
 *       message:
 *         type: string
 *         description: Result message.
 *         example: If that phone number is in our database, we will send you a code to reset your password.
 *
 *     UserResetPasswordSMSVerify:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email.
 *           example: bart@gmail.com
 *     UserResetPasswordSMSVerifyResponse:
 *       message:
 *         type: string
 *         description: Result message.
 *         example: If that phone number is in our database, we will send you a code to reset your password.
 *
 *     UserChangePassword:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email.
 *           example: bart@gmail.com
 *         new_password:
 *           type: string
 *           description: New user's password.
 *           example: newPassword
 *     UserChangePasswordResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Password successfully changed.
 *
 *     UserChangeEmailPassword:
 *       type: object
 *       properties:
 *         new_password:
 *           type: string
 *           description: New user's password.
 *           example: newPassword
 *         token:
 *           type: string
 *           description: Token embeded in Reset Passowrd Email.
 *           example: c51ba9b8d7de42a87b08aacf698f385d2d43f0dfeb8f705a0d08066178df878eadc049a2b669c70419eadd1216d4583ec9b927fcef11f7dd3ba03fadebf22256
 *     UserChangeEmailPasswordResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Password successfully changed.
 *
 *     UserChangeSMSPassword:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email.
 *           example: bart@gmail.com
 *         new_password:
 *           type: string
 *           description: New user's password.
 *           example: newPassword
 *         OTP:
 *           type: string
 *           description: OTP code received by the user.
 *           example: 1234567
 *     UserChangeEmailSMSResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Password successfully changed.
 *
 *     UserResendVericationCode:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email.
 *           example: bart@gmail.com
 *         transporter:
 *           type: string
 *           description: transport method.
 *           example: EMAIL | SMS
 *         template:
 *           type: string
 *           description: template to send.
 *           example: CHANGE_PASSWORD | ACTIVATE_ACCOUNT
 *     UserResendVericationCodeResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: OTP code sent.
 *
 *     UserValidateOTP:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: The user's email.
 *           example: bart@gmail.com
 *         otp:
 *           type: string
 *           description: OTP code received by the user.
 *           example: 536944
 *     UserValidateOTPResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: OTP validated.
 *
 *     UserValidateHashedOTP:
 *       type: object
 *       properties:
 *         hash:
 *           type: string
 *           description: Verification hash.
 *           example: eyJlbWFpbCI...
 *     UserValidateHashedOTPResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: OTP validated.
 *
 *     UserValidateEmail:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           description: Email to validate.
 *           example: example@mail.com
 *     UserValidateEmailResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Email not registered.
 *
 */
