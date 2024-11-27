var express = require("express");
const AuthController = require("../controllers/AuthController");

var router = express.Router();

router.post('/addUser', AuthController.addUser);
router.get('/user', AuthController.getAllUsers);
router.get('/users/:id', AuthController.getUserById); 
router.put('/users/:id', AuthController.updateUser); 
router.delete('/users/:id', AuthController.deleteUser);
module.exports = router;
