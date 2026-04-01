using BlogBackend.Data;
using BlogBackend.Models;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

namespace BlogBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PostsController : ControllerBase
{
    private readonly MongoDbContext _dbContext;

    public PostsController(MongoDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet]
    public async Task<ActionResult<List<Post>>> GetPosts()
    {
        var posts = await _dbContext.Posts
            .Find(_ => true)
            .SortByDescending(post => post.CreatedAt)
            .ToListAsync();

        return Ok(posts);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Post>> GetPostById(string id)
    {
        var post = await _dbContext.Posts
            .Find(post => post.Id == id)
            .FirstOrDefaultAsync();

        if (post is null)
        {
            return NotFound();
        }

        return Ok(post);
    }

    [HttpPost]
    public async Task<ActionResult<Post>> CreatePost(Post post)
    {
        post.CreatedAt = DateTime.UtcNow;
        post.UpdatedAt = DateTime.UtcNow;

        await _dbContext.Posts.InsertOneAsync(post);

        return CreatedAtAction(nameof(GetPostById), new { id = post.Id }, post);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Post>> UpdatePost(string id, Post updatedPost)
    {
        var existingPost = await _dbContext.Posts
            .Find(post => post.Id == id)
            .FirstOrDefaultAsync();

        if (existingPost is null)
        {
            return NotFound();
        }

        updatedPost.Id = existingPost.Id;
        updatedPost.CreatedAt = existingPost.CreatedAt;
        updatedPost.UpdatedAt = DateTime.UtcNow;

        await _dbContext.Posts.ReplaceOneAsync(post => post.Id == id, updatedPost);

        return Ok(updatedPost);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePost(string id)
    {
        var result = await _dbContext.Posts.DeleteOneAsync(post => post.Id == id);

        if (result.DeletedCount == 0)
        {
            return NotFound();
        }

        return NoContent();
    }
}
