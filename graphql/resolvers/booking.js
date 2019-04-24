const Event = require("../../models/Event");
const Booking = require("../../models/Bookings")
const {dateToString} = require("../../utils/Date")
const {getUser,singleEvent} = require("./merge")

const transformEvent = event => {
    return {
      ...event._doc,
      _id: event._doc._id.toString(),
      creationUser: getUser.bind(this, event._doc.creationUser)
    };
  }

module.exports = {
    
    bookings: async () => {
        const bookings = await Booking.find()
        console.log(bookings)
        return bookings.map(b => {
            return {
                ...b._doc,
                _id: b._doc._id,
                event: singleEvent.bind(this, b._doc.event),
                user: getUser.bind(this, b._doc.user),
                // createdAt: new Date(b._doc.createdAt).toISOString(),
                // updatedAt: new Date(b._doc.updatedAt).toISOString()
            }
        })
    },
    createBooking: async (args, req) => {
        if(!req.isAuth){
            throw new Error('Unauthorized')
        }
        const event = await Event.findById(args.eventId)
        console.log(`event`,event)
        const booking = new Booking({
            user: req.userId,
            event
        })
        console.log(`booking`, booking._doc)
        const savedBooking = await booking.save()
        console.log(`savedBooking`,savedBooking)
        return {
            ...savedBooking._doc,
            user: getUser(savedBooking._doc.user),
            event: singleEvent(savedBooking._doc.event),
            createdAt: dateToString(savedBooking._doc.createdAt),
            updatedAt: dateToString(savedBooking._doc.updatedAt)
        }
    },

    cancelBooking: async (args,req) => {
        if(!req.isAuth){
            throw new Error('Unauthorized')
        }
        try{
        const booking = await Booking.findOne({_id:args.bookingId}).populate('event')
        // console.log(booking)
        const event = transformEvent(booking.event)
        await Booking.deleteOne({_id:args.bookingId})
        console.log(event)
        return event
    }catch(err){
        throw (err)
    }
    } 
  }