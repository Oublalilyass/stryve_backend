const express = require('express');
const router = express.Router();
const textController = require('../controllers/textController');

// const authenticate = require('../middlewares/authMiddleware');

// router.get('/texts', authenticate, textController.getAllTexts);

// router.get('/:uuid', textController.getTextByUUID); 
// router.get('/', textController.getText); 
// router.post('/', textController.createText); 

// module.exports = router;

// Middleware to check session type and set appropriate response
function checkSessionType(req, res, next) {
  if (!req.session.userType) {
    req.session.userType = 'Writer'; // Default session type
  }
  req.isWriter = req.session.userType === 'Writer';
  req.isPublisher = req.session.userType === 'Publisher';
  next();
}

router.use(checkSessionType);

router.get('/:uuid', (req, res, next) => {
  if (req.isWriter) {
    // Writer-specific logic
    return textController.getTextByUUID(req, res, next);
  } else if (req.isPublisher) {
    // Publisher-specific logic
    return textController.getTextByUUID(req, res, next);
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
});

router.get('/', (req, res, next) => {
  if (req.isWriter) {
    // Writer-specific logic
    return textController.getText(req, res, next);
  } else if (req.isPublisher) {
    // Publisher-specific logic
    return textController.getText(req, res, next);
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
});

router.post('/', (req, res, next) => {
  if (req.isWriter) {
    // Only Writers can create text
    return textController.createText(req, res, next);
  } else {
    res.status(403).json({ message: 'Forbidden' });
  }
});

module.exports = router;