/**
 * @openapi
 * /listings:
 *   get:
 *     description: Retrive all Listings data
 *     summary: Retrive all Listings data by Id.
 *     tags:
 *     - Listing
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     responses:
 *       200:
 *         description: Returns all listings data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/getAllListingsResponse'
 *       500:
 *         description: Server error.
 *   post:
 *     description: Create Listing.
 *     summary: Create a new listing.
 *     tags:
 *     - Listing
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: new listing
 *       in: body
 *       description: listing data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/createListing'
 *     responses:
 *       200:
 *         description: Create Listing data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/createListingResponse'
 *       400:
 *         description: Bad listing data.
 *       404:
 *         description: Listing not found.
 *       500:
 *         description: Server error.
 *
 * /listings/{id}:
 *   get:
 *     description: Retrive Listing data by Id
 *     summary: Retrive Listing data by Id.
 *     tags:
 *     - Listing
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: listing Id
 *       in: param
 *       description: listing id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/listingId'
 *     responses:
 *       200:
 *         description: Returns Listing data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/getListingByIdResponse'
 *       404:
 *         description: Listing not found.
 *       500:
 *         description: Server error.
 *   patch:
 *     description: Update Listing.
 *     summary: Update a listing by Id.
 *     tags:
 *     - Listing
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: listing Id
 *       in: param
 *       description: listing id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/listingId'
 *     - name: new listing
 *       in: body
 *       description: listing data
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/updateListing'
 *     responses:
 *       200:
 *         description: Update Listing data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/updateListingResponse'
 *       400:
 *         description: Bad listing data.
 *       403:
 *         description: Insufficient Permissions.
 *       404:
 *         description: Listing not found.
 *       500:
 *         description: Server error.
 *   delete:
 *     description: Delete a Listing.
 *     summary: Delete a listing by Id.
 *     tags:
 *     - Listing
 *     parameters:
 *     - name: session token
 *       in: header
 *       description: user session token
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/getCurrentUserToken'
 *     - name: listing Id
 *       in: param
 *       description: listing id
 *       required: true
 *       schema:
 *         $ref: '#/definitions/schemas/listingId'
 *     responses:
 *       200:
 *         description: Delete Listing data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/definitions/schemas/deleteListingResponse'
 *       403:
 *         description: Insufficient Permissions.
 *       404:
 *         description: Listing not found.
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
 *     getAllListingsResponse:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                description: The listing Id
 *                example: 1
 *              title:
 *                type: string
 *                description: The listing title
 *                example: Wedding planner
 *          message:
 *            type: string
 *            description: Result message.
 *            example: findAll.
 *
 *     listingId:
 *       type: object
 *       properties:
 *         data:
 *           type: param
 *           properties:
 *             id:
 *               type: string
 *               description: The listing ID.
 *               example: 1
 *     getListingByIdResponse:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              id:
 *                type: number
 *                description: The listing Id
 *                example: 1
 *              title:
 *                type: string
 *                description: The listing title
 *                example: Wedding planner
 *              description:
 *                type: string
 *                description: The listing description
 *                example: Wedding planners support couples and their families with the organisation, hiring, purchasing and management involved with planning a successful wedding.
 *              website:
 *                type: string
 *                description: The listing website
 *                example: www.example.com
 *              price:
 *                type: number
 *                description: The listing price
 *                example: 10.00
 *              images:
 *                type: string[]
 *                description: The listing images
 *                example:
 *                  - http://bucketname.s3.amazonaws.com/1.png,http://bucketname.s3.amazonaws.com/2.png
 *              location:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: City of the listing
 *                    example: Detroit
 *                  state:
 *                    type: string
 *                    description: State of the listing
 *                    example: Michigan
 *                  zip_code:
 *                    type: string
 *                    description: The listing website
 *                    example: 48127
 *              contact:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                    description: Email of the listing contact
 *                    example: jhondoe@example.com
 *                  phone:
 *                    type: string
 *                    description: State of the listing
 *                    example: +5491155667788
 *              subcategory:
 *                type: object
 *                properties:
 *                  id:
 *                    type: number
 *                    description: Id of the listing Subcategory
 *                    example: 1
 *                  name:
 *                    type: string
 *                    description: Name of the listing Subcategory
 *                    example: +5491155667788
 *              user:
 *                type: object
 *                properties:
 *                  id:
 *                    type: string
 *                    description: Id of the listing User owner
 *                    example: c270b5ae-7326-478b-8a20-d18bbd028fda
 *                  name:
 *                    type: string
 *                    description: Name of the listing User owner
 *                    example: Jonh Doe
 *              listing_status:
 *                type: object
 *                properties:
 *                  id:
 *                    type: number
 *                    description: Id of the listing status.
 *                    example: 1
 *                  name:
 *                    type: string
 *                    description: Name of the listing status.
 *                    example: DRAFT
 *          message:
 *            type: string
 *            description: Result message.
 *            example: findOne.
 *
 *     createListing:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              subcategory_id:
 *                type: number
 *                description: The sucategory listing Id
 *                example: 1
 *              title:
 *                type: string
 *                description: The listing title
 *                example: Wedding planner
 *              description:
 *                type: string
 *                description: The listing description
 *                example: Wedding planners support couples and their families with the organisation, hiring, purchasing and management involved with planning a successful wedding.
 *              images:
 *                type: string[]
 *                description: The listing images
 *                example:
 *                  - http://bucketname.s3.amazonaws.com/1.png,http://bucketname.s3.amazonaws.com/2.png
 *              promoted:
 *                type: boolean
 *                description: Create the listing as promoted
 *                example: true
 *              price:
 *                type: number
 *                description: The listing price
 *                example: 10.00
 *              location:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: City of the listing
 *                    example: Detroit
 *                  state:
 *                    type: string
 *                    description: State of the listing
 *                    example: Michigan
 *                  zip_code:
 *                    type: string
 *                    description: The listing website
 *                    example: 48127
 *              contact:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                    description: Email of the listing contact
 *                    example: jhondoe@example.com
 *                  phone:
 *                    type: string
 *                    description: State of the listing
 *                    example: +5491155667788
 *              website:
 *                type: string
 *                description: The listing website
 *                example: www.example.com
 *     createListingResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: created.
 *
 *     updateListing:
 *        type: object
 *        properties:
 *          data:
 *            type: object
 *            properties:
 *              subcategory_id:
 *                type: number
 *                description: The sucategory listing Id
 *                example: 1
 *              user_id:
 *                type: string
 *                description: The user listing Id
 *                example: c270b5ae-7326-478b-8a20-d18bbd028fda
 *              title:
 *                type: string
 *                description: The listing title
 *                example: Wedding planner
 *              description:
 *                type: string
 *                description: The listing description
 *                example: Wedding planners support couples and their families with the organisation, hiring, purchasing and management involved with planning a successful wedding.
 *              images:
 *                type: string[]
 *                description: The listing images
 *                example:
 *                  - http://bucketname.s3.amazonaws.com/1.png,http://bucketname.s3.amazonaws.com/2.png
 *              price:
 *                type: number
 *                description: The listing price
 *                example: 10.00
 *              location:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: City of the listing
 *                    example: Detroit
 *                  state:
 *                    type: string
 *                    description: State of the listing
 *                    example: Michigan
 *                  zip_code:
 *                    type: string
 *                    description: The listing website
 *                    example: 48127
 *              contact:
 *                type: object
 *                properties:
 *                  email:
 *                    type: string
 *                    description: Email of the listing contact
 *                    example: jhondoe@example.com
 *                  phone:
 *                    type: string
 *                    description: State of the listing
 *                    example: +5491155667788
 *              website:
 *                type: string
 *                description: The listing website
 *                example: www.example.com
 *     updateListingResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: update
 *
 *     deleteListingResponse:
 *        type: object
 *        properties:
 *          message:
 *            type: string
 *            description: Result message.
 *            example: deleted
 *
 */
