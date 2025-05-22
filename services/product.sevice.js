const Product = require("../schema/product.model");
const ErrorWithStatus = require("../utils/errorWithStatus");
const { StatusCodes } = require("http-status-codes");

class ProductService {
    async createProduct(productData) {
        try {
            const { productName, price, author, description, image } = productData;

            if (!productName || !price || !author || !description || !image) {
                throw new ErrorWithStatus({
                    status: StatusCodes.BAD_REQUEST,
                    message: "Missing required fields",
                });
            }

            const newProduct = new Product({
                productName,
                price,
                author,
                description,
                image,
            });

            await newProduct.save();
            return newProduct;
        } catch (error) {
            throw new ErrorWithStatus({
                status: StatusCodes.BAD_REQUEST,
                message: error.message,
            });
        }
    }

    async getAllProducts(page = 1, limit = 10, sort = '', search = '') {
        try {
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            if (pageNum < 1 || limitNum < 1) {
                throw new ErrorWithStatus({
                    status: StatusCodes.BAD_REQUEST,
                    message: "Invalid page number or limit",
                });
            }
            const skip = (pageNum - 1) * limitNum;

            // Build query
            let query = {};
            if (search) {
                query.productName = { $regex: search, $options: 'i' }; // Case-insensitive search
            }

            // Build sort options
            let sortOption = {};
            if (sort === 'priceAsc') {
                sortOption.price = 1;
            } else if (sort === 'priceDesc') {
                sortOption.price = -1;
            } else if (sort === 'nameAsc') {
                sortOption.productName = 1;
            }

            // Execute query with pagination, sorting, and search
            const products = await Product.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum);

            // Count total products matching the query
            const totalProducts = await Product.countDocuments(query);

            return {
                products,
                totalProducts,
                totalPages: Math.ceil(totalProducts / limitNum),
                currentPage: pageNum,
            };
        } catch (error) {
            throw new ErrorWithStatus({
                status: StatusCodes.BAD_REQUEST,
                message: error.message,
            });
        }
    }

    async getProductById(id) {
        try {
            const product = await Product.findById(id);
            if (!product) {
                throw new ErrorWithStatus({
                    status: StatusCodes.NOT_FOUND,
                    message: "Product not found",
                });
            }
            return product;
        } catch (error) {
            throw new ErrorWithStatus({
                status: StatusCodes.BAD_REQUEST,
                message: error.message,
            });
        }
    }

      async fetchAddressData(province, district, ward_street) {
        console.log(province);
        console.log(district);
        console.log(ward_street);
        try {
          const url = `https://services.giaohangtietkiem.vn/services/address/getAddressLevel4?province=${province}&district=${district}&ward_street=${ward_street}`;
          const response = await axios.get(url, {
            headers: {
              token: '76duRlamPHwHVcouzoetZaFm9vGqQF4RR8mTXq',
            },
          });
          console.log(url);
          return response.data;
        } catch (error) {
          throw new Error(error);
        }
      }
}

module.exports = new ProductService();