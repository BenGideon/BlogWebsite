using BlogBackend.DTOs.Comments;
using BlogBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly ICommentService _commentService;

    public CommentsController(ICommentService commentService)
    {
        _commentService = commentService;
    }

    [HttpGet]
    public async Task<ActionResult<List<CommentResponseDto>>> GetComments()
    {
        var comments = await _commentService.GetAllAsync();
        return Ok(comments);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CommentResponseDto>> GetCommentById(string id)
    {
        var comment = await _commentService.GetByIdAsync(id);

        if (comment is null)
        {
            return NotFound();
        }

        return Ok(comment);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<CommentResponseDto>> CreateComment(CreateCommentRequestDto request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var comment = await _commentService.CreateAsync(request, currentUserId);
        return CreatedAtAction(nameof(GetCommentById), new { id = comment.Id }, comment);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<CommentResponseDto>> UpdateComment(string id, UpdateCommentRequestDto request)
    {
        var existingComment = await _commentService.GetByIdAsync(id);

        if (existingComment is null)
        {
            return NotFound();
        }

        if (!CanAccessOwnedResource(existingComment.AuthorId))
        {
            return Forbid();
        }

        var updatedComment = await _commentService.UpdateAsync(id, request);

        if (updatedComment is null)
        {
            return NotFound();
        }

        return Ok(updatedComment);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(string id)
    {
        var existingComment = await _commentService.GetByIdAsync(id);

        if (existingComment is null)
        {
            return NotFound();
        }

        if (!CanAccessOwnedResource(existingComment.AuthorId))
        {
            return Forbid();
        }

        var deleted = await _commentService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier);
    }

    private bool CanAccessOwnedResource(string ownerId)
    {
        var currentUserId = GetCurrentUserId();

        return currentUserId is not null &&
               (currentUserId == ownerId || User.IsInRole("admin"));
    }
}
