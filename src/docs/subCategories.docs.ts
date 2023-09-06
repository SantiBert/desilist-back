/**
 * @openapi
 * /subcategories:
 *   get:
 *     description: Retrive all subcategories data
 *     summary: Retrive all subcategories data by Id.
 *     tags:
 *     - SubCategories
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     responses:
 *       200:
 *         description: Returns all subcategories data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/getAllSubCategoriesResponse'
 *       500:
 *         description: Server error.
 *
 * /admin/subcategories:
 *   post:
 *     description: Create Sub Category.
 *     summary: Create a new sub category.
 *     tags:
 *     - SubCategories
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: new sub category
 *       in: body
 *       description: sub category data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/createSubCategory'
 *     responses:
 *       200:
 *         description: Create sub category data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/createSubCategoryResponse'
 *       400:
 *         description: Bad sub category data.
 *       500:
 *         description: Server error.
 *
 * /subcategories/{id}:
 *   get:
 *     description: Retrive Sub Category data by Id
 *     summary: Retrive Sub Category data by Id.
 *     tags:
 *     - SubCategory
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: sub category Id
 *       in: param
 *       description: sub category id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/subCategoryId'
 *     responses:
 *       200:
 *         description: Returns Category data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/getSubCategoryByIdResponse'
 *       404:
 *         description: Sub Category not found.
 *       500:
 *         description: Server error.
 * /admin/subcategories/{id}:
 *   put:
 *     description: Update Sub Category.
 *     summary: Update a sub category by Id.
 *     tags:
 *     - SubCategory
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: sub category Id
 *       in: param
 *       description: sub category id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/subCategoryId'
 *     - name: new sub category
 *       in: body
 *       description: sub category data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/updateSubCategory'
 *     responses:
 *       200:
 *         description: Update Sub Category data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/updateSubCategoryResponse'
 *       400:
 *         description: Bad sub category data.
 *       404:
 *         description: Sub category not found.
 *       500:
 *         description: Server error.
 *   delete:
 *     description: Delete a Sub category.
 *     summary: Delete a sub category by Id.
 *     tags:
 *     - SubCategory
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: sub category Id
 *       in: param
 *       description: sub category id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/subCategoryId'
 *     responses:
 *       200:
 *         description: Delete Category data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/deleteSubCategoryResponse'
 *       404:
 *         description: Sub category not found.
 *       500:
 *         description: Server error.
 * /admin/subcategories/order:
 *   patch:
 *     description: Update Sub Categories Order.
 *     summary: Update an array of Subcategory.
 *     tags:
 *     - SubCategories
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: subcategories
 *       in: body
 *       description: subcategories order data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/updateSubCategoryOrder'
 *     responses:
 *       200:
 *         description: Update SubCategory Order data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/updateSubCategoryOrderResponse'
 *       400:
 *         description: Bad Subcategory data.
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
 *     getAllSubCategoryResponse:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                description: The sub category Id
 *                example: 1
 *              name:
 *                type: string
 *                description: The sub category name
 *                example: Professional jobs
 *              icon:
 *                type: string
 *                description: The sub category icon
 *                example: http://bucketname.s3.amazonaws.com/icon.png
 *              image:
 *                type: string
 *                description: The sub category image
 *                example: http://bucketname.s3.amazonaws.com/1.png
 *              category:
 *                type: object
 *                properties:
 *                  id:
 *                    type: number
 *                    description: The category Id
 *                    example: 1
 *                  name:
 *                    type: string
 *                    description: The category name
 *                    example: Community
 *          message:
 *            type: string
 *            description: Result message.
 *            example: findAll.
 *
 *     subCategoryId:
 *       type: object
 *       properties:
 *         data:
 *           type: param
 *           properties:
 *             id:
 *               type: string
 *               description: The category Id.
 *               example: 1
 *     getSubCategoryByIdResponse:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                description: The sub category Id
 *                example: 1
 *              name:
 *                type: string
 *                description: The sub category name
 *                example: Professional jobs
 *              icon:
 *                type: string
 *                description: The sub category icon
 *                example: http://bucketname.s3.amazonaws.com/icon.png
 *              image:
 *                type: string
 *                description: The sub category image
 *                example: http://bucketname.s3.amazonaws.com/1.png
 *              category:
 *                type: object
 *                properties:
 *                  id:
 *                    type: number
 *                    description: The category Id
 *                    example: 1
 *                  name:
 *                    type: string
 *                    description: The category name
 *                    example: Community
 *          message:
 *            type: string
 *            description: Result message.
 *            example: findOne.
 *
 *     createSubCategory:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              category_id:
 *                type: number
 *                description: The category id
 *                example: 1
 *              name:
 *                type: string
 *                description: The sub category name
 *                example: Professional Job
 *              description:
 *                type: string
 *                description: The sub category description
 *                example: Lorem ipsum dolor sit amet, consectetur adipiscing elit...
 *              image:
 *                type: string
 *                description: The sub category image
 *                example: http://bucketname.s3.amazonaws.com/1.png
 *              icon:
 *                type: string
 *                description: The sub category icon
 *                example: http://bucketname.s3.amazonaws.com/icon.png
 *     createSubCategoryResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: created.
 *
 *     updateSubCategory:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                description: The sub category title
 *                example: Wedding planner
 *              description:
 *                type: string
 *                description: The sub category description
 *                example: Wedding planners support couples and their families with the organisation, hiring, purchasing and management involved with planning a successful wedding.
 *              image:
 *                type: string
 *                description: The sub category images
 *                example: http://bucketname.s3.amazonaws.com/1.png
 *              icon:
 *                type: string
 *                description: The sub category icon
 *                example: http://bucketname.s3.amazonaws.com/icon.png
 *     updateSubCategoryResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: update
 *
 *     deleteSubCategoryResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: deleted
 *
 *     updateSubCategoryOrder:
 *        type: object
 *        properties:
 *          subcategories:
 *            type: array
 *            items:
 *              type: object
 *              properties:
 *                id:
 *                  type: number
 *                  description: The Subcategory id
 *                  example: 1
 *                order:
 *                  type: number
 *                  example: 1
 *                  description: The Subcategory order
 *     updateSubCategoryOrderResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: updated
 *
 */
