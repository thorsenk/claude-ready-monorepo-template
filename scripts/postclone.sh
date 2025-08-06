#!/bin/bash

# Post-clone setup script for Claude-Ready Monorepo Template
# This script runs automatically after cloning the template

set -e

echo "🚀 Setting up Claude-Ready Monorepo Template..."

# Get the new project name from the current directory
PROJECT_NAME=$(basename "$PWD")
echo "📁 Project name: $PROJECT_NAME"

# Update package.json files with new project name
echo "📝 Updating package names..."

# Root package.json
sed -i.bak "s/claude-ready-monorepo/$PROJECT_NAME/g" package.json
rm package.json.bak

# Apps package.json files
find apps -name "package.json" -exec sed -i.bak "s/@claude-template/@$PROJECT_NAME/g" {} \;
find apps -name "package.json.bak" -delete

# Packages package.json files
find packages -name "package.json" -exec sed -i.bak "s/@claude-template/@$PROJECT_NAME/g" {} \;
find packages -name "package.json.bak" -delete

# Update import statements in TypeScript files
echo "🔄 Updating import statements..."
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i.bak "s/@claude-template/@$PROJECT_NAME/g" 2>/dev/null || true
find . -name "*.ts.bak" -o -name "*.tsx.bak" | xargs rm -f 2>/dev/null || true

# Update README.md
echo "📖 Updating README..."
sed -i.bak "s/claude-ready-monorepo/$PROJECT_NAME/g" README.md
rm README.md.bak

# Update CLAUDE.md
echo "🤖 Updating CLAUDE.md..."
sed -i.bak "s/claude-ready-monorepo/$PROJECT_NAME/g" CLAUDE.md
rm CLAUDE.md.bak

# Create .env.local from example
if [ ! -f .env.local ]; then
    echo "🔐 Creating .env.local from template..."
    cp env.example .env.local
    echo "⚠️  Please update .env.local with your actual values"
fi

# Initialize git repository
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "feat: initial commit from Claude template"
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# Setup git hooks
echo "🔧 Setting up git hooks..."
pnpm prepare

# Create initial database setup
echo "🗄️  Setting up database..."
mkdir -p apps/api/prisma
cat > apps/api/prisma/schema.prisma << 'EOF'
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
EOF

# Create basic Next.js app structure
echo "🌐 Setting up Next.js app structure..."
mkdir -p apps/web/app
cat > apps/web/app/page.tsx << 'EOF'
import { Button } from '@radix-ui/react-button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          Welcome to Your Claude-Ready App
        </h1>
        <p className="text-muted-foreground max-w-md">
          This template is optimized for Claude Code with modern frontend/backend stack,
          MCP integration, and agentic development workflows.
        </p>
        <Button>Get Started</Button>
      </div>
    </div>
  )
}
EOF

# Create basic NestJS app structure
echo "🔧 Setting up NestJS app structure..."
mkdir -p apps/api/src
cat > apps/api/src/main.ts << 'EOF'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3001);
}
bootstrap();
EOF

cat > apps/api/src/app.module.ts << 'EOF'
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
EOF

cat > apps/api/src/app.controller.ts << 'EOF'
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
EOF

cat > apps/api/src/app.service.ts << 'EOF'
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello from Claude-Ready API!';
  }
}
EOF

# Create basic UI components
echo "🎨 Setting up UI components..."
mkdir -p packages/ui/src
cat > packages/ui/src/index.tsx << 'EOF'
export { Button } from './button'
export { Card } from './card'
EOF

cat > packages/ui/src/button.tsx << 'EOF'
import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@claude-template/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
EOF

# Create basic types
echo "📝 Setting up shared types..."
mkdir -p packages/types/src
cat > packages/types/src/index.ts << 'EOF'
export interface User {
  id: string
  email: string
  name?: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
}
EOF

# Create basic utils
echo "🛠️  Setting up shared utilities..."
mkdir -p packages/utils/src
cat > packages/utils/src/index.ts << 'EOF'
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}
EOF

# Create configuration files
echo "⚙️  Setting up configuration files..."

# TypeScript configs
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./apps/web/*"],
      "@claude-template/*": ["./packages/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Prettier config
cat > .prettierrc << 'EOF'
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# ESLint config
cat > .eslintrc.js << 'EOF'
module.exports = {
  root: true,
  extends: ['@claude-template/config/eslint-preset.js'],
  parserOptions: {
    project: './tsconfig.json',
  },
}
EOF

echo "✅ Setup complete!"
echo ""
echo "🎉 Your Claude-Ready Monorepo is ready!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your actual values"
echo "2. Run 'pnpm dev' to start development"
echo "3. Run 'pnpm docker:up' to start database services"
echo "4. Visit http://localhost:3000 for the web app"
echo "5. Visit http://localhost:3001 for the API"
echo ""
echo "Happy coding with Claude! 🤖"