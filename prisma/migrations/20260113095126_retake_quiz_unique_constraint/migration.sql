/*
  Warnings:

  - A unique constraint covering the columns `[user_id,quiz_id]` on the table `quiz_results` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `quiz_results_user_id_quiz_id_key` ON `quiz_results`(`user_id`, `quiz_id`);
