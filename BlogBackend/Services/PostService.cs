using BlogBackend.Data;
using BlogBackend.DTOs.Posts;
using BlogBackend.Models;
using MongoDB.Driver;

namespace BlogBackend.Services;

public class PostService : IPostService
{
    private readonly MongoDbContext _dbContext;

    public PostService(MongoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<PostResponseDto>> GetAllAsync()
    {
        var posts = await _dbContext.Posts
            .Find(_ => true)
            .SortByDescending(post => post.CreatedAt)
            .ToListAsync();

        return posts.Select(MapToResponse).ToList();
    }

    public async Task<PostResponseDto?> GetByIdAsync(string id)
    {
        var post = await _dbContext.Posts
            .Find(post => post.Id == id)
            .FirstOrDefaultAsync();

        return post is null ? null : MapToResponse(post);
    }

    public async Task<PostResponseDto> CreateAsync(CreatePostRequestDto request, string authorId)
    {
        var post = new Post
        {
            Title = request.Title,
            Content = request.Content,
            AuthorId = authorId,
            FeaturedImage = request.FeaturedImage,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _dbContext.Posts.InsertOneAsync(post);

        return MapToResponse(post);
    }

    public async Task<PostResponseDto?> UpdateAsync(string id, UpdatePostRequestDto request)
    {
        var existingPost = await _dbContext.Posts
            .Find(post => post.Id == id)
            .FirstOrDefaultAsync();

        if (existingPost is null)
        {
            return null;
        }

        existingPost.Title = request.Title;
        existingPost.Content = request.Content;
        existingPost.FeaturedImage = request.FeaturedImage;
        existingPost.UpdatedAt = DateTime.UtcNow;

        await _dbContext.Posts.ReplaceOneAsync(post => post.Id == id, existingPost);

        return MapToResponse(existingPost);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _dbContext.Posts.DeleteOneAsync(post => post.Id == id);
        return result.DeletedCount > 0;
    }

    private static PostResponseDto MapToResponse(Post post)
    {
        return new PostResponseDto
        {
            Id = post.Id,
            Title = post.Title,
            Content = post.Content,
            AuthorId = post.AuthorId,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt,
            FeaturedImage = post.FeaturedImage
        };
    }
}
