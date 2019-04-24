const {buildSchema} = require('graphql')

module.exports = buildSchema(`

type Booking{
    _id: ID!
    event: Event!
    user: User!
    createdAt: String!
    updatedAt: String!
}

type User{
    _id: ID!
    username: String!
    password: String
    createdEvents: [Event]
}

type AuthData{
    userId: ID!
    token: String!
    tokenExpiration: Int!
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
    bookings: [Booking!]!
    login(username:String, password: String!): AuthData!
}
type RootMutation {
    createEvents(eventInput: EventInput): Event
    createUser(userInput: UserInput): User
    createBooking(eventId: ID!): Booking
    cancelBooking(bookingId: ID!): Event!
}
schema {
    query: RootQuery
    mutation: RootMutation
} 

`)