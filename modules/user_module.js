const mongoose = require('mongoose');
const slugify = require('slugify');
const bcrypt = require('bcryptjs');

const user_schema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name!'],
        trim: true,
        maxlength: [40, 'A user name must have less or equal than 40 characters'],
        minlength: [3, 'A user name must have more or equal than 3 characters']
    },
    slug: {
        type: String,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please provide your email!'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (val) {
                return /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(val);
            },
            message: 'Please provide a valid email!'
        }
    },
    googleId: { type: String, unique: true },
    active: {
        type: Boolean,
        default: true,
    },
 password: {
  type: String,
  required: function () {
    return !this.googleId; 
  },
  minlength: [8, 'A password must have more or equal than 8 characters']
},
    password_change_at: {
        type: Date,
        default: Date.now
    },
    profile_image: {
        type: String,
        default: 'default.jpg'
    },
    reset_password_token: String,
    reset_password_expires: Date,
    password_reset_verified: Boolean,
    phone: String,
    profile_image: String,
    role: {
        type: String,
        enum: ['user', 'maneger','admin'],
        default: 'user'
    },
},
    { timestamps: true }
);

user_schema.pre('save', async function (next) {
    
    if (!this.slug && this.name) {
        this.slug = slugify(this.name);
    }
    if (!this.isModified('password')) return next();
    // Hash the password before saving it to the database
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

const user_model = mongoose.model('User', user_schema);
module.exports = user_model;