const productSevice = require("../services/product.sevice");
const { OK, BAD_REQUEST } = require("../configs/response.config");


class ProductController {

    async getAddressData (req, res) {
        const { province, district, ward_street } = req.body;
        try {
          const response = await productSevice.fetchAddressData(
            province,
            district,
            ward_street
          );
          return OK(res, 'Address data retrieved successfully', response);
        } catch (error) {
          throw new APIError(500, 'Error retrieving address data', error.stack);
        }
      };

}

module.exports = new ProductController();