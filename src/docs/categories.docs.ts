/**
 * @openapi
 * /categories:
 *   get:
 *     description: Retrive all categories data
 *     summary: Retrive all categories data by Id.
 *     tags:
 *     - Categories
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     responses:
 *       200:
 *         description: Returns all categories data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/getAllCategoriesResponse'
 *       500:
 *         description: Server error.
 * /admin/categories:
 *   post:
 *     description: Create Category.
 *     summary: Create a new category.
 *     tags:
 *     - Categories
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: new category
 *       in: body
 *       description: category data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/createCategory'
 *     responses:
 *       200:
 *         description: Create category data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/createCategoryResponse'
 *       400:
 *         description: Bad category data.
 *       500:
 *         description: Server error.
 *
 * /categories/{id}:
 *   get:
 *     description: Retrive Category data by Id
 *     summary: Retrive Category data by Id.
 *     tags:
 *     - Category
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: category Id
 *       in: param
 *       description: category id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/categoryId'
 *     responses:
 *       200:
 *         description: Returns Category data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/getCategoryByIdResponse'
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Server error.
 *
 * /admin/categories/{id}:
 *   put:
 *     description: Update Category.
 *     summary: Update a category by Id.
 *     tags:
 *     - Category
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: category Id
 *       in: param
 *       description: category id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/categoryId'
 *     - name: new category
 *       in: body
 *       description: category data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/updateCategory'
 *     responses:
 *       200:
 *         description: Update Category data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/updateCategoryResponse'
 *       400:
 *         description: Bad category data.
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Server error.
 *   delete:
 *     description: Delete a Category.
 *     summary: Delete a category by Id.
 *     tags:
 *     - Category
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: category Id
 *       in: param
 *       description: category id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/categoryId'
 *     responses:
 *       200:
 *         description: Delete Category data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/deleteCategoryResponse'
 *       404:
 *         description: Category not found.
 *       500:
 *         description: Server error.
 *
 * /admin/categories/order:
 *   patch:
 *     description: Update Categories Order.
 *     summary: Update an array of category.
 *     tags:
 *     - Categories
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: categories
 *       in: body
 *       description: categories order data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/updateCategoryOrder'
 *     responses:
 *       200:
 *         description: Update Category Order data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/updateCategoryOrderResponse'
 *       400:
 *         description: Bad category data.
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
 *     getAllCategoryResponse:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                description: The category Id
 *                example: 1
 *              name:
 *                type: string
 *                description: The category name
 *                example: Community
 *          message:
 *            type: string
 *            description: Result message.
 *            example: findAll.
 *
 *     categoryId:
 *       type: object
 *       properties:
 *         data:
 *           type: param
 *           properties:
 *             id:
 *               type: string
 *               description: The category ID.
 *               example: 1
 *     getCategoryByIdResponse:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                description: The category Id
 *                example: 1
 *              name:
 *                type: string
 *                description: The category name
 *                example: Community
 *          message:
 *            type: string
 *            description: Result message.
 *            example: findOne.
 *
 *     createCategory:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: The category name
 *                example: community
 *              description:
 *                type: string
 *                description: The category description
 *                example: Lorem ipsum dolor sit amet, consectetur adipiscing elit...
 *              image:
 *                type: string
 *                description: The category images
 *                example: http://bucketname.s3.amazonaws.com/1.png
 *              icon:
 *                type: string
 *                description: The category icon
 *                example: http://bucketname.s3.amazonaws.com/icon.png
 *     createCategoryResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: created.
 *
 *     updateCategory:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: The category title
 *                example: Wedding planner
 *              description:
 *                type: string
 *                description: The category description
 *                example: Wedding planners support couples and their families with the organisation, hiring, purchasing and management involved with planning a successful wedding.
 *              image:
 *                type: string
 *                description: The category images
 *                example: http://bucketname.s3.amazonaws.com/1.png
 *              icon:
 *                type: string
 *                description: The category icon
 *                example: http://bucketname.s3.amazonaws.com/icon.png
 *     updateCategoryResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: update
 *
 *     deleteCategoryResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: deleted
 *
 *     updateCategoryOrder:
 *        type: object
 *        properties:
 *          categories:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                id:
 *                  type: number
 *                  description: The category id
 *                  example: 1
 *                order:
 *                  type: number
 *                  example: 1
 *                  description: The category order
 *     updateCategoryOrderResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: updated
 */
