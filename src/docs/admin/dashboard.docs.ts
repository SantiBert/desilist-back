/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     description: Retrive Admin dashboard info.
 *     summary: Retrive all categories data and active Users.
 *     tags:
 *     - Admin
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     responses:
 *       200:
 *         description: Returns all categories data and count active users.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/getAdminDashboardResponse'
 *       500:
 *         description: Server error.
 *
 * definitions:
 *   schemas:
 *     getCurrentUserToken:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: The session token in JWT format.
 *               example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjdlM2E5NWU3LWEyOGQtNDIzYi05NjhjLTgzZDcxMGQ4NzA2YyIsImlhdCI6MTY0NzYxNzg5NCwiZXhwIjoxNjQ3NjE4NDk0fQ.c6y5l8Zl5er38hSJ11ErB0J1c__2poXenXy0ewgLh6Q
 *     getAdminDashboardResponse:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              categories:
 *                type: object
 *                properties:
 *                 id:
 *                   type: number
 *                   description: The category Id
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: The category name
 *                   example: Community
 *                 listings:
 *                   type: number
 *                   description: Count of listings in the category
 *              user:
 *                type: Number
 *                description: Count of active users
 *          message:
 *            type: string
 *            description: Result message.
 *            example: Dashboard.
 *
 *
 *
 */
