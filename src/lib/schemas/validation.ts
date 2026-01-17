import { Db } from "mongodb";

export async function ensureCollectionSchemas(db: Db) {
  // Users Collection Schema
  const usersSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "name",
        "email",
        "passwordHash",
        "role",
        "isPremiumInterested",
        "createdAt",
      ],
      properties: {
        name: {
          bsonType: "string",
          description: "User name is required and must be a string",
        },
        email: {
          bsonType: "string",
          pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          description: "Email is required and must be a valid email format",
        },
        passwordHash: {
          bsonType: "string",
          description: "Password hash is required and must be a string",
        },
        role: {
          enum: ["Admin", "User"],
          description: "Role must be either Admin or User",
        },
        isPremiumInterested: {
          bsonType: "bool",
          description: "isPremiumInterested must be a boolean",
        },
        createdAt: {
          bsonType: "date",
          description: "createdAt must be a date",
        },
      },
    },
  };

  // Posts Collection Schema
  const postsSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: [
        "title",
        "body",
        "categoryId",
        "status",
        "adminId",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        title: {
          bsonType: "string",
          description: "Title is required and must be a string",
        },
        body: {
          bsonType: "string",
          description: "Body is required and must be a string",
        },
        featuredImageUrl: {
          bsonType: "string",
          description: "Featured image URL must be a string if provided",
        },
        categoryId: {
          bsonType: "objectId",
          description: "Category ID is required and must be an ObjectId reference",
        },
        status: {
          enum: ["Draft", "Published"],
          description: "Status must be either Draft or Published",
        },
        adminId: {
          bsonType: "objectId",
          description: "Admin ID is required and must be an ObjectId",
        },
        createdAt: {
          bsonType: "date",
          description: "createdAt must be a date",
        },
        updatedAt: {
          bsonType: "date",
          description: "updatedAt must be a date",
        },
      },
    },
  };

  // Categories Collection Schema
  const categoriesSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "slug", "order", "isActive", "createdAt", "updatedAt"],
      properties: {
        name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 100,
          description: "Category name is required (1-100 characters)",
        },
        slug: {
          bsonType: "string",
          pattern: "^[a-z0-9-]+$",
          description: "Slug must be lowercase alphanumeric with hyphens only",
        },
        parentId: {
          bsonType: ["objectId", "null"],
          description: "Parent category ID (null for main categories)",
        },
        order: {
          bsonType: "int",
          minimum: 0,
          description: "Order must be a non-negative integer",
        },
        isActive: {
          bsonType: "bool",
          description: "Active status flag",
        },
        createdAt: {
          bsonType: "date",
          description: "Creation timestamp",
        },
        updatedAt: {
          bsonType: "date",
          description: "Last update timestamp",
        },
      },
    },
  };

  // Notification Log Schema
  const notificationLogSchema = {
    $jsonSchema: {
      bsonType: "object",
      required: ["postId", "sentAt", "status"],
      properties: {
        postId: {
          bsonType: "objectId",
          description: "Post ID is required and must be an ObjectId",
        },
        userId: {
          bsonType: "objectId",
          description: "User ID must be an ObjectId if provided",
        },
        email: {
          bsonType: "string",
          description: "Email must be a string if provided",
        },
        sentAt: {
          bsonType: "date",
          description: "sentAt is required and must be a date",
        },
        status: {
          enum: ["Success", "Failed"],
          description: "Status must be either Success or Failed",
        },
        error: {
          bsonType: "string",
          description: "Error message must be a string if provided",
        },
      },
    },
  };

  try {
    // Apply schema validation to users collection
    await db
      .command({
        collMod: "users",
        validator: usersSchema,
        validationLevel: "strict",
        validationAction: "error",
      })
      .catch(async (err) => {
        // If collection doesn't exist, create it with validation
        if (err.codeName === "NamespaceNotFound") {
          await db.createCollection("users", {
            validator: usersSchema,
            validationLevel: "strict",
            validationAction: "error",
          });
        }
      });

    // Apply schema validation to posts collection
    await db
      .command({
        collMod: "posts",
        validator: postsSchema,
        validationLevel: "strict",
        validationAction: "error",
      })
      .catch(async (err) => {
        if (err.codeName === "NamespaceNotFound") {
          await db.createCollection("posts", {
            validator: postsSchema,
            validationLevel: "strict",
            validationAction: "error",
          });
        }
      });

    // Apply schema validation to categories collection
    await db
      .command({
        collMod: "categories",
        validator: categoriesSchema,
        validationLevel: "strict",
        validationAction: "error",
      })
      .catch(async (err) => {
        if (err.codeName === "NamespaceNotFound") {
          await db.createCollection("categories", {
            validator: categoriesSchema,
            validationLevel: "strict",
            validationAction: "error",
          });
        }
      });

    // Apply schema validation to notificationLog collection
    await db
      .command({
        collMod: "notificationLog",
        validator: notificationLogSchema,
        validationLevel: "strict",
        validationAction: "error",
      })
      .catch(async (err) => {
        if (err.codeName === "NamespaceNotFound") {
          await db.createCollection("notificationLog", {
            validator: notificationLogSchema,
            validationLevel: "strict",
            validationAction: "error",
          });
        }
      });

    console.log("✅ MongoDB schema validation applied successfully");
  } catch (error) {
    console.error("⚠️  Error applying MongoDB schema validation:", error);
  }
}
