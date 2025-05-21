const express = require('express');
const router = express.Router();
const customerController = require('../controllers/CustomerInfoController');

//router.get('/customer/:userId', customerController.getCustomerInfoByUserId);

router.post('/adressInfo', customerController.getCustomerAddresses);

router.post('/adressInfo/update/address', customerController.updateCustomerAddress);

router.post('/adressInfo/update/delivery', customerController.updateDeliveryAddress);

router.post('/legal-name', customerController.getLegalName);

router.post('/legal-name/update', customerController.updateLegalName);


module.exports = router;
