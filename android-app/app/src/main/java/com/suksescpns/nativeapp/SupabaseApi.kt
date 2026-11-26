package com.suksescpns.nativeapp

import org.json.JSONArray
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

internal class SupabaseApi(
    baseUrl: String,
    private val anonKey: String,
) {
    private val baseUrl = baseUrl.trim().trimEnd('/')

    val isConfigured: Boolean
        get() = baseUrl.startsWith("https://") && anonKey.isNotBlank()

    fun signIn(email: String, password: String): UserSession {
        val response = requestObject(
            method = "POST",
            path = "/auth/v1/token?grant_type=password",
            body = JSONObject().put("email", email.trim()).put("password", password),
            authEndpoint = true,
        )
        return response.optJSONObject("user")?.let { sessionFrom(response, it) }
            ?: throw IllegalStateException("Respons masuk tidak berisi sesi pengguna.")
    }

    fun signUp(fullName: String, email: String, password: String): UserSession? {
        val response = requestObject(
            method = "POST",
            path = "/auth/v1/signup",
            body = JSONObject()
                .put("email", email.trim())
                .put("password", password)
                .put("data", JSONObject().put("full_name", fullName.trim())),
            authEndpoint = true,
        )
        val user = response.optJSONObject("user") ?: return null
        val accessToken = response.optString("access_token")
        if (accessToken.isBlank()) return null
        return sessionFrom(response, user)
    }

    fun refresh(refreshToken: String): UserSession {
        val response = requestObject(
            method = "POST",
            path = "/auth/v1/token?grant_type=refresh_token",
            body = JSONObject().put("refresh_token", refreshToken),
            authEndpoint = true,
        )
        val user = response.optJSONObject("user")
            ?: throw IllegalStateException("Sesi perlu diperbarui. Silakan masuk kembali.")
        return sessionFrom(response, user)
    }

    fun signOut(accessToken: String) {
        request(
            method = "POST",
            path = "/auth/v1/logout",
            accessToken = accessToken,
            authEndpoint = true,
        )
    }

    fun requestPasswordReset(email: String) {
        request(
            method = "POST",
            path = "/auth/v1/recover",
            body = JSONObject().put("email", email.trim()),
            authEndpoint = true,
        )
    }

    fun loadQuestions(accessToken: String?): List<StudyQuestion> {
        val rows = requestArray(
            method = "GET",
            path = "/questions?select=id,category,topic,question,options&is_published=eq.true&is_premium=eq.false&order=created_at.asc&limit=110",
            accessToken = accessToken,
        )
        return (0 until rows.length()).mapNotNull { index ->
            val row = rows.optJSONObject(index) ?: return@mapNotNull null
            val options = row.optJSONArray("options")?.let(::readOptions).orEmpty()
            val prompt = row.optString("question")
            if (row.optString("id").isBlank() || prompt.isBlank() || options.isEmpty()) return@mapNotNull null
            StudyQuestion(
                id = row.optString("id"),
                category = row.optString("category"),
                topic = row.optString("topic"),
                prompt = prompt,
                options = options,
            )
        }
    }

    fun loadMaterials(accessToken: String?): List<StudyMaterial> {
        val rows = requestArray(
            method = "GET",
            path = "/learning_materials?select=id,title,category,summary,content,video_url&is_published=eq.true&is_premium=eq.false&order=created_at.desc&limit=50",
            accessToken = accessToken,
        )
        return (0 until rows.length()).mapNotNull { index ->
            val row = rows.optJSONObject(index) ?: return@mapNotNull null
            val title = row.optString("title")
            if (title.isBlank()) return@mapNotNull null
            StudyMaterial(
                id = row.optString("id"),
                title = title,
                category = row.optString("category"),
                summary = row.optString("summary"),
                content = row.optString("content"),
                videoUrl = row.optString("video_url").takeIf(String::isNotBlank),
            )
        }
    }

    fun submitExam(
        session: UserSession,
        answers: List<ExamAnswer>,
        durationSeconds: Int,
        title: String,
        category: String,
    ): ExamOutcome {
        val answerArray = JSONArray().apply {
            answers.forEach { answer ->
                put(
                    JSONObject()
                        .put("question_id", answer.questionId)
                        .put("answer", answer.answer ?: JSONObject.NULL)
                        .put("is_marked", false),
                )
            }
        }
        val response = request(
            method = "POST",
            path = "/rpc/submit_exam_attempt",
            body = JSONObject()
                .put("p_title", title)
                .put("p_category", category)
                .put("p_answers", answerArray)
                .put("p_duration_seconds", durationSeconds.coerceIn(0, 6600)),
            accessToken = session.accessToken,
        )
        val result = when (response) {
            is JSONObject -> response.takeIf { it.has("attempt_id") } ?: response.optJSONArray("data")?.optJSONObject(0)
            is JSONArray -> response.optJSONObject(0)
            else -> null
        }
        return result?.let {
            ExamOutcome(
                attemptId = it.optString("attempt_id"),
                totalQuestions = it.optInt("total_questions"),
                correctAnswers = it.optInt("correct_answers"),
                score = it.optInt("score"),
            )
        } ?: throw IllegalStateException("Hasil ujian tidak dapat dibaca.")
    }

    fun loadHistory(session: UserSession): List<ExamHistory> {
        val userId = encode(session.userId)
        val rows = requestArray(
            method = "GET",
            path = "/exam_attempts?select=id,title,category,total_questions,correct_answers,score,completed_at&user_id=eq.$userId&order=completed_at.desc&limit=10",
            accessToken = session.accessToken,
        )
        return (0 until rows.length()).mapNotNull { index ->
            val row = rows.optJSONObject(index) ?: return@mapNotNull null
            ExamHistory(
                id = row.optString("id"),
                title = row.optString("title"),
                category = row.optString("category"),
                totalQuestions = row.optInt("total_questions"),
                correctAnswers = row.optInt("correct_answers"),
                score = row.optInt("score"),
                completedAt = row.optString("completed_at"),
            )
        }
    }

    private fun sessionFrom(response: JSONObject, user: JSONObject): UserSession {
        val accessToken = response.optString("access_token")
        val refreshToken = response.optString("refresh_token")
        if (accessToken.isBlank() || refreshToken.isBlank()) {
            throw IllegalStateException("Sesi belum tersedia. Periksa verifikasi email lalu coba masuk.")
        }
        val expiresAt = response.optLong("expires_at").takeIf { it > 0 }
            ?: (System.currentTimeMillis() / 1000L + response.optLong("expires_in", 3600L))
        return UserSession(
            userId = user.optString("id"),
            email = user.optString("email"),
            accessToken = accessToken,
            refreshToken = refreshToken,
            expiresAtMillis = expiresAt * 1000L,
        )
    }

    private fun readOptions(array: JSONArray): List<String> =
        (0 until array.length()).mapNotNull { index ->
            when (val value = array.opt(index)) {
                is JSONObject -> value.optString("text").takeIf(String::isNotBlank)
                    ?: value.optString("label").takeIf(String::isNotBlank)
                is String -> value.takeIf(String::isNotBlank)
                else -> null
            }
        }.take(5)

    private fun requestObject(
        method: String,
        path: String,
        body: JSONObject? = null,
        authEndpoint: Boolean = false,
    ): JSONObject = request(method, path, body, authEndpoint = authEndpoint) as? JSONObject
        ?: throw IllegalStateException("Respons server tidak valid.")

    private fun requestArray(method: String, path: String, accessToken: String?): JSONArray {
        val response = request(method, path, accessToken = accessToken)
        return when (response) {
            is JSONArray -> response
            else -> JSONArray()
        }
    }

    private fun request(
        method: String,
        path: String,
        body: JSONObject? = null,
        accessToken: String? = null,
        authEndpoint: Boolean = false,
    ): Any {
        if (!isConfigured) throw IllegalStateException("Koneksi belajar belum dikonfigurasi.")
        val endpoint = if (authEndpoint) "$baseUrl$path" else "$baseUrl/rest/v1$path"
        val connection = (URL(endpoint).openConnection() as HttpURLConnection).apply {
            requestMethod = method
            connectTimeout = 15_000
            readTimeout = 20_000
            useCaches = false
            setRequestProperty("Accept", "application/json")
            setRequestProperty("apikey", anonKey)
            setRequestProperty("Authorization", "Bearer ${accessToken?.takeIf(String::isNotBlank) ?: anonKey}")
            if (body != null) setRequestProperty("Content-Type", "application/json; charset=utf-8")
        }
        try {
            if (body != null) {
                connection.doOutput = true
                connection.outputStream.use { it.write(body.toString().toByteArray(Charsets.UTF_8)) }
            }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val responseBody = stream?.use { input ->
                BufferedReader(InputStreamReader(input, Charsets.UTF_8)).readText()
            }.orEmpty()
            if (status !in 200..299) throw IllegalStateException(errorMessage(responseBody, status))
            if (responseBody.isBlank()) return JSONObject()
            return if (responseBody.trimStart().startsWith("[")) JSONArray(responseBody) else JSONObject(responseBody)
        } finally {
            connection.disconnect()
        }
    }

    private fun errorMessage(body: String, status: Int): String {
        val response = runCatching { JSONObject(body) }.getOrNull()
        val message = response?.optString("msg")?.takeIf(String::isNotBlank)
            ?: response?.optString("message")?.takeIf(String::isNotBlank)
            ?: response?.optString("error_description")?.takeIf(String::isNotBlank)
            ?: response?.optString("error")?.takeIf(String::isNotBlank)
        return message ?: "Permintaan gagal (HTTP $status). Coba lagi beberapa saat."
    }

    private fun encode(value: String): String = URLEncoder.encode(value, Charsets.UTF_8.name())
}
