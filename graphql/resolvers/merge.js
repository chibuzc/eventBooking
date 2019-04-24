const Event = require("../../models/Event");
const User = require("../../models/User");
const {dateToString} = require("../../utils/Date")

const transformEvent = event => {
    return {
      ...event._doc,
      _id: event._doc._id.toString(),
      creationUser: getUser.bind(this, event._doc.creationUser)
    };
  }


const getUser = async userId => {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      password: null,
      createdEvents: getEvents.bind(this, user._doc.createdEvents)
    };
  };
  
  const getEvents = async eventsIds => {
    console.log(eventsIds);
    const events = await Event.find({ _id: { $in: eventsIds } });
    console.log("gotEvents", events);
    return events.map(e => {
      return {
        ...e._doc,
        _id: e._doc._id,
        creationUser: getUser.bind(this, e.creationUser),
        date: dateToString(e._doc.date)
      };
    });
  };

  const singleEvent = async eventId => {
      const event = await Event.findById(eventId)
      return transformEvent(event)
  }

module.exports.getUser = getUser
module.exports.getEvents = getEvents
module.exports.singleEvent = singleEvent