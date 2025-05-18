const accessKey = 'F8BBA842ECF85';
const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
const orderInfo = 'Pay with MoMo';
const partnerCode = 'MOMO';
const redirectUrl = process.env.URL_FRONTEND;
const ipnUrl = process.env.URL_FRONTEND;
const requestType = "captureWallet";
const extraData = '';
const orderGroupId = '';
const autoCapture = true;
const orderExpireTime = 2;
const lang = 'en';

function generateOrderId() {
  return partnerCode + new Date().getTime();
}

function generateRequestId() {
  return generateOrderId();
}

module.exports = {
  accessKey,
  secretKey,
  orderInfo,
  partnerCode,
  redirectUrl,
  ipnUrl,
  requestType,
  extraData,
  orderGroupId,
  autoCapture,
  orderExpireTime,
  lang,
  generateOrderId,
  generateRequestId
}
