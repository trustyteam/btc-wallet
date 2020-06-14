import mongoose from 'mongoose';

const url: string = process.env.DB_URI || 'mongodb://localhost:27017';

const connect = (): void => {
  mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
};

export default { connect, connection: mongoose.connection };
