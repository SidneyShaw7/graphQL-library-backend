const { createTestClient } = require('apollo-server-testing')
const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

const { typeDefs, resolvers } = require('../index')
const Book = require('../models/book')
const Author = require('../models/author')

let mongoServer

// Setup a mock MongoDB server in memory for testing
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
})

// Close the mock MongoDB server after all tests
afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

// Clear the database and reseed data before each test
beforeEach(async () => {
  await mongoose.connection.db.dropDatabase()
  // Seed data if needed
  // Example: await Book.create({ title: 'Test Book', author: 'Test Author', genres: ['Test Genre'] });
})

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { query } = createTestClient(server)

describe('GraphQL Resolvers', () => {
  describe('Query: allBooks', () => {
    test('should return all books when no filters are applied', async () => {
      // Arrange: Seed some test data
      await Book.create({
        title: 'Book 1',
        author: 'Author 1',
        genres: ['Genre 1'],
      })
      await Book.create({
        title: 'Book 2',
        author: 'Author 2',
        genres: ['Genre 2'],
      })

      // Act: Perform the GraphQL query
      const response = await query({
        query: gql`
          query {
            allBooks {
              title
              author
              genres
            }
          }
        `,
      })

      // Assert: Check the response
      expect(response.errors).toBeUndefined()
      expect(response.data.allBooks).toHaveLength(2)
    })
  })
})
