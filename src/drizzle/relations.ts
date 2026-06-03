import { relations } from "drizzle-orm/relations";
import {
	sections, lessons, quizzes, questions, answers,
	courses, enrollments, users, progress,
	userSocialLinks, badges, userBadges, certifications, courseRatings,
	forumPosts, forumReplies,
	forumTags, forumPostTags, forumReplyTags,
	forumPostLikes, forumReplyLikes, quizAttempts, subscriptions
} from "./schema";

export const lessonsRelations = relations(lessons, ({one, many}) => ({
	section: one(sections, {
		fields: [lessons.sectionId],
		references: [sections.id]
	}),
	quizzes: many(quizzes),
}));

export const sectionsRelations = relations(sections, ({one, many}) => ({
	lessons: many(lessons),
	course: one(courses, {
		fields: [sections.courseId],
		references: [courses.id]
	}),
}));

export const questionsRelations = relations(questions, ({one, many}) => ({
	quiz: one(quizzes, {
		fields: [questions.quizId],
		references: [quizzes.id]
	}),
	answers: many(answers),
}));

export const quizzesRelations = relations(quizzes, ({one, many}) => ({
	questions: many(questions),
	lesson: one(lessons, {
		fields: [quizzes.lessonId],
		references: [lessons.id]
	}),
	attempts: many(quizAttempts),
}));

export const answersRelations = relations(answers, ({one}) => ({
	question: one(questions, {
		fields: [answers.questionId],
		references: [questions.id]
	}),
}));

export const enrollmentsRelations = relations(enrollments, ({one}) => ({
	course: one(courses, {
		fields: [enrollments.courseId],
		references: [courses.id]
	}),
	user: one(users, {
		fields: [enrollments.userId],
		references: [users.id]
	}),
}));

export const coursesRelations = relations(courses, ({many}) => ({
	enrollments: many(enrollments),
	progresses: many(progress),
	sections: many(sections),
	badges: many(badges),
	certifications: many(certifications),
	ratings: many(courseRatings),
	forumPosts: many(forumPosts),
}));

export const usersRelations = relations(users, ({many}) => ({
	enrollments: many(enrollments),
	progresses: many(progress),
	socialLinks: many(userSocialLinks),
	badges: many(userBadges),
	certifications: many(certifications),
	quizAttempts: many(quizAttempts),
	courseRatings: many(courseRatings),
	forumPosts: many(forumPosts),
	forumReplies: many(forumReplies),
	forumPostLikes: many(forumPostLikes),
	forumReplyLikes: many(forumReplyLikes),
	subscriptions: many(subscriptions),
}));

export const courseRatingsRelations = relations(courseRatings, ({one}) => ({
	user: one(users, {
		fields: [courseRatings.userId],
		references: [users.id]
	}),
	course: one(courses, {
		fields: [courseRatings.courseId],
		references: [courses.id]
	}),
}));

export const quizAttemptsRelations = relations(quizAttempts, ({one}) => ({
	quiz: one(quizzes, {
		fields: [quizAttempts.quizId],
		references: [quizzes.id]
	}),
	user: one(users, {
		fields: [quizAttempts.userId],
		references: [users.id]
	}),
}));

export const progressRelations = relations(progress, ({one}) => ({
	course: one(courses, {
		fields: [progress.courseId],
		references: [courses.id]
	}),
	user: one(users, {
		fields: [progress.userId],
		references: [users.id]
	}),
}));

export const userSocialLinksRelations = relations(userSocialLinks, ({one}) => ({
	user: one(users, {
		fields: [userSocialLinks.userId],
		references: [users.id]
	}),
}));

export const badgesRelations = relations(badges, ({one, many}) => ({
	course: one(courses, {
		fields: [badges.courseId],
		references: [courses.id]
	}),
	userBadges: many(userBadges),
}));

export const userBadgesRelations = relations(userBadges, ({one}) => ({
	user: one(users, {
		fields: [userBadges.userId],
		references: [users.id]
	}),
	badge: one(badges, {
		fields: [userBadges.badgeId],
		references: [badges.id]
	}),
}));

export const certificationsRelations = relations(certifications, ({one}) => ({
	user: one(users, {
		fields: [certifications.userId],
		references: [users.id]
	}),
	course: one(courses, {
		fields: [certifications.courseId],
		references: [courses.id]
	}),
}));

export const forumPostsRelations = relations(forumPosts, ({one, many}) => ({
	user: one(users, {
		fields: [forumPosts.userId],
		references: [users.id]
	}),
	course: one(courses, {
		fields: [forumPosts.courseId],
		references: [courses.id]
	}),
	replies: many(forumReplies),
	tags: many(forumPostTags),
	likes: many(forumPostLikes),
}));

export const forumRepliesRelations = relations(forumReplies, ({one, many}) => ({
	post: one(forumPosts, {
		fields: [forumReplies.postId],
		references: [forumPosts.id]
	}),
	user: one(users, {
		fields: [forumReplies.userId],
		references: [users.id]
	}),
	tags: many(forumReplyTags),
	likes: many(forumReplyLikes),
}));

export const forumTagsRelations = relations(forumTags, ({many}) => ({
	postTags: many(forumPostTags),
	replyTags: many(forumReplyTags),
}));

export const forumPostTagsRelations = relations(forumPostTags, ({one}) => ({
	post: one(forumPosts, {
		fields: [forumPostTags.postId],
		references: [forumPosts.id]
	}),
	tag: one(forumTags, {
		fields: [forumPostTags.tagId],
		references: [forumTags.id]
	}),
}));

export const forumReplyTagsRelations = relations(forumReplyTags, ({one}) => ({
	reply: one(forumReplies, {
		fields: [forumReplyTags.replyId],
		references: [forumReplies.id]
	}),
	tag: one(forumTags, {
		fields: [forumReplyTags.tagId],
		references: [forumTags.id]
	}),
}));

export const forumPostLikesRelations = relations(forumPostLikes, ({one}) => ({
	post: one(forumPosts, {
		fields: [forumPostLikes.postId],
		references: [forumPosts.id]
	}),
	user: one(users, {
		fields: [forumPostLikes.userId],
		references: [users.id]
	}),
}));

export const forumReplyLikesRelations = relations(forumReplyLikes, ({one}) => ({
	reply: one(forumReplies, {
		fields: [forumReplyLikes.replyId],
		references: [forumReplies.id]
	}),
	user: one(users, {
		fields: [forumReplyLikes.userId],
		references: [users.id]
	}),
}));

export const subscriptionsRelations = relations(subscriptions, ({one}) => ({
	user: one(users, {
		fields: [subscriptions.userId],
		references: [users.id]
	}),
}));
