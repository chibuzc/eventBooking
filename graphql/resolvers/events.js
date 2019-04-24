const Event = require("../../models/Event");
const User = require("../../models/User");
const {dateToString} = require("../../utils/Date")
const{ getUser } =require('./merge')

const transformEvent = event => {
    return {
      ...event._doc,
      _id: event._doc._id.toString(),
      creationUser: getUser.bind(this, event._doc.creationUser)
    };
  }

module.exports = {
    events: async () => {
      const allEvents = await Event.find();
      return allEvents.map(async e => {
        console.log(e._doc.creationUser);
        return transformEvent(e);
      });
    },
    createEvents: async (args, req) => {
        if(!req.isAuth){
            throw new Error ('unauthorized')
        }
      const event = new Event({
        title: args.eventInput.title,
        description: args.eventInput.description,
        price: +args.eventInput.price,
        date: new Date(args.eventInput.date),
        creationUser: req.userId
      });
      try {
        const creator = await User.findById(event.creationUser);
        if (!creator) {
          throw new Error("oops");
        }
        const savedEvent = await event.save();
        console.log(savedEvent._doc);
        creator.createdEvents.push(savedEvent._id);
        const savedCreator = await creator.save();
        return {
          ...savedEvent._doc,
          _id: savedEvent._doc._id.toString(),
          date: dateToString(event._doc.date),
          creationUser: getUser.bind(this, savedEvent._doc.creationUser)
        };
      } catch (error) {
        console.log(error);
        throw error;
      }
    },
  }