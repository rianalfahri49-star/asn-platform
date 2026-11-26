package com.suksescpns.nativeapp

internal data class UserSession(
    val userId: String,
    val email: String,
    val accessToken: String,
    val refreshToken: String,
    val expiresAtMillis: Long,
)

internal data class StudyQuestion(
    val id: String,
    val category: String,
    val topic: String,
    val prompt: String,
    val options: List<String>,
)

internal data class StudyMaterial(
    val id: String,
    val title: String,
    val category: String,
    val summary: String,
    val content: String,
    val videoUrl: String?,
)

internal data class ExamAnswer(
    val questionId: String,
    val answer: String?,
)

internal data class ExamOutcome(
    val attemptId: String,
    val totalQuestions: Int,
    val correctAnswers: Int,
    val score: Int,
)

internal data class ExamHistory(
    val id: String,
    val title: String,
    val category: String,
    val totalQuestions: Int,
    val correctAnswers: Int,
    val score: Int,
    val completedAt: String,
)
