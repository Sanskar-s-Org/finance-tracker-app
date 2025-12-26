import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import Budget from '../models/Budget.js';

export const updateProfile = async (req, res) => {
    try {
        const { name, email, currency } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email !== user.email) {
            const emailExists = await User.findOne({ email });
            if (emailExists) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
        }

        user.name = name || user.name;
        user.email = email || user.email;
        user.currency = currency || user.currency;

        await user.save();

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                currency: user.currency,
                preferences: user.preferences,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Current password is incorrect' });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updatePreferences = async (req, res) => {
    try {
        const { preferences } = req.body;

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.preferences = {
            ...user.preferences,
            ...preferences,
        };

        await user.save();

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                currency: user.currency,
                preferences: user.preferences,
            },
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Delete all user data properly
        await Promise.all([
            Transaction.deleteMany({ user: req.user._id }),
            Category.deleteMany({ user: req.user._id, isDefault: false }), // Keep default categories
            Budget.deleteMany({ user: req.user._id }),
            User.findByIdAndDelete(req.user._id),
        ]);

        // Clear cookie
        res.clearCookie('token');

        res.json({
            success: true,
            message: 'Account deleted successfully',
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
