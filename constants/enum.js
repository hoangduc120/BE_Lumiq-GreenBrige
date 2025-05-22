const ROLE = {
    USER: 'user',
    ADMIN: 'admin',
}

const GENDER = {
    MALE: 'male',
    FEMALE: 'female'
}

const ORDER_STATUS = {
    PROCESSING: 'processing',
    CANCELLED: 'cancelled',
    SUCCESS: 'success',
    PENDING: 'pending',
}

const PAYMENT_STATUS = {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded',
}

module.exports = { ROLE, GENDER, ORDER_STATUS, PAYMENT_STATUS };
