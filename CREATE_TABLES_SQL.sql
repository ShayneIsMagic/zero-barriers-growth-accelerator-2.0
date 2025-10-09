-- Create User table
CREATE TABLE "User" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  password TEXT,
  role TEXT DEFAULT 'USER' NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Analysis table
CREATE TABLE "Analysis" (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  content TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' NOT NULL,
  score DOUBLE PRECISION,
  insights TEXT,
  frameworks TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "userId" TEXT REFERENCES "User"(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX "Analysis_userId_idx" ON "Analysis"("userId");
CREATE INDEX "Analysis_status_idx" ON "Analysis"(status);
CREATE INDEX "Analysis_createdAt_idx" ON "Analysis"("createdAt");
CREATE INDEX "User_email_idx" ON "User"(email);

-- Note: User passwords will be added via the setup script with bcrypt hashing
-- This ensures passwords are properly encrypted

