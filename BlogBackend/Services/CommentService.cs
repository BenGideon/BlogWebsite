using BlogBackend.Data;
using BlogBackend.DTOs.Comments;
using BlogBackend.DTOs.Users;
using BlogBackend.Models;
using MongoDB.Driver;

namespace BlogBackend.Services;

public class CommentService : ICommentService
{
    private readonly MongoDbContext _dbContext;

    public CommentService(MongoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<CommentResponseDto>> GetAllAsync()
    {
        var comments = await _dbContext.Comments
            .Find(_ => true)
            .SortByDescending(comment => comment.CreatedAt)
            .ToListAsync();

        var authorMap = await BuildAuthorMapAsync(comments.Select(comment => comment.AuthorId));

        return comments
            .Select(comment => MapToResponse(comment, authorMap.GetValueOrDefault(comment.AuthorId)))
            .ToList();
    }

    public async Task<CommentResponseDto?> GetByIdAsync(string id)
    {
        var comment = await _dbContext.Comments
            .Find(comment => comment.Id == id)
            .FirstOrDefaultAsync();

        if (comment is null)
        {
            return null;
        }

        var authorMap = await BuildAuthorMapAsync([comment.AuthorId]);
        return MapToResponse(comment, authorMap.GetValueOrDefault(comment.AuthorId));
    }

    public async Task<CommentResponseDto> CreateAsync(CreateCommentRequestDto request, string authorId)
    {
        var comment = new Comment
        {
            PostId = request.PostId,
            AuthorId = authorId,
            Content = request.Content,
            ParentId = request.ParentId,
            CreatedAt = DateTime.UtcNow
        };

        await _dbContext.Comments.InsertOneAsync(comment);

        var authorMap = await BuildAuthorMapAsync([comment.AuthorId]);
        return MapToResponse(comment, authorMap.GetValueOrDefault(comment.AuthorId));
    }

    public async Task<CommentResponseDto?> UpdateAsync(string id, UpdateCommentRequestDto request)
    {
        var existingComment = await _dbContext.Comments
            .Find(comment => comment.Id == id)
            .FirstOrDefaultAsync();

        if (existingComment is null)
        {
            return null;
        }

        existingComment.Content = request.Content;

        await _dbContext.Comments.ReplaceOneAsync(comment => comment.Id == id, existingComment);

        var authorMap = await BuildAuthorMapAsync([existingComment.AuthorId]);
        return MapToResponse(existingComment, authorMap.GetValueOrDefault(existingComment.AuthorId));
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _dbContext.Comments.DeleteOneAsync(comment => comment.Id == id);
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

    private static CommentResponseDto MapToResponse(Comment comment, UserSummaryDto? author)
    {
        return new CommentResponseDto
        {
            Id = comment.Id,
            PostId = comment.PostId,
            AuthorId = comment.AuthorId,
            Author = author,
            Content = comment.Content,
            ParentId = comment.ParentId,
            CreatedAt = comment.CreatedAt
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
