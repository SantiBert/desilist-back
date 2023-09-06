/**
 * @openapi
 * /users/current:
 *   get:
 *     description: Retrive User data by Id
 *     summary: Retrive User data by Id.
 *     tags:
 *     - user
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: new user
 *       in: object
 *       description: user id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUser'
 *     responses:
 *       200:
 *         description: Returns User data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/getCurrentUserResponse'
 *       400:
 *         description: Bad user data.
 *       404:
 *         description: User not found.
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
 *     getCurrentUser:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               description: The user ID.
 *               example: 8e2a51ff-ed05-4bb1-a15d-82b7ea8e4749
 *     getCurrentUserResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
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
 *         message:
 *           type: string
 *           description: Result message.
 *           example: findOne.
 *
 */
