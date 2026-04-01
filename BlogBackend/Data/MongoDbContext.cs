using BlogBackend.Models;
using MongoDB.Driver;

namespace BlogBackend.Data
{
    public class MongoDbContext
    {
        private readonly IMongoDatabase _database;

        public MongoDbContext(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("MongoDb");
            var client = new MongoClient(connectionString);
            var databaseName = configuration.GetValue<string>("MongoDb:DatabaseName");
            _database = client.GetDatabase(databaseName);
        }

        public IMongoCollection<Post> Posts => _database.GetCollection<Post>("posts");
        public IMongoCollection<User> Users => _database.GetCollection<User>("users");
        public IMongoCollection<Comment> Comments => _database.GetCollection<Comment>("comments");
    }
}
