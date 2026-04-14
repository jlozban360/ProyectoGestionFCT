const router = require('express').Router();

router.get('/', (req, res) => {
  res.json({ status: 'UP', app: 'Gestión FCT (Node.js)' });
});

module.exports = router;
