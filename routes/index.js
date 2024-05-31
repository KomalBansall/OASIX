const express = require('express');
const userRoutes = require('./user.route');
const interestRoutes = require('./interest.route');
const friendRoutes = require('./friend.route');
const plannedRoutes = require('./planned.route');
const router = express.Router();

router.get('/alive', (req, res) => {
  res.status(200).json({ status: 'pass' });
});


router.use('/api/user', userRoutes);
router.use('/api/interest', interestRoutes);
router.use('/api/friend',friendRoutes);
router.use('/api/planned',plannedRoutes);



module.exports = router;