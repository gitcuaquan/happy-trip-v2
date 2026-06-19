import mongoose from 'mongoose';

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB kết nối thành công');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
});