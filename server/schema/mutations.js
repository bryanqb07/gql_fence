const mongoose = require("mongoose");
const graphql = require("graphql");
const { GraphQLObjectType, GraphQLString, GraphQLInt, 
        GraphQLID, GraphQLList, GraphQLBoolean, GraphQLFloat } = graphql;
const { GraphQLUpload } = require("graphql-upload");
const AuthService = require("../services/auth");

const CategoryType = require("./types/category_type");
const ProductType = require("./types/product_type");
const UserType = require("./types/user_type");
const OrderType = require("./types/order_type");
const FileType = require('./types/file_type');

const Category = mongoose.model("category");
const Product = mongoose.model("product");
const Order = mongoose.model("order");
const User = mongoose.model("user");

const stripeKey = require('../../config/keys').STRIPE_SECRET_KEY;
const stripe = require("stripe")(stripeKey);

const mutation = new GraphQLObjectType({
    name: "Mutation",
    fields: {
        updateUserName: {
            type: UserType,
            args: { 
                id: { type: GraphQLID },
                name: { type: GraphQLString},
                email: { type: GraphQLString}},
            resolve(_, { id, name, email }){
                const updatedUser = {};
                updatedUser.id = id;
                updatedUser.email = email;
                updatedUser.isStaff = true;
                if (name) updatedUser.name = name;
                return User.findByIdAndUpdate(id, { $set: updatedUser }, { new: true }, (err, user) => {
                    return user;
                });
            }
        },
        newCategory: {
            type: CategoryType,
            args: {
                name: { type: GraphQLString }
            },
            resolve(_, { name }) {
                return new Category({ name }).save();
            }
        },
        deleteCategory: {
            type: CategoryType,
            args: { id: { type: GraphQLID } },
            resolve(_, { id }) {
                return Category.findByIdAndRemove(id);
            }
        },
        updateCategory: {
            type: CategoryType,
            args: { 
                id: { type: GraphQLID },
                name: { type: GraphQLString}},
            resolve(_, { id, name }){
                const updatedCategory = {};
                updatedCategory.id = id;
                if (name) updatedCategory.name = name;
                return Category.findByIdAndUpdate(id, { $set: updatedCategory }, { new: true }, (err, category) => {
                    return category;
                });
            }
        },
        newProduct: {
            type: ProductType,
            args: {
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                width: { type: GraphQLFloat },
                height: { type: GraphQLFloat },
                // price: { type: GraphQLInt },
                category: { type: GraphQLID },
                flatInstallationFee: { type: GraphQLFloat },
                perFtInstallationFee: { type: GraphQLFloat },
                unitPrice: { type: GraphQLFloat },
                perFtUnitPriceThreeMonths: { type: GraphQLFloat },
                perFtUnitPriceSixMonths: { type: GraphQLFloat },
                perFtUnitPriceNineMonths: { type: GraphQLFloat },
                perFtUnitPriceTwelveMonths: { type: GraphQLFloat } 
                // photo: { type: GraphQLUpload }
            },
            async resolve(_, { name, description, width, height, category, flatInstallationFee,
                perFtInstallationFee, unitPrice, perFtUnitPriceThreeMonths, perFtUnitPriceSixMonths,
                perFtUnitPriceNineMonths, perFtUnitPriceTwelveMonths}, ctx) {
                // const file = await args.file;
                // const { createReadStream, filename, mimetype } = file;
                // const fileStream = createReadStream();

                // //Here stream it to S3
                // // Enter your bucket name here next to "Bucket: "
                // const uploadParams = {
                // Bucket: "gqlfence-dev",
                // Key: filename,
                // Body: fileStream
                // };
                // const result = await s3.upload(uploadParams).promise();

                // console.log(result);

                // return file;

                const validUser = await AuthService.verifyUser({ token: ctx.token, admin: true });
                if(validUser.loggedIn){
                    const product = await new Product({
                        name, description, width, height, category, flatInstallationFee,
                        perFtInstallationFee, unitPrice, perFtUnitPriceThreeMonths, perFtUnitPriceSixMonths,
                        perFtUnitPriceNineMonths, perFtUnitPriceTwelveMonths });
                    
                    const updatedCategory = await Category.findByIdAndUpdate(category, {
                      $push: { products: product.id }
                    });
                    if(updatedCategory){
                        return product.save();
                    }else{
                        throw new Error("Error updating product category.");
                    }

                }else{
                    throw new Error("Sorry, you need to be logged-in staff to create a product.");
                }
            }
        },
        deleteProduct: {
            type: ProductType,
            args: { id: { type: GraphQLID } },
            resolve(_, { id }) {
                return Product.findByIdAndRemove(id);
            }
        },
        updateProductCategory: {
            type: ProductType,
            args: { productId: { type: GraphQLID }, categoryId: { type: GraphQLID }},
            resolve(_, { productId, categoryId }){
                return Product.updateProductCategory(productId, categoryId);
            }
        },
        updateProduct: {
            type: ProductType,
            args: { 
                productId: { type: GraphQLID },
                name: { type: GraphQLString },
                description: { type: GraphQLString },
                width: { type: GraphQLFloat },
                height: { type: GraphQLFloat },
                price: { type: GraphQLInt },
                category: { type: GraphQLID },
                flatInstallationFee: { type: GraphQLFloat },
                perFtInstallationFee: { type: GraphQLFloat },
                unitPrice: { type: GraphQLFloat },
                perFtUnitPriceThreeMonths: { type: GraphQLFloat },
                perFtUnitPriceSixMonths: { type: GraphQLFloat },
                perFtUnitPriceNineMonths: { type: GraphQLFloat },
                perFtUnitPriceTwelveMonths: { type: GraphQLFloat } 
            },
            resolve(_, { productId, name, description, width, height, price, category, flatInstallationFee,
                perFtInstallationFee, unitPrice, perFtUnitPriceThreeMonths, perFtUnitPriceSixMonths,
                perFtUnitPriceNineMonths, perFtUnitPriceTwelveMonths} ) {
                const updatedProduct = {};
                updatedProduct.id = productId;
                if (name) updatedProduct.name = name;
                if (description) updatedProduct.description = description;
                if (width) updatedProduct.width = width;
                if (height) updatedProduct.height = height;
                if (price) updatedProduct.price = price;
                if (category) updatedProduct.category = category;
                if (flatInstallationFee) updatedProduct.flatInstallationFee = flatInstallationFee;
                if (perFtInstallationFee) updatedProduct.perFtInstallationFee = perFtInstallationFee;
                if (unitPrice) updatedProduct.unitPrice = unitPrice;
                if (perFtUnitPriceThreeMonths) updatedProduct.perFtUnitPriceThreeMonths = perFtUnitPriceThreeMonths;
                if (perFtUnitPriceSixMonths) updatedProduct.perFtUnitPriceSixMonths = perFtUnitPriceSixMonths;
                if (perFtUnitPriceNineMonths) updatedProduct.perFtUnitPriceNineMonths = perFtUnitPriceNineMonths;
                if (perFtUnitPriceTwelveMonths) updatedProduct.perFtUnitPriceTwelveMonths = perFtUnitPriceTwelveMonths;
                return Product.findByIdAndUpdate(productId, { $set: updatedProduct }, { new: true }, (err, product) => {
                    if(category){
                        return Product.updateProductCategory(product.id, category);
                    }
                    return product;
                });
            }
        },
        register: {
            type: UserType,
            args: {
                name: { type: GraphQLString },
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            resolve(_, args){
                return AuthService.register(args);
            }
        },
        logout: {
            type: UserType,
            args: {
                id: { type: GraphQLID }
            },
            resolve(_, args){
                return AuthService.logout(args);
            }
        },
        login: {
            type: UserType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString }
            },
            resolve(_, args){
                return AuthService.login(args);
            }
        },
        verifyUser: {
            type: UserType,
            args: {
                token: { type: GraphQLString },
                isStaff: { type: GraphQLBoolean }
            },
            resolve(_, args){
                return AuthService.verifyUser(args);
            }
        },
        newOrder: {
            type: OrderType,
            args: {
                user: { type: GraphQLID },
                email: { type: GraphQLString },
                name: { type: GraphQLString },
                token: { type: GraphQLString },
                products: { type: GraphQLList(GraphQLID) },
                subtotal: { type: GraphQLFloat },
                installationFee: { type: GraphQLFloat },
                insured: { type: GraphQLBoolean },
                insuranceFee: { type: GraphQLFloat },
                salesTax: { type: GraphQLFloat },
                total: { type: GraphQLFloat },
                totalFootage: { type: GraphQLInt },
                productRentalPeriods: {type: GraphQLList(GraphQLString) },
                telephone: { type: GraphQLString }, 
                shippingName: { type: GraphQLString },
                address1: { type: GraphQLString },
                address2: { type: GraphQLString },
                city: { type: GraphQLString },
                state: { type: GraphQLString },
                zipcode: { type: GraphQLString }
            },
            async resolve(_, { 
                token, products, user, name, telephone, total, shippingName, address1, address2, city,
                state, zipcode, email, productRentalPeriods, subtotal, installationFee, insured,
                insuranceFee, salesTax, totalFootage
            }, ctx) {
                const productDateList = productRentalPeriods.map(item => {
                    const splitItem = item.split(",");
                    return { startDate: splitItem[0], endDate: splitItem[1] };
                });
                      // validatePrice fn
                      let order = {
                        products,
                        subtotal,
                        installationFee,
                        insured,
                        insuranceFee,
                        salesTax,
                        totalFootage,
                        total,
                        email,
                        name,
                        telephone,
                        productRentalPeriods: productDateList,
                        token,
                        shippingName,
                        address1,
                        address2,
                        city,
                        state,
                        zipcode
                      };
                      if (user) order.user = user;
                    //   console.log(order);

                      // stripe validation
                      try {
                        let { status } = await stripe.charges.create({
                          amount: total * 100,
                          currency: "usd",
                          description: "An example charge",
                          source: token
                        });

                        return new Order(order).save();
                      } catch (err) {
                        console.log(err);
                        return err;
                      }
                    }
        }
    }
});

module.exports = mutation;