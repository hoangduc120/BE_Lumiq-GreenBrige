const Product = require("../schema/product.model");
const ErrorWithStatus = require("../utils/errorWithStatus");
const { StatusCodes } = require("http-status-codes");
const mongoose = require("mongoose");
const axios = require("axios");

class ProductService {
    async getAllProducts(page = 1, limit = 10, sort = '', search = '', minPrice = 0, maxPrice = Infinity) {
        try {
            const pageNum = parseInt(page, 10);
            const limitNum = parseInt(limit, 10);
            if (pageNum < 1 || limitNum < 1) {
                throw new ErrorWithStatus({
                    status: StatusCodes.BAD_REQUEST,
                    message: "Số trang hoặc giới hạn không hợp lệ",
                });
            }
            const skip = (pageNum - 1) * limitNum;

            // Xây dựng truy vấn
            let query = {
                price: { $gte: minPrice, $lte: maxPrice },
            };
            if (search) {
                query.name = { $regex: search, $options: 'i' }; // Sửa productName thành name
            }

            // Xây dựng tùy chọn sắp xếp
            const validSorts = ['priceAsc', 'priceDesc', 'nameAsc'];
            let sortOption = {};
            if (validSorts.includes(sort)) {
                if (sort === 'priceAsc') sortOption.price = 1;
                else if (sort === 'priceDesc') sortOption.price = -1;
                else if (sort === 'nameAsc') sortOption.name = 1;
            }

            // Thực hiện truy vấn
            const products = await Product.find(query)
                .populate('gardener', 'name email')
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum);

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
            if (!mongoose.Types.ObjectId.isValid(id)) {
                throw new ErrorWithStatus({
                    status: StatusCodes.BAD_REQUEST,
                    message: "ID sản phẩm không hợp lệ",
                });
            }
            const product = await Product.findById(id).populate('gardener', 'name email');
            if (!product) {
                throw new ErrorWithStatus({
                    status: StatusCodes.NOT_FOUND,
                    message: "Không tìm thấy sản phẩm",
                });
            }
            return product;
        } catch (error) {
            throw new ErrorWithStatus({
                status: error.status || StatusCodes.BAD_REQUEST,
                message: error.message,
            });
        }
    }

    async fetchAddressData(province, district, ward_street) {
        try {
            if (!province || !district || !ward_street) {
                throw new Error("Thiếu thông tin địa chỉ");
            }
            const url = `https://services.giaohangtietkiem.vn/services/address/getAddressLevel4?province=${province}&district=${district}&ward_street=${ward_street}`;
            const response = await axios.get(url, {
                headers: {
                    token: process.env.GHTK_API_TOKEN, // Sử dụng biến môi trường
                },
            });
            return response.data;
        } catch (error) {
            throw new ErrorWithStatus({
                status: StatusCodes.BAD_REQUEST,
                message: error.message || "Không thể lấy dữ liệu địa chỉ",
            });
        }
    }
}

module.exports = new ProductService();
