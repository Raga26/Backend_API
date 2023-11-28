const ErrorResponse = require('../utils/errorResponse');
const Bootcamp = require('../models/Bootcamp')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')


/*
 Controller functions in bootcamp.js contain the actual logic for handling requests.
They use middleware (like asyncHandler) to handle asynchronous operations.
Interactions with the database (MongoDB) are done using Mongoose. 

next       -> next middleware function in the Express.js request-response cycl

geocoder  ->  addresses into geographic coordinates.

*/

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access public


exports.getBootcamps = asyncHandler(async (req , res , next) => {
let query;

//copy req query
const reqQuery = { ...req.query}


//fields to execute
const removeFields = ['select','sort' , 'page' , 'limit']

//loop over remove and  delete from req query
removeFields.forEach(param => delete reqQuery[param]);


//create query string
let queryStr = JSON.stringify(reqQuery)

//create operators 
queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

//finding resource
query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')

//select fields
if (req.query.select) {
  const fields = req.query.select.split(',').join(' ');
  query = query.select(fields);
}

 // Sort
 if (req.query.sort) {
  const sortBy = req.query.sort.split(',').join(' ');
  query = query.sort(sortBy);
} else {
  query = query.sort('-createdAt');
}

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }


//executing query
const bootcamps  = await query;

    //const bootcamps = await Bootcamp.find(req.body)

    res.status(200).json({
       success: true , 
       count: bootcamps.length,
       pagination:pagination,
       data:bootcamps
    })
})

//@desc Get single bootcamps
//@route GET /api/v1/bootcamps/:id
//@access public

exports.getBootcamp = asyncHandler(async (req , res , next) => {
    
    const bootcamp = await Bootcamp.findById(req.params.id)

    res.status(200).json({
       success: true , 
       data:bootcamp
    })
})


//@desc create new bootcamps
//@route POST /api/v1/bootcamps
//@access private

exports.createBootcamp = asyncHandler( async (req , res , next) => {
 
  //add user to req body
 req.body.user = req.user.id

 // Check for published bootcamp
 const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

 // If the user is not an admin, they can only add one bootcamp
 if (publishedBootcamp && req.user.role !== 'admin') {
   return next(
     new ErrorResponse(
       `The user with ID ${req.user.id} has already published a bootcamp`,
       400
     )
   );
 }
 
  const bootcamp = await Bootcamp.create(req.body)
 res.status(201).json({
    success: true , 
    data:bootcamp
 })
})

//@desc update bootcamps
//@route PUT /api/v1/bootcamps/:id
//@access private

exports.updateBootcamp = asyncHandler(async (req , res , next) => {

  let bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
      return next(
        new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
      );
    }
  
    // Make sure user is bootcamp owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this bootcamp`,
          401
        )
      );
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    res.status(200).json({
        success : true , 
        data:bootcamp })

})

//@desc delete bootcamps
//@route DELETE /api/v1/bootcamps/:id
//@access private

exports.deleteBootcamp = asyncHandler(async (req , res , next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
       
    bootcamp.remove();

    res.status(200).json({
            success : true , 
            data:{} })

})

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distance
// @access    Private

exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;
  
    // Get lat/lng from geocoder
    const loc = await geocoder.geocode(zipcode);
    const lat = loc[0].latitude;
    const lng = loc[0].longitude;
  
    // Calc radius using radians
    // Divide dist by radius of Earth
    // Earth Radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;
  
    const bootcamps = await Bootcamp.find({
      location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } }
    });
  
    res.status(200).json({
      success: true,
      count: bootcamps.length,
      data: bootcamps
    });
  });