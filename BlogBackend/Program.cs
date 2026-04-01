using BlogBackend.Data;
using BlogBackend.Services;

var builder = WebApplication.CreateBuilder(args);

// Register framework and application services.
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddSingleton<MongoDbContext>();
builder.Services.AddScoped<IPostService, PostService>();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();
