const express = require('express')

/*   
bootcamps.js contains route definitions using Express Router.
It directs requests to specific controller functions based on the route. 

module.exports      ->  router;  JS concept
                        that exports the router so that it can be imported and used in other files

router.route(...)   -> express.js method , defining routes for specific HTTP methods on a particular path.
                      , organizes routes and connects them to specific controller functions.
*/

const {
    getBootcamps ,
     getBootcamp ,
      createBootcamp , 
      updateBootcamp ,
       deleteBootcamp,
       getBootcampsInRadius
    } = require('../controllers/bootcamps')

// Include other resource routers
const courseRouter = require('./courses');

const router = express.Router();

const {protect , authorize} =require('../middleware/auth')

// Re-route into other resource routers
router.use('/:bootcampId/courses', courseRouter);

router.route('/radius/:zipcode/:distance').get(getBootcampsInRadius);

router.route('/')
.get(getBootcamps)
.post( createBootcamp)

router.route('/:id')
.get(getBootcamp)
.post( updateBootcamp)
.delete(deleteBootcamp)

module.exports = router;