using BlogBackend.DTOs.Comments;
using BlogBackend.Services;
using Microsoft.AspNetCore.Mvc;

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

    [HttpPost]
    public async Task<ActionResult<CommentResponseDto>> CreateComment(CreateCommentRequestDto request)
    {
        var comment = await _commentService.CreateAsync(request);
        return CreatedAtAction(nameof(GetCommentById), new { id = comment.Id }, comment);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CommentResponseDto>> UpdateComment(string id, UpdateCommentRequestDto request)
    {
        var updatedComment = await _commentService.UpdateAsync(id, request);

        if (updatedComment is null)
        {
            return NotFound();
        }

        return Ok(updatedComment);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteComment(string id)
    {
        var deleted = await _commentService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
