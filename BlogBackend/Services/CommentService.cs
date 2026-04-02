using BlogBackend.Data;
using BlogBackend.DTOs.Comments;
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

        return comments.Select(MapToResponse).ToList();
    }

    public async Task<CommentResponseDto?> GetByIdAsync(string id)
    {
        var comment = await _dbContext.Comments
            .Find(comment => comment.Id == id)
            .FirstOrDefaultAsync();

        return comment is null ? null : MapToResponse(comment);
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

        return MapToResponse(comment);
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

        return MapToResponse(existingComment);
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _dbContext.Comments.DeleteOneAsync(comment => comment.Id == id);
        return result.DeletedCount > 0;
    }

    private static CommentResponseDto MapToResponse(Comment comment)
    {
        return new CommentResponseDto
        {
            Id = comment.Id,
            PostId = comment.PostId,
            AuthorId = comment.AuthorId,
            Content = comment.Content,
            ParentId = comment.ParentId,
            CreatedAt = comment.CreatedAt
        };
    }
}
