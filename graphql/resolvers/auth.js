const bcrypt = require("bcrypt");
const User = require("../../models/User");
const {getEvents} = require('./merge')
const jwt = require('jsonwebtoken')


module.exports = {
    user: async () => {
      const user = await User.find();
    //   console.log(user)
      return user.map(u => {
        console.log("u", u.createdEvents);
        return {
          ...u._doc,
          _id: u._doc._id.toString(),
          password: null,
          createdEvents: getEvents.bind(this, u._doc.createdEvents)
        };
      });
    },
    createUser: async args => {
      const password = await bcrypt.hash(args.userInput.password, 12);
      const existingUser = await User.findOne({
        username: args.userInput.username
      });
      if (existingUser) {
        throw new Error("User already exists");
      }
      const user = new User({
        username: args.userInput.username,
        password
      });
      const savedUser = await user.save();
      console.log('saved user', savedUser)
      return { ...savedUser._doc, _id: savedUser.id, password: null };
    },

    login: async ({username,password}) => {
        console.log(`here`)
        const user = await User.findOne({username:username})
        if(!user){
            throw new Error('User not found')
        }
        const verified = await bcrypt.compare(password,user.password)
        console.log(`v`,verified)
        if(!verified){
            throw new Error('Wrong credentials')
        }
        const token = await jwt.sign({userId:user.id, username:user.username}, 'quiteasecret', {expiresIn:'1h'})
        console.log(token)
        return {
            userId: user.id,
            token,
            tokenExpiration: 1
        }
    }
  }