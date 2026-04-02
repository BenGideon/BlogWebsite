using BlogBackend.Data;
using BlogBackend.DTOs.Posts;
using BlogBackend.DTOs.Users;
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

        var authorMap = await BuildAuthorMapAsync(posts.Select(post => post.AuthorId));

        return posts
            .Select(post => MapToResponse(post, authorMap.GetValueOrDefault(post.AuthorId)))
            .ToList();
    }

    public async Task<PostResponseDto?> GetByIdAsync(string id)
    {
        var post = await _dbContext.Posts
            .Find(post => post.Id == id)
            .FirstOrDefaultAsync();

        if (post is null)
        {
            return null;
        }

        var authorMap = await BuildAuthorMapAsync([post.AuthorId]);
        return MapToResponse(post, authorMap.GetValueOrDefault(post.AuthorId));
    }

    public async Task<PostResponseDto> CreateAsync(CreatePostRequestDto request, string authorId)
    {
        var post = new Post
        {
            Title = request.Title,
            Content = request.Content,
            AuthorId = authorId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _dbContext.Posts.InsertOneAsync(post);

        var authorMap = await BuildAuthorMapAsync([post.AuthorId]);
        return MapToResponse(post, authorMap.GetValueOrDefault(post.AuthorId));
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
        existingPost.UpdatedAt = DateTime.UtcNow;

        await _dbContext.Posts.ReplaceOneAsync(post => post.Id == id, existingPost);

        var authorMap = await BuildAuthorMapAsync([existingPost.AuthorId]);
        return MapToResponse(existingPost, authorMap.GetValueOrDefault(existingPost.AuthorId));
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _dbContext.Posts.DeleteOneAsync(post => post.Id == id);
        return result.DeletedCount > 0;
    }

    private async Task<Dictionary<string, UserSummaryDto>> BuildAuthorMapAsync(IEnumerable<string> authorIds)
    {
        var uniqueAuthorIds = authorIds
            .Where(authorId => !string.IsNullOrWhiteSpace(authorId))
            .Distinct()
            .ToList();

        if (uniqueAuthorIds.Count == 0)
        {
            return [];
        }

        var users = await _dbContext.Users
            .Find(user => uniqueAuthorIds.Contains(user.Id))
            .ToListAsync();

        return users.ToDictionary(user => user.Id, MapUserSummary);
    }

    private static PostResponseDto MapToResponse(Post post, UserSummaryDto? author)
    {
        return new PostResponseDto
        {
            Id = post.Id,
            Title = post.Title,
            Content = post.Content,
            AuthorId = post.AuthorId,
            Author = author,
            CreatedAt = post.CreatedAt,
            UpdatedAt = post.UpdatedAt
        };
    }

    private static UserSummaryDto MapUserSummary(User user)
    {
        var displayName = $"{user.Profile.FirstName} {user.Profile.LastName}".Trim();

        return new UserSummaryDto
        {
            Id = user.Id,
            Username = user.Username,
            DisplayName = string.IsNullOrWhiteSpace(displayName) ? null : displayName
        };
    }
}
