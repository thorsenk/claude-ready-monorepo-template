import { faker } from '@faker-js/faker';

// Type definitions
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'user' | 'moderator';
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface Comment {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

// User factory
export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
    role: faker.helpers.arrayElement(['admin', 'user', 'moderator']),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    isActive: faker.datatype.boolean({ probability: 0.8 }),
    ...overrides
  };
}

// Admin user factory
export function createMockAdminUser(overrides: Partial<User> = {}): User {
  return createMockUser({
    role: 'admin',
    isActive: true,
    email: faker.internet.email({ firstName: 'admin' }),
    ...overrides
  });
}

// Post factory
export function createMockPost(overrides: Partial<Post> = {}): Post {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence({ min: 3, max: 8 }),
    content: faker.lorem.paragraphs(3),
    authorId: faker.string.uuid(),
    published: faker.datatype.boolean({ probability: 0.7 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    tags: faker.helpers.arrayElements(
      ['javascript', 'typescript', 'react', 'node', 'testing', 'performance'],
      { min: 1, max: 3 }
    ),
    ...overrides
  };
}

// Comment factory
export function createMockComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: faker.string.uuid(),
    content: faker.lorem.paragraph(),
    postId: faker.string.uuid(),
    authorId: faker.string.uuid(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides
  };
}

// Batch factories
export function createMockUsers(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createMockUser(overrides));
}

export function createMockPosts(count: number, overrides: Partial<Post> = {}): Post[] {
  return Array.from({ length: count }, () => createMockPost(overrides));
}

export function createMockComments(count: number, overrides: Partial<Comment> = {}): Comment[] {
  return Array.from({ length: count }, () => createMockComment(overrides));
}

// Related data factory - creates user with their posts and comments
export function createUserWithRelatedData(postCount: number = 3, commentCount: number = 5) {
  const user = createMockUser();
  
  const posts = Array.from({ length: postCount }, () => 
    createMockPost({ authorId: user.id })
  );
  
  const comments = Array.from({ length: commentCount }, () =>
    createMockComment({ 
      authorId: user.id,
      postId: faker.helpers.arrayElement(posts).id 
    })
  );
  
  return { user, posts, comments };
}

// API response factories
export function createMockApiResponse<T>(data: T, success: boolean = true) {
  return {
    success,
    data,
    timestamp: new Date().toISOString(),
    ...(success ? {} : { error: faker.lorem.sentence() })
  };
}

export function createMockPaginatedResponse<T>(
  items: T[], 
  page: number = 1, 
  limit: number = 10,
  total?: number
) {
  const actualTotal = total || items.length;
  const hasMore = page * limit < actualTotal;
  
  return {
    success: true,
    data: {
      items: items.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total: actualTotal,
        pages: Math.ceil(actualTotal / limit),
        hasMore
      }
    },
    timestamp: new Date().toISOString()
  };
}

// Error response factory
export function createMockErrorResponse(
  message: string = faker.lorem.sentence(),
  code: number = 400
) {
  return {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      requestId: faker.string.uuid()
    }
  };
}

// Database seed data factory
export function createSeedData() {
  const adminUser = createMockAdminUser({
    email: 'admin@example.com',
    name: 'Admin User'
  });
  
  const regularUsers = createMockUsers(10);
  const allUsers = [adminUser, ...regularUsers];
  
  const posts = allUsers.flatMap(user => 
    createMockPosts(faker.number.int({ min: 0, max: 5 }), { 
      authorId: user.id 
    })
  );
  
  const comments = posts.flatMap(post =>
    createMockComments(faker.number.int({ min: 0, max: 10 }), {
      postId: post.id,
      authorId: faker.helpers.arrayElement(allUsers).id
    })
  );
  
  return {
    users: allUsers,
    posts,
    comments
  };
}

// Test scenario factories
export interface TestScenario {
  name: string;
  description: string;
  data: any;
  expectedResult: any;
}

export function createAuthScenarios(): TestScenario[] {
  return [
    {
      name: 'Valid login',
      description: 'User logs in with correct credentials',
      data: {
        email: 'user@example.com',
        password: 'password123'
      },
      expectedResult: {
        success: true,
        user: expect.objectContaining({ email: 'user@example.com' })
      }
    },
    {
      name: 'Invalid password',
      description: 'User attempts login with wrong password',
      data: {
        email: 'user@example.com',
        password: 'wrongpassword'
      },
      expectedResult: {
        success: false,
        error: expect.stringContaining('Invalid credentials')
      }
    },
    {
      name: 'Non-existent user',
      description: 'Login attempt with non-existent email',
      data: {
        email: 'nonexistent@example.com',
        password: 'password123'
      },
      expectedResult: {
        success: false,
        error: expect.stringContaining('User not found')
      }
    }
  ];
}

// Performance test data factory
export function createPerformanceTestData(size: 'small' | 'medium' | 'large' = 'medium') {
  const sizes = {
    small: { users: 100, posts: 500, comments: 1000 },
    medium: { users: 1000, posts: 5000, comments: 10000 },
    large: { users: 10000, posts: 50000, comments: 100000 }
  };
  
  const config = sizes[size];
  
  console.log(`Generating ${size} performance test dataset...`);
  console.log(`Users: ${config.users}, Posts: ${config.posts}, Comments: ${config.comments}`);
  
  const users = createMockUsers(config.users);
  const posts = createMockPosts(config.posts);
  const comments = createMockComments(config.comments);
  
  return { users, posts, comments };
}