const { body, validationResult } = require('express-validator');
const UserModel = require('../models/UserModel'); 
const apiResponse = require('../helpers/apiResponse');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const mailer = require('../helpers/mailer'); 

exports.login = [
    body("usernameOrEmail")
        .isLength({ min: 1 }).trim().withMessage("Username or Email must be specified."),
    body("password")
        .isLength({ min: 1 }).trim().withMessage("Password must be specified."),

    async (req, res) => {
        console.log("Function is called");

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }

            const { usernameOrEmail, password } = req.body;
            console.log("Plaintext password from request:", JSON.stringify(password));

            const user = await UserModel.findOne({
                $or: [{ email: usernameOrEmail }, { username: usernameOrEmail }]
            });
            console.log("User found:", user);

            if (user) {
                console.log("User metadata:", user);
                const isMatch = await bcrypt.compare(password, user.password);

                if (isMatch) {
                    const userData = {
                        email: user.email,
                        username: user.username,
                        role: user.role,
                    };

                    const jwtPayload = userData;
                    const jwtData = { expiresIn: process.env.JWT_TIMEOUT_DURATION };
                    const secret = process.env.JWT_SECRET;
                    userData.token = jwt.sign(jwtPayload, secret, jwtData);

                    return apiResponse.successResponseWithData(res, "Login Success.", userData);
                } else {
                    return apiResponse.unauthorizedResponse(res, "Invalid username/email or password.");
                }
            } else {
                return apiResponse.unauthorizedResponse(res, "Invalid username/email or password.");
            }
        } catch (error) {
            return apiResponse.ErrorResponse(res, error.message);
        }
    }
];

exports.addUser = [
    body("email")
        .isEmail().withMessage("Email must be valid.")
        .normalizeEmail(),
    body("password")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long."),

    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
        }

        const { email, password, role, username } = req.body;

        try {
            const existingUser = await UserModel.findOne({ email });
            if (existingUser) {
                return apiResponse.validationErrorWithData( res, "User with this email already exists." )
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = new UserModel({
                email,
                password: hashedPassword,
                role: role || "user",
                username : username 
            });

            await newUser.save();
            return apiResponse.successResponseWithData(res, "User Added Successfully.", newUser);
        } catch (error) {
            return apiResponse.ErrorResponse(res, error.message);
           
        }
    }
];

exports.getAllUsers = [
    async (req, res) => {
        try {
            const { page = 1, limit = 10 } = req.query;

            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            const skip = (pageNumber - 1) * limitNumber;

            const users = await UserModel.find({}, 'email role username')
                .skip(skip)
                .limit(limitNumber)
                .exec();

            const total = await UserModel.countDocuments();

            const responseData = {
                users, 
                currentPage: pageNumber, 
                totalPages: Math.ceil(total / limitNumber), 
                totalusers: total 
            };

            return apiResponse.successResponseWithData(res, "Success.", responseData);
        } catch (error) {
            return apiResponse.ErrorResponse(res, error.message);
        }
    }
];


exports.getUserById = [

    async(req, res) =>{
            try {
                const { id } = req.params;
                const user = await UserModel.findById(id, 'email role username');
                if (!user) {
                    return apiResponse.notFoundResponse(res, "User not found.");
                }

                return apiResponse.successResponseWithData(res, "Success.", user);

            }catch (error){
                return apiResponse.ErrorResponse(res, error.message);

            }
    }

];


exports.updateUser = [
    async(req, res) => {
        try {
            const { id } = req.params;
            const { email, role, username } = req.body;
            const updatedUser = await UserModel.findByIdAndUpdate(
                id,
                { email, role, username },
                { new: true, runValidators: true } 
            );

            if (!updatedUser) {
                return apiResponse.notFoundResponse(res, "User not found.");
            }

            return apiResponse.successResponseWithData(res, "User updated successfully.", updatedUser);

        }catch (error) {
            return apiResponse.ErrorResponse(res, error.message);
        }
    }

];

exports.deleteUser = [
    async(req, res) => {
        try {
            const { id } = req.params;
            const deletedUser = await UserModel.findByIdAndDelete(id);
            if (!deletedUser) {
                return apiResponse.notFoundResponse(res, "User not found.");
            }
            return apiResponse.successResponse(res, "User deleted successfully.");
    
        }catch(error) {
            return apiResponse.ErrorResponse(res, error.message);

        }
    }
];




exports.forgotPassword = [
    body("email").isEmail().withMessage("Enter a valid email address."),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData( res, "Validation Error.", errors.array())
            }

            const { email } = req.body;
            const user = await UserModel.findOne({ email: email });

            if (!user) {
                return apiResponse.validationErrorWithData(res, "User Not Found .")

            }

            const otp = crypto.randomInt(100000, 999999).toString();
            user.otp = otp;
            user.otpExpires = Date.now() + 15 * 60 * 1000; 
            await user.save();

            const subject = "Your OTP for Password Reset";
            const html = `<p>Your OTP is <b>${otp}</b>. It is valid for 15 minutes.</p>`;

            await mailer.send(email, subject, html);

            return apiResponse.successResponseWithData(res, "OTP Send Successfully.");
        } catch (error) {
            return apiResponse.ErrorResponse(res, error.message);
        }
    }
];

exports.verifyOTP = [
    body("email").isEmail().withMessage("Enter a valid email address."),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits."),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "OTP is invalid or validation of OTP", errors.array());
            }

            const { email, otp } = req.body;
            const user = await UserModel.findOne({ email: email });

            if (!user) {
                return apiResponse.validationErrorWithData(res, "User not found.");
            }

            if (user.otp !== otp || user.otpExpires < Date.now()) {
                return apiResponse.validationErrorWithData(res, "Invalid or expired OTP.");
            }

            if (user.otp === otp && user.otpExpires >= Date.now()) {
                user.canResetPassword = true;
                await user.save();
            }
            

            return apiResponse.successResponse(res, "OTP verified. You can now reset your password.");
        } catch (error) {
            return apiResponse.ErrorResponse(res, error.message);
        }
    }
];

exports.resetPassword = [
    body("email").isEmail().withMessage("Enter a valid email address."),
    body("newPassword").isLength({ min: 6 }).withMessage("Password must be at least 6 characters."),
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }

            const { email, newPassword } = req.body;
            const user = await UserModel.findOne({ email: email });

            if (!user) {
                return apiResponse.validationErrorWithData(res, "User not found.");
            }

            if (!user.canResetPassword) {
                return apiResponse.validationErrorWithData(res, "OTP verification required before resetting password.");
            }

            user.password = await bcrypt.hash(newPassword, 10);
            user.canResetPassword = false;
            user.otp = undefined;
            user.otpExpires = undefined;

            await user.save();

            return apiResponse.successResponse(res, "Password has been reset successfully.");
        } catch (error) {
            return apiResponse.ErrorResponse(res, error.message);
        }
    }
];



exports.changePassword = [
    body("newPassword")
        .isLength({ min: 1 }).trim().withMessage("New password must be specified."),

    async (req, res) => {
        console.log("Change Password function reached");

        try {
            const token = req.headers['authorization'].split(' ')[1]; 
            if (!token) {
                return apiResponse.unauthorizedResponse(res, "Token is required.");
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (!decoded) {
                return apiResponse.unauthorizedResponse(res, "Invalid token.");
            }

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
            }

            const { newPassword } = req.body;
            const adminUser = await UserModel.findOne({ email: decoded.email });

            console.log("adminUser>>>>>", adminUser);
            if (adminUser) {
                adminUser.password = await bcrypt.hash(newPassword, 10); 
                
                await adminUser.save(); 
                console.log(adminUser);

                const userData = {
                    email: adminUser.email,
                    role: adminUser.role,
                };

                const jwtPayload = userData;
                const jwtData = { expiresIn: process.env.JWT_TIMEOUT_DURATION };
                const newToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, jwtData);

                return apiResponse.successResponseWithData(res, "Password changed successfully. Please login again.", { newToken });
            } else {
                return apiResponse.unauthorizedResponse(res, "Admin user not found.");
            }
        } catch (error) {
            return apiResponse.ErrorResponse(res, error.message);
        }
    }
];