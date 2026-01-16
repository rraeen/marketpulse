import { NextResponse } from "next/server";
import {
  deletePost,
  getPostById,
  isValidCategory,
  isValidStatus,
  updatePost,
} from "@/lib/services/post";
import { isValidObjectId } from "@/lib/utils/objectid-validation";

// Note: Admin authorization is handled by proxy for /api/admin/* routes

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: "Invalid post ID format" },
      { status: 400 }
    );
  }

  try {
    const post = await getPostById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json(post);
  } catch (error) {
    console.error("Admin get post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: "Invalid post ID format" },
      { status: 400 }
    );
  }

  try {
    const data = await request.json();

    if (data.categoryId && !isValidCategory(data.categoryId)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    if (data.status && !isValidStatus(data.status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be Draft or Published." },
        { status: 400 }
      );
    }

    const post = await updatePost(id, data);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("Admin update post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Validate ObjectId format
  if (!isValidObjectId(id)) {
    return NextResponse.json(
      { error: "Invalid post ID format" },
      { status: 400 }
    );
  }

  try {
    const deleted = await deletePost(id);
    if (!deleted) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Post deleted" }, { status: 200 });
  } catch (error) {
    console.error("Admin delete post error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
