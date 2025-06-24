const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userType: { type: String, enum: ['SLT', 'Non-SLT'], required: true },
    userId: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    serviceNo: { type: String, required: true },
    name: { type: String, required: true },
    designation: { type: String, required: true },
    section: { type: String, required: true },
    group: { type: String, required: true },
    contactNo: { type: String, required: true },
    email: { type: String, required: true },
    branches: [{ type: String, required: false }],
    role: { type: String, enum: ['User', 'Approver', 'Verifier', 'Dispatcher','Pleader', 'Admin', 'SuperAdmin'], default: 'User' },
    // user - Any Employee
    // approver - Executive Officer
    // verifier - Duty officer /Security Officer In-Charge of Premises
    // dispatcher - SLT or Non-SLT Security Officer
    // admin - Executive officer
    azureId: {
        type: String,
        unique: true,
        sparse: true
    },
    isAzureUser: {
        type: Boolean,
        default: false
    },
    lastAzureSync: {
        type: Date
    }
}, { timestamps: true });

// Add static method for finding users by role
userSchema.statics.findByRole = function(role) {
    return this.find({ role: role });
};

userSchema.statics.findByRoleAndBranch = function(role, branch) {
    return this.find({ 
        role: role, 
        branches: { $in: [branch] } 
    });
};

module.exports = mongoose.model('User', userSchema);


