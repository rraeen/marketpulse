import { NextResponse } from "next/server";
import {
  deletePost,
  getPostById,
  isValidStatus,
  updatePost,
} from "@/lib/services/post";
import { isValidObjectId } from "@/lib/utils/objectid-validation";
import { serializePost } from "@/lib/utils/serialize";
import { ObjectId } from 'mongodb';
import { requireCsrfToken } from '@/lib/utils/csrf';

// Note: Admin authorization is handled by proxy for /api/admin/* routes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let { id } = await params;
  
  // Trim whitespace and decode URL encoding
  id = decodeURIComponent(id.trim());
  
  // Log the received ID for debugging
  console.log("Admin GET post - received ID:", id, "Type:", typeof id, "Length:", id.length);

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    console.error("Admin GET post - invalid ID format:", id, "isValid check failed");
    // Try to provide more details about why validation failed
    try {
      const testObjId = new ObjectId(id);
      console.error("Admin GET post - ObjectId conversion succeeded, but validation failed. Converted:", testObjId.toString(), "Original:", id);
    } catch (e) {
      console.error("Admin GET post - ObjectId conversion also failed:", e);
    }
    return NextResponse.json(
      { error: "Invalid post ID format" },
      { status: 400 }
    );
  }

  try {
    const post = await getPostById(id);
    if (!post) {
      console.error("Admin GET post - post not found for ID:", id);
      // Try to query all posts to see what IDs exist (for debugging)
      try {
        const { getDb } = await import('@/lib/db');
        const db = await getDb();
        const postsCollection = db.collection('posts');
        const allPosts = await postsCollection.find({}).limit(5).toArray();
        console.error("Admin GET post - Sample post IDs in DB:", allPosts.map(p => p._id?.toString()));
      } catch (debugError) {
        console.error("Admin GET post - Could not query DB for debugging:", debugError);
      }
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    console.log("Admin GET post - found post:", post._id?.toString(), "Status:", post.status);
    try {
      return NextResponse.json(serializePost(post));
    } catch (serializeError) {
      console.error("Post serialization error:", serializeError);
      // Fallback: return post without serialization
      return NextResponse.json({
        ...post,
        _id: post._id?.toString() || '',
        adminId: post.adminId.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      });
    }
  } catch (error) {
    console.error("Admin get post error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // CSRF protection
  const csrfCheck = await requireCsrfToken(request);
  if (!csrfCheck.valid) {
    return NextResponse.json(
      { error: csrfCheck.error || 'CSRF validation failed' },
      { status: 403 }
    );
  }

  let { id } = await params;
  
  // Trim whitespace and decode URL encoding
  id = decodeURIComponent(id.trim());
  
  // Log the received ID for debugging
  console.log("Admin PATCH post - received ID:", id, "Type:", typeof id, "Length:", id.length);

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    console.error("Admin PATCH post - invalid ID format:", id);
    return NextResponse.json(
      { error: "Invalid post ID format" },
      { status: 400 }
    );
  }

  try {
    const data = await request.json();
    console.log("Admin PATCH post - update data:", { 
      status: data.status, 
      title: data.title?.substring(0, 30),
      hasBody: !!data.body,
      categoryId: data.categoryId,
      isTrending: data.isTrending
    });

    // Validate categoryId if provided
    if (data.categoryId) {
      if (!isValidObjectId(data.categoryId)) {
        return NextResponse.json({ error: "Invalid category ID format" }, { status: 400 });
      }
      // Convert to ObjectId
      data.categoryId = new ObjectId(data.categoryId);
    }

    if (data.status && !isValidStatus(data.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be Draft or Published." },
        { status: 400 }
      );
    }

    // Validate isTrending if provided
    if (data.isTrending !== undefined && typeof data.isTrending !== 'boolean') {
      return NextResponse.json(
        { error: "isTrending must be a boolean" },
        { status: 400 }
      );
    }

    const post = await updatePost(id, data);
    if (!post) {
      console.error("Admin PATCH post - post not found for ID:", id);
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    console.log("Admin PATCH post - successfully updated:", post._id?.toString(), "Status:", post.status);

    try {
      return NextResponse.json(serializePost(post));
    } catch (serializeError) {
      console.error("Post serialization error:", serializeError);
      // Fallback: return post without serialization (NextResponse will handle it)
      return NextResponse.json({
        ...post,
        _id: post._id?.toString() || '',
        adminId: post.adminId.toString(),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      });
    }
  } catch (error) {
    console.error("Admin update post error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // CSRF protection
  const csrfCheck = await requireCsrfToken(request);
  if (!csrfCheck.valid) {
    return NextResponse.json(
      { error: csrfCheck.error || 'CSRF validation failed' },
      { status: 403 }
    );
  }

  let { id } = await params;
  
  // Trim whitespace and decode URL encoding
  id = decodeURIComponent(id.trim());
  
  console.log("Admin DELETE post - received ID:", id, "Type:", typeof id, "Length:", id.length);

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    console.error("Admin DELETE post - invalid ID format:", id);
    return NextResponse.json(
      { error: "Invalid post ID format" },
      { status: 400 }
    );
  }

  try {
    const deleted = await deletePost(id);
    if (!deleted) {
      // Post doesn't exist - return 404
      // Note: This could mean the post was already deleted, but we return 404 for consistency
      console.log("Admin DELETE post - Post not found (may have been already deleted):", id);
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    console.log("Admin DELETE post - successfully deleted:", deleted._id?.toString());
    return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Admin delete post error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
