import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary, { isCloudinaryConfigured } from "../utils/cloudinary.js";

const isResumeFile = (file) => {
    if (!file) return false;
    const filename = file.originalname?.toLowerCase() || "";
    return file.mimetype === "application/pdf"
        || filename.endsWith(".pdf")
        || file.mimetype === "application/msword"
        || filename.endsWith(".doc")
        || file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        || filename.endsWith(".docx");
};

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;
         
        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                message: "Profile photo is required.",
                success: false
            });
        }
        if (!isCloudinaryConfigured) {
            return res.status(500).json({
                message: "Cloudinary is not configured. Set CLOUD_NAME, API_KEY, and API_SECRET or their CLOUDINARY_* equivalents.",
                success: false
            });
        }
        const fileUri = getDataUri(file);
        const cloudResponse = await cloudinary.uploader.upload(fileUri.content, { resource_type: "auto" });

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile:{
                profilePhoto:cloudResponse.secure_url,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
    }
}
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const jwtSecret = process.env.SECRET_KEY || "dev-secret-key";
        
        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id
        }
        const token = await jwt.sign(tokenData, jwtSecret, { expiresIn: '1d' });

        const isProduction = process.env.NODE_ENV === "production";
        const cookieOptions = {
            maxAge: 1 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        };

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200)
       .cookie("token", token, cookieOptions).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        return res.status(200).cookie("token", "", {
            maxAge: 0,
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax"
        }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;
        
        const file = req.file;
        if (!isCloudinaryConfigured) {
            return res.status(500).json({
                message: "Cloudinary is not configured. Set CLOUD_NAME, API_KEY, and API_SECRET or their CLOUDINARY_* equivalents.",
                success: false
            });
        }

        let cloudResponse = null;
        if (file) {
            const fileUri = getDataUri(file);
            const uploadOptions = { resource_type: "auto" };
            if (isResumeFile(file)) {
                uploadOptions.resource_type = "raw";
            }
            cloudResponse = await cloudinary.uploader.upload(fileUri.content, uploadOptions);
        }



        let skillsArray;
        if(skills){
            skillsArray = skills.split(",");
        }
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        // updating data
        if(fullname) user.fullname = fullname
        if(email) user.email = email
        if(phoneNumber)  user.phoneNumber = phoneNumber
        if(bio) user.profile.bio = bio
        if(skills) user.profile.skills = skillsArray
      
        // resume comes later here...
        if (cloudResponse) {
            user.profile.resume = cloudResponse.secure_url; // save the cloudinary url
            user.profile.resumeOriginalName = file.originalname; // Save the original file name
        }


        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message:"Profile updated successfully.",
            user,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}