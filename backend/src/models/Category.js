import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [30, 'Category name cannot exceed 30 characters'],
    },
    type: {
      type: String,
      enum: ['income', 'expense'],
      required: true,
    },
    icon: {
      type: String,
      default: '📊',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function () {
        return !this.isDefault;
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate categories for a user
categorySchema.index({ name: 1, user: 1, type: 1 }, { unique: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
