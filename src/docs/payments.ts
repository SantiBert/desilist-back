/**
 * @openapi
 * /payments:
 *   post:
 *     description: Create a payment intent.
 *     summary: Create a payment intent for confirm/cancel in the future.
 *     tags:
 *     - payments
 *     parameters:
 *     - name: payment intent
 *       in: body
 *       description: payment information
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/PostPayments'
 *     responses:
 *       200:
 *         description: Returns the payment id and next step.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/definitions/schemas/PostPaymentsResponse'
 *       400:
 *         description: Bad user data.
 *       401:
 *         description: Unautorized.
 *       404:
 *         description: Not found.
 *       5XX:
 *         description: Unexpected error.
 *
 * /payments/{id}/confirm:
 *   post:
 *     description: Comfirm a payment.
 *     summary: Confirm a payment created previously.
 *     tags:
 *     - payments
 *     parameters:
 *     - name: payment confirm
 *       in: path
 *       description: payment's id to confirm
 *       required: true
 *     - name: payment confirm body
 *       in: body
 *       description: payment method to use for the payment
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/PostPaymentConfirm'
 *     responses:
 *       200:
 *         description: Returns the confirmation for created payment method.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/PostPaymentConfirmResponse'
 *       400:
 *         description: Bad user data.
 *       401:
 *         description: Unautorized.
 *       404:
 *         description: Not found.
 *       5XX:
 *         description: Unexpected error.
 *
 * /payments/{id}/cancel:
 *   post:
 *     description: Cancel a payment.
 *     summary: Cancel a payment created previously.
 *     tags:
 *     - payments
 *     parameters:
 *     - name: payment cancel
 *       in: path
 *       description: payment's id to cancel
 *       required: true
 *     - name: payment cancel body
 *       in: body
 *       description: reason for the cancellation
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/PostPaymentCancel'
 *     responses:
 *       200:
 *         description: Returns the confirmation of attached payment method.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/PostPaymentCancelResponse'
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
 *     PostPayments:
 *       type: object
 *       properties:
 *         amount:
 *           type: number
 *           description: Payment amount in cents
 *           example: 100
 *         currency:
 *           type: string
 *           description: Currency of the payment
 *           example: usd
 *         method_type:
 *           type: string
 *           description: Payment method type
 *         method_options:
 *           type: string
 *           description: Payment method options
 *     PostPaymentsResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Payment intent id
 *               example: pi_3LO4lIGJSRWMwQr60IaGsn04
 *             next_action:
 *               type: string
 *               description: Payment next action
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Payment created.
 *
 *     PostPaymentConfirm:
 *       type: object
 *       properties:
 *         payment_method_id:
 *           type: string
 *           description: payment method id
 *           example: pm_1LNGApGJSRWMwQr6UIZgq9Hk
 *     PostPaymentConfirmResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Payment confirmed.
 *
 *     PostPaymentCancel:
 *       type: object
 *       properties:
 *         reason:
 *           type: string
 *           description: Cancelation reason
 *     PostPaymentCancelResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Payment canceled.
 *
 */
