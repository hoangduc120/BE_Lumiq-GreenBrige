const productSevice = require("../services/product.sevice");
const { OK, BAD_REQUEST } = require("../configs/response.config");


class ProductController {
    async createProduct(req, res) {
        try {
            const product = await productSevice.createProduct(req.body)
            return OK(res, "Product created successfully", { product });
        } catch (error) {
            return BAD_REQUEST(res, error.message);
        }
    }

    async getAllProducts(req, res) {
        try {
            const { page, limit, sort, search } = req.query;

            // Service trả về { products, totalProducts, totalPages, currentPage }
            const productsData = await productSevice.getAllProducts(page, limit, sort, search);

            // Trả về kết quả với cấu trúc đúng
            return OK(res, "Get all products successfully", productsData);
        } catch (error) {
            return BAD_REQUEST(res, error.message);
        }
    }

    async getProductById(req, res) {
        try {
            const product = await productSevice.getProductById(req.params.id)
            return OK(res, "Get product by id successfully", { product });
        } catch (error) {
            return BAD_REQUEST(res, error.message);
        }
    }

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