const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const graphqlHTTP = require('express-graphql')
const {buildSchema} = require('graphql')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Event = require('./models/Event')
const User = require('./models/User')
const {DB_USER, DB_PASS} = require('./config')




app.use(bodyParser.json())
const DB_URL = `mongodb://127.0.0.1:27017/eventBooking`;

const getUser = async userId => {
    const user = await User.findById(userId)
    // console.log(`getUser`,user)
    return {
        ...user._doc,
        _id: user.id,
        createdEvents: getEvents.bind(this, user._doc.createdEvents)
      };
}

const getEvents = async eventsIds => {
    console.log(eventsIds)
    const events = await Event.find({_id : {$in : eventsIds}})
    console.log('gotEvents', events)
    return events.map(e => {
        return { ...e._doc, _id: e._doc._id, creationUser: getUser.bind(this,e.creationUser) }
    })
    // console.log( 'events', events)
    // return events
}

app.use(
    '/graphql',
    graphqlHTTP({
        schema: buildSchema(`
            type User{
                _id: ID!
                username: String!
                password: String
                createdEvents: [Event]
            }

            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
                creationUser: User!
            }

            input UserInput {
                username: String!
                password: String!
            }

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!

            }
        
            type RootQuery {
                events: [Event!]!
                user: [User!]!
            }
            type RootMutation {
                createEvents(eventInput: EventInput): Event
                createUser(userInput: UserInput): User
            }
            schema {
                query: RootQuery
                mutation: RootMutation
            } 
        
        `),
        rootValue: {
            events: async () => {
              const allEvents = await Event.find()
              return allEvents.map(async e => {
                  console.log(e._doc.creationUser)
                  return {...e._doc, _id: e._doc._id.toString(), creationUser: getUser.bind(this, e._doc.creationUser)}
              })      
            },
            createEvents: async args => {
              const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creationUser: "5cb1d0ebd1151f6f20b829bd"
              });
              try {
                const creator = await User.findById(event.creationUser)
                if(!creator){
                    throw new Error ('oops')
                }
                const savedEvent = await event.save()
                console.log(savedEvent._doc)
                creator.createdEvents.push(savedEvent._id)
                const savedCreator = await creator.save()
                return { ...savedEvent._doc, _id: savedEvent._doc._id.toString() };
              } catch (error) {
                  console.log(error)
                  throw error
              }
            },
            user: async () => {
                const user = await User.find()
                // console.log(user)
                return user.map(u => {
                    console.log('u',u.createdEvents)
                    return {...u._doc, _id:u._doc._id.toString(),password:null, createdEvents:getEvents.bind(this,u._doc.createdEvents)}
                })
            },
            createUser: async args => {
                const password = await bcrypt.hash(args.userInput.password, 12)
                const existingUser = await User.findOne({username: args.userInput.username})
                if(existingUser){
                    throw new Error('User already exists')
                }
                const user = new User({
                    username: args.userInput.username,
                    password
                })
                const savedUser = await user.save()
                return {...savedUser, _id: savedUser.id, password:null}
            }
          },
        graphiql: true
    })
);

app.get('/', (req,res,next)=>{
   
    res.send('HELLO World')
})


mongoose.connect(DB_URL, ()=>{console.log(mongoose.connection.readyState)}).then(() => {
    app.listen(8080, 'localhost', ()=> {console.log('Server is up and running!!!')});
  })
  .catch(err => {
    console.log(err);
  });