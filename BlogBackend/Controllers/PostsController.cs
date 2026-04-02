using BlogBackend.DTOs.Posts;
using BlogBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace BlogBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;

    public PostsController(IPostService postService)
    {
        _postService = postService;
    }

    [HttpGet]
    public async Task<ActionResult<List<PostResponseDto>>> GetPosts()
    {
        var posts = await _postService.GetAllAsync();
        return Ok(posts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PostResponseDto>> GetPostById(string id)
    {
        var post = await _postService.GetByIdAsync(id);

        if (post is null)
        {
            return NotFound();
        }

        return Ok(post);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<PostResponseDto>> CreatePost(CreatePostRequestDto request)
    {
        var currentUserId = GetCurrentUserId();

        if (currentUserId is null)
        {
            return Unauthorized();
        }

        var post = await _postService.CreateAsync(request, currentUserId);
        return CreatedAtAction(nameof(GetPostById), new { id = post.Id }, post);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult<PostResponseDto>> UpdatePost(string id, UpdatePostRequestDto request)
    {
        var existingPost = await _postService.GetByIdAsync(id);

        if (existingPost is null)
        {
            return NotFound();
        }

        if (!CanAccessOwnedResource(existingPost.AuthorId))
        {
            return Forbid();
        }

        var updatedPost = await _postService.UpdateAsync(id, request);

        if (updatedPost is null)
        {
            return NotFound();
        }

        return Ok(updatedPost);
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(string id)
    {
        var existingPost = await _postService.GetByIdAsync(id);

        if (existingPost is null)
        {
            return NotFound();
        }

        if (!CanAccessOwnedResource(existingPost.AuthorId))
        {
            return Forbid();
        }

        var deleted = await _postService.DeleteAsync(id);

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
