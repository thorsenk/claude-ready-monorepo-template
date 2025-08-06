import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { join } from 'path';

// Swagger configuration
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Template API')
    .setDescription('Claude-Ready Monorepo Template API Documentation')
    .setVersion('1.0.0')
    .setContact(
      'API Support',
      'https://github.com/your-username/template-repo',
      'support@example.com'
    )
    .setLicense(
      'MIT',
      'https://github.com/your-username/template-repo/blob/main/LICENSE'
    )
    .addServer('http://localhost:3001', 'Local development')
    .addServer('https://api-staging.example.com', 'Staging environment')
    .addServer('https://api.example.com', 'Production environment')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'X-API-Key',
        in: 'header',
        description: 'API key for authentication'
      },
      'API-Key'
    )
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('posts', 'Blog posts management')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    deepScanRoutes: true,
  });

  // Customize the Swagger UI
  const customOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      showRequestHeaders: true,
      docExpansion: 'none', // 'list', 'full', 'none'
      defaultModelsExpandDepth: 2,
      defaultModelExpandDepth: 2,
      tryItOutEnabled: true,
    },
    customSiteTitle: 'Template API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info hgroup.main h2 { color: #3b82f6; }
    `,
  };

  // Setup Swagger UI
  SwaggerModule.setup('docs', app, document, customOptions);
  SwaggerModule.setup('api-docs', app, document); // Alternative path

  // Generate OpenAPI JSON file for external tools
  if (process.env.NODE_ENV === 'development') {
    const outputPath = join(process.cwd(), 'openapi.json');
    writeFileSync(outputPath, JSON.stringify(document, null, 2));
    console.log(`📄 OpenAPI specification written to: ${outputPath}`);
  }
}

// DTO examples with OpenAPI decorators
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email'
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    minLength: 2,
    maxLength: 100
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8,
    format: 'password'
  })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    format: 'uri'
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  email: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe'
  })
  name: string;

  @ApiPropertyOptional({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg'
  })
  avatar?: string;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time'
  })
  updatedAt: Date;
}

// Controller example with full OpenAPI documentation
import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiProduces 
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('users')
@ApiBearerAuth('JWT-auth')
export class UsersController {
  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a paginated list of all users in the system',
    operationId: 'getAllUsers'
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (starts from 1)',
    example: 1,
    schema: { minimum: 1, default: 1 }
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of users per page',
    example: 10,
    schema: { minimum: 1, maximum: 100, default: 10 }
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search users by name or email',
    example: 'john'
  })
  @ApiResponse({
    status: 200,
    description: 'Users retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        users: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserResponseDto' }
        },
        total: {
          type: 'number',
          description: 'Total number of users',
          example: 100
        },
        page: {
          type: 'number',
          description: 'Current page number',
          example: 1
        },
        limit: {
          type: 'number',
          description: 'Number of users per page',
          example: 10
        },
        hasMore: {
          type: 'boolean',
          description: 'Whether there are more pages',
          example: true
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions'
  })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    // Implementation here
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their unique identifier'
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'User found',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string', example: 'User not found' },
        statusCode: { type: 'number', example: 404 },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' }
      }
    }
  })
  async findOne(@Param('id') id: string) {
    // Implementation here
  }

  @Post()
  @ApiOperation({
    summary: 'Create new user',
    description: 'Create a new user account with the provided information'
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User creation data',
    examples: {
      'example-1': {
        summary: 'Basic user',
        description: 'A basic user with required fields only',
        value: {
          email: 'user@example.com',
          name: 'John Doe',
          password: 'SecurePassword123!'
        }
      },
      'example-2': {
        summary: 'User with avatar',
        description: 'A user with all fields including optional avatar',
        value: {
          email: 'jane@example.com',
          name: 'Jane Smith',
          password: 'SecurePassword123!',
          avatar: 'https://example.com/avatar.jpg'
        }
      }
    }
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: UserResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string', example: 'Validation failed' },
        message: {
          type: 'array',
          items: { type: 'string' },
          example: ['email must be a valid email address', 'name must be at least 2 characters long']
        },
        statusCode: { type: 'number', example: 400 }
      }
    }
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already exists',
    schema: {
      type: 'object',
      properties: {
        error: { type: 'string', example: 'User with this email already exists' },
        statusCode: { type: 'number', example: 409 }
      }
    }
  })
  async create(@Body() createUserDto: CreateUserDto) {
    // Implementation here
  }
}

// Health check controller with minimal documentation
@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the API is healthy and operational'
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'healthy' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        uptime: { type: 'number', example: 12345 },
        version: { type: 'string', example: '1.0.0' }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'API is unhealthy'
  })
  async check() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
  }
}