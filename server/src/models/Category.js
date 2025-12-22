import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  slug: { type: String, unique: true },
}, { timestamps: true });

categorySchema.pre('save', async function () {
  if (this.name) {
    this.slug = this.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
