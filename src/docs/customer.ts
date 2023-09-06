/**
 * @openapi
 * /customers:
 *   post:
 *     description: Create a customer.
 *     summary: Create a stripe customer.
 *     tags:
 *     - customers
 *     parameters:
 *     - name: create customer
 *       in: body
 *       description: customer information
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/PostCustomers'
 *     responses:
 *       200:
 *         description: Returns the created customer id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/PostCustomersResponse'
 *       400:
 *         description: Bad user data.
 *       401:
 *         description: Unautorized.
 *       404:
 *         description: Not found.
 *       5XX:
 *         description: Unexpected error.
 *
 *   delete:
 *     description: Delete a customer.
 *     summary: Delete a stripe customer.
 *     tags:
 *     - customers
 *     responses:
 *       200:
 *         description: Returns the confirmation for deleted customer.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/DeleteCustomersResponse'
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
 *     PostCustomers:
 *       type: object
 *       properties:
 *     PostCustomersResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: Created customer id
 *               example: cus_3LO4lIGJSRWMwQr60IaGsn04
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Customer created.
 *
 *     DeleteCustomersResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Result message.
 *           example: Cusotmer deleted.
 *
 */
