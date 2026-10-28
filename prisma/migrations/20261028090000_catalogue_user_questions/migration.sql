ALTER TABLE "questions" ADD COLUMN "catalogue_problem_id" UUID;

CREATE UNIQUE INDEX "questions_user_id_catalogue_problem_id_key"
ON "questions"("user_id", "catalogue_problem_id");

ALTER TABLE "questions"
ADD CONSTRAINT "questions_catalogue_problem_id_fkey"
FOREIGN KEY ("catalogue_problem_id") REFERENCES "leetcode_problems"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
