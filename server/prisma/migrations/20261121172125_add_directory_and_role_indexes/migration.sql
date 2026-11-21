-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE INDEX "AlumniProfile_department_graduationYear_idx" ON "AlumniProfile"("department", "graduationYear");
