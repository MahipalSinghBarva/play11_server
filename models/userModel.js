const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require("dotenv")
dotenv.config()


const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
    },
    phone: {
        type: String,
        unique: true
    },
    password: {
        type: String,
        select: false,
        validate: {
            validator: function (value) {
                if (this.isAdmin && (!value || value.trim() === '')) {
                    return false;
                }
                return true;
            },
            message: "Password is required for admin users",
        }
    },
    address: {
        doorno: {
            type: String,
            default: "Not provided"
        },
        city: {
            type: String,
            default: "Not provided"
        },
        state: {
            type: String,
            default: "Not provided"
        },
        country: {
            type: String,
            default: "Not provided"
        },
        zipCode: {
            type: String,
            default: "Not provided"
        }
    },
    aadharCardImage: {
        type: String,
        default: null,
    },

    isAdmin: {
        type: Boolean,
        default: false,
    },
    profilePicture: {
        type: String,
    },
    teams: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Teams"
    },
    contest: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contest"
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

}, {
    timestamps: true,
});


// Method to generate JWT token
userSchema.methods.generateJsonWebToken = function () {
    const token = jwt.sign({ id: this._id, phone: this.phone }, process.env.JWT_SECRET, {
        expiresIn: '7d',
    });
    return token;
};

userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});


const User = mongoose.model('User', userSchema);

module.exports = User;
