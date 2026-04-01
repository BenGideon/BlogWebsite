using BlogBackend.DTOs.Posts;
using BlogBackend.Services;
using Microsoft.AspNetCore.Mvc;

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

    [HttpPost]
    public async Task<ActionResult<PostResponseDto>> CreatePost(CreatePostRequestDto request)
    {
        var post = await _postService.CreateAsync(request);
        return CreatedAtAction(nameof(GetPostById), new { id = post.Id }, post);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PostResponseDto>> UpdatePost(string id, UpdatePostRequestDto request)
    {
        var updatedPost = await _postService.UpdateAsync(id, request);

        if (updatedPost is null)
        {
            return NotFound();
        }

        return Ok(updatedPost);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(string id)
    {
        var deleted = await _postService.DeleteAsync(id);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
