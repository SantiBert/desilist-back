/**
 * @openapi
 * /contact_us:
 *   post:
 *     description: Contact us
 *     summary: Send an email with the Contact Us form to the pre-established account
 *     tags:
 *     - contact
 *     parameters:
 *     - name: contact us
 *       in: body
 *       description: form data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/ContactUs'
 *     responses:
 *       200:
 *         description: Returns the confirmation of email sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/ContactUsResponse'
 *       500:
 *         description: Server error.
 *
 * definitions:
 *   schemas:
 *     ContactUs:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the Contact Us form
 *           example: Bart Simpson
 *         email:
 *           type: string
 *           description: Email of the Contact Us form
 *           example: bart@gmail.com
 *         message:
 *           type: string
 *           description: Message of the Contact Us form
 *           example: simpsons
 *     ContactUsResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Message sent.
 */
