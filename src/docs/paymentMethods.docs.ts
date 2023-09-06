/**
 * @openapi
 * /payment_methods/{type}:
 *   get:
 *     description: Get user's payment methods by type.
 *     summary: Obtain all user's payment methods depending on type.
 *     tags:
 *     - payment methods
 *     parameters:
 *     - name: type
 *       in: path
 *       description: payment method type
 *       required: true
 *     responses:
 *       200:
 *         description: Returns the details of user's attached payment methods.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/definitions/schemas/GetPaymentMethodsCardResponse'
 *       400:
 *         description: Bad user data.
 *       401:
 *         description: Unautorized.
 *       404:
 *         description: Not found.
 *       5XX:
 *         description: Unexpected error.
 *
 * /payment_methods:
 *   post:
 *     description: Create payment method.
 *     summary: Create a payment method to attach later.
 *     tags:
 *     - payment methods
 *     parameters:
 *     - name: payment method card
 *       in: body
 *       description: new payment method card
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/PostPaymentMethodsCard'
 *     - name: payment method other
 *       in: body
 *       description: new payment method other
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/PostPaymentMethods'
 *     responses:
 *       200:
 *         description: Returns the confirmation for created payment method.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/PostPaymentMethodsResponse'
 *       400:
 *         description: Bad user data.
 *       401:
 *         description: Unautorized.
 *       404:
 *         description: Not found.
 *       5XX:
 *         description: Unexpected error.
 *
 * /payment_methods/{id}/attach:
 *   post:
 *     description: Attach a payment method.
 *     summary: Attach a payment method to a customer.
 *     tags:
 *     - payment methods
 *     parameters:
 *     - name: attach payment method
 *       in: path
 *       description: attach a payment method
 *       required: true
 *     - name: attach payment method body
 *       in: body
 *       description: attach a payment method
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/PostPaymentMethodsAttach'
 *     responses:
 *       200:
 *         description: Returns the confirmation of attached payment method.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/PostPaymentMethodsAttachResponse'
 *       400:
 *         description: Bad user data.
 *       401:
 *         description: Unautorized.
 *       404:
 *         description: Not found.
 *       5XX:
 *         description: Unexpected error.
 *
 * /payment_methods/{id}/detach:
 *   post:
 *     description: Detach a payment method.
 *     summary: Detach a payment method to a customer.
 *     tags:
 *     - payment methods
 *     parameters:
 *     - name: detach payment method
 *       in: path
 *       description: detach a payment method
 *       required: true
 *     - name: detach payment method body
 *       in: body
 *       description: detach a payment method
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/PostPaymentMethodsDetach'
 *     responses:
 *       200:
 *         description: Returns the confirmation of detached payment method.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/PostPaymentMethodsDetachResponse'
 *       400:
 *         description: Bad user data.
 *       401:
 *         description: Unautorized.
 *       404:
 *         description: Not found.
 *       5XX:
 *         description: Unexpected error.
 *
 * definitions:
 *   schemas:
 *     GetPaymentMethodsCardResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: Payment method id
 *                 example: pm_1LO4rYGJSRWMwQr6DU9edYja
 *               object:
 *                 type: string
 *                 description: Object type
 *                 example: payment_method
 *               billing_details:
 *                 type: object
 *                 properties:
 *                   address:
 *                     type: object
 *                     properties:
 *                       city:
 *                         type: string
 *                         description: billing city
 *                       country:
 *                         type: string
 *                         description: billing country
 *                       line1:
 *                         type: string
 *                         description: line
 *                       line2:
 *                         type: string
 *                         description: alternative line
 *                       postal_code:
 *                         type: string
 *                         description: billing postal code
 *                       state:
 *                         type: string
 *                         description: billing state
 *                   email:
 *                     type: string
 *                     description: customer email
 *                   name:
 *                     type: string
 *                     description: customer name
 *                   phone:
 *                     type: string
 *                     description: customer phone number
 *               card:
 *                 type: object
 *                 properties:
 *                   brand:
 *                     type: string
 *                     description: card brand
 *                     example: visa
 *                   checks:
 *                     type: object
 *                     properties:
 *                       address_line1_check:
 *                         type: string
 *                         description: address line1 check
 *                       address_postal_code_check:
 *                         type: string
 *                         description: address postal code check
 *                       cvc_check:
 *                         type: string
 *                         description: cvc check
 *                         example: pass
 *                   country:
 *                     type: string
 *                     description: card country
 *                     example: US
 *                   exp_month:
 *                     type: number
 *                     description: card expiration month
 *                     example: 10
 *                   exp_year:
 *                     type: number
 *                     description: card expiration year
 *                     example: 2030
 *                   fingerprint:
 *                     type: string
 *                     description: card fingerprint
 *                     example: k0cxl100ZtMTl2wM
 *                   funding:
 *                     type: string
 *                     description: funding type
 *                     example: credit
 *                   generated_from:
 *                     type: string
 *                   last4:
 *                     type: string
 *                     description: card last four digits
 *                     example: 4242
 *                   networks:
 *                     type: object
 *                     properties:
 *                       available:
 *                         type: array
 *                         items:
 *                           type: string
 *                           example: [visa]
 *                       preferred:
 *                         type: string
 *                   three_d_secure_usage:
 *                     type: object
 *                     properties:
 *                       supported:
 *                         type: boolean
 *                         description: supported
 *                         example: true
 *                   wallet:
 *                     type: string
 *                     description: wallet
 *               created:
 *                 type: number
 *                 description: Date of creation
 *                 example: 1658431004
 *               customer:
 *                 type: string
 *                 description: Customer id
 *                 example: cus_M6HJ4YXsXL97zS
 *               type:
 *                 type: string
 *                 description: Payment method type
 *                 example: card
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Payment method retrieved.
 *
 *     PostPaymentMethodsCard:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: Payment method type
 *           example: card
 *         card:
 *           type: object
 *           properties:
 *             number:
 *               type: string
 *               description: Card number
 *               example: 4242424242424242
 *             exp_month:
 *               type: number
 *               description: Card expiration month
 *               example: 10
 *             exp_year:
 *               type: number
 *               description: Card expiration year
 *               example: 2030
 *             cvc:
 *               type: number
 *               description: Card cvc number
 *               example: 123
 *     PostPaymentMethods:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           description: Payment method type
 *           example: other
 *     PostPaymentMethodsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Payment method id
 *               example: pm_1LO4rYGJSRWMwQr6DU9edYja
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Payment method created.
 *
 *     PostPaymentMethodsAttach:
 *       type: object
 *       properties:
 *     PostPaymentMethodsAttachResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Payment method attached.
 *
 *     PostPaymentMethodsDetach:
 *       type: object
 *       properties:
 *     PostPaymentMethodsDetachResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Payment method detached.
 *
 */
