/**
 * @openapi
 * /chats:
 *   get:
 *     description: Retrive all chats data
 *     summary: Retrive all Chats data by User.
 *     tags:
 *     - Chat
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     responses:
 *       200:
 *         description: Returns all user chat data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/getChatByUserResponse'
 *       500:
 *         description: Server error.
 *   post:
 *     description: Create Chat.
 *     summary: Create a new Chat.
 *     tags:
 *     - Chat
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: new chat
 *       in: body
 *       description: chat data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/createChat'
 *     responses:
 *       200:
 *         description: Create Chat data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/createChatResponse'
 *       400:
 *         description: Bad chat data.
 *       404:
 *         description: Chat not found.
 *       500:
 *         description: Server error.
 *
 * /chats/{id}:
 *   get:
 *     description: Retrive Chat data by Id
 *     summary: Retrive Chat data by Id.
 *     tags:
 *     - Chat
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: chat Id
 *       in: param
 *       description: chat id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getChatById'
 *     responses:
 *       200:
 *         description: Returns Chat data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/getChatByIdResponse'
 *       404:
 *         description: Chat not found.
 *       500:
 *         description: Server error.
 * /chats/{id}/seen:
 *   patch:
 *     description: Update Chat Seen.
 *     summary: Update a chat by Id.
 *     tags:
 *     - Chat
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: chat seen Id
 *       in: param
 *       description: chat seen id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/seenMessage'
 *     - name: update seen chat
 *       in: body
 *       description: chat data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/updateSeenMessage'
 *     responses:
 *       200:
 *         description: Update Chat seen.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/updateSeenMessageResponse'
 *       400:
 *         description: Bad chat data.
 *       403:
 *         description: Insufficient Permissions.
 *       404:
 *         description: Chat not found.
 *       500:
 *         description: Server error.
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
 *     getChatByUserResponse:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                description: The Chat user
 *                example: 1
 *              title:
 *                type: string
 *                description: The chat title
 *                example: Wedding planner
 *          message:
 *            type: string
 *            description: Result message.
 *            example: findAll.
 *
 *     ChatId:
 *       type: object
 *       properties:
 *         data:
 *           type: param
 *           properties:
 *             id:
 *               type: int
 *               description: The Chat ID.
 *               example: 1
 *     getChatByIdResponse:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                description: The Chat Id
 *                example: 1
 *              title:
 *                type: string
 *                description: The chat title
 *                example: Communication with the wedding planner
 *              description:
 *                type: string
 *                description: The chat description
 *                example: Wedding planners support couples and their families with the organisation, hiring, purchasing and management involved with planning a successful wedding.
 *              website:
 *                type: string
 *                description: The chat website
 *                example: www.example.com
 *              images:
 *                type: string[]
 *                description: The chat images
 *                example:
 *                  - http://bucketname.s3.amazonaws.com/1.png,http://bucketname.s3.amazonaws.com/2.png
 *              location:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: City of the listing chat
 *                    example: Detroit
 *                  state:
 *                    type: string
 *                    description: State of the listing chat
 *                    example: Michigan
 *                  zip_code:
 *                    type: string
 *                    description: The chat listing website
 *                    example: 48127
 *              contact:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                    description: Email of the chat listing contact
 *                    example: jhondoe@example.com
 *                  phone:
 *                    type: string
 *                    description: State of the chat listing
 *                    example: +5491155667788
 *              subcategory:
 *                type: object
 *                properties:
 *                  id:
 *                    type: number
 *                    description: Id of the chat listing Subcategory
 *                    example: 1
 *                  name:
 *                    type: string
 *                    description: Name of the chat listing Subcategory
 *                    example: +5491155667788
 *              user:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                    description: Id of the chat listing User owner
 *                    example: c270b5ae-7326-478b-8a20-d18bbd028fda
 *                  name:
 *                    type: string
 *                    description: Name of the chat listing User owner
 *                    example: Jonh Doe
 *     createChat:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              listing_id:
 *                type: number
 *                description: The listing Id
 *                example: 1
 *     createChatResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: created.
 *
 *     updateSeenMessage:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                description: The chat Id
 *                example: 1
 *     updateChatResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: update
 *
 */
