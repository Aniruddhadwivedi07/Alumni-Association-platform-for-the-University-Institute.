-- CreateTable for connect-pg-simple session store
CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE
);

-- CreateIndex
CREATE INDEX "IDX_session_expire" ON "session" ("expire");
