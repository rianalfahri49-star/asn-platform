package com.suksescpns.nativeapp

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.net.Uri
import android.os.Bundle
import android.os.CountDownTimer
import android.os.Handler
import android.os.Looper
import android.text.InputType
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.view.accessibility.AccessibilityEvent
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.ScrollView
import android.widget.TextView
import java.util.concurrent.ExecutorService
import java.util.concurrent.Executors

class MainActivity : Activity() {
    private enum class Destination { HOME, PRACTICE, MATERIALS, ACCOUNT }
    private enum class Screen { MAIN, LOGIN, QUIZ, RESULT, MATERIAL_DETAIL }

    private val backgroundColor = Color.rgb(243, 247, 243)
    private val surfaceColor = Color.WHITE
    private val inkColor = Color.rgb(31, 54, 47)
    private val mutedColor = Color.rgb(100, 120, 111)
    private val greenColor = Color.rgb(34, 119, 87)
    private val paleGreenColor = Color.rgb(226, 241, 231)
    private val borderColor = Color.rgb(220, 231, 222)
    private val warningColor = Color.rgb(165, 82, 46)
    private val defaultDurationMillis = 110 * 60 * 1000L

    private lateinit var api: SupabaseApi
    private lateinit var sessionStore: SessionStore
    private val executor: ExecutorService = Executors.newFixedThreadPool(2)
    private val mainHandler = Handler(Looper.getMainLooper())

    @Volatile private var session: UserSession? = null
    private var destination = Destination.HOME
    private var screen = Screen.MAIN
    private var questions: List<StudyQuestion> = emptyList()
    private var materials: List<StudyMaterial> = emptyList()
    private var history: List<ExamHistory> = emptyList()
    private var selectedMaterial: StudyMaterial? = null
    private var selectedCategory = "Semua"
    private var quizQuestions: List<StudyQuestion> = emptyList()
    private val selectedAnswers = mutableMapOf<String, String>()
    private var questionIndex = 0
    private var remainingMillis = defaultDurationMillis
    private var timer: CountDownTimer? = null
    private var timerLabel: TextView? = null
    private var loading = false
    private var loginMode = true
    private var message = ""
    private var examOutcome: ExamOutcome? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = backgroundColor
        window.navigationBarColor = backgroundColor
        window.decorView.systemUiVisibility =
            View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR

        api = SupabaseApi(BuildConfig.SUPABASE_URL, BuildConfig.SUPABASE_ANON_KEY)
        sessionStore = SessionStore(this)
        session = sessionStore.read()



        render()
        if (api.isConfigured) loadPublicContent() else {
            message = "Koneksi belajar belum tersedia di build ini."
            render()
        }
    }

    @Suppress("DEPRECATION")
    override fun onBackPressed() {
        when (screen) {
            Screen.MATERIAL_DETAIL -> {
                selectedMaterial = null
                screen = Screen.MAIN
                render()
            }
            Screen.QUIZ -> AlertDialog.Builder(this)
                .setTitle("Akhiri simulasi?")
                .setMessage("Jawaban yang sudah dipilih tetap dikirim untuk dinilai.")
                .setNegativeButton("Lanjutkan", null)
                .setPositiveButton("Akhiri") { _, _ -> submitQuiz() }
                .show()
            Screen.LOGIN -> {
                screen = Screen.MAIN
                message = ""
                render()
            }
            Screen.RESULT -> {
                screen = Screen.MAIN
                destination = Destination.HOME
                render()
            }
            else -> {
                if (destination != Destination.HOME) {
                    destination = Destination.HOME
                    render()
                } else {
                    super.onBackPressed()
                }
            }
        }
    }

    override fun onDestroy() {
        timer?.cancel()
        executor.shutdownNow()
        super.onDestroy()
    }

    private fun render() {
        val page = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(backgroundColor)
        }
        setContentView(page)

        if (screen == Screen.LOGIN) {
            renderTopBar(page, showBack = true)
            val scroll = makeScroll()
            page.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f))
            renderLogin(scroll)
            return
        }

        renderTopBar(page)
        val scroll = makeScroll()
        page.addView(scroll, LinearLayout.LayoutParams(-1, 0, 1f))
        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(18), dp(20), dp(28))
        }
        scroll.addView(content)

        when (screen) {
            Screen.QUIZ -> renderQuiz(content)
            Screen.RESULT -> renderResult(content)
            Screen.MATERIAL_DETAIL -> selectedMaterial?.let { renderMaterialDetail(content, it) }
            Screen.MAIN -> when (destination) {
                Destination.HOME -> renderHome(content)
                Destination.PRACTICE -> renderPractice(content)
                Destination.MATERIALS -> renderMaterials(content)
                Destination.ACCOUNT -> renderAccount(content)
            }
            Screen.LOGIN -> Unit
        }
        if (message.isNotBlank() && screen != Screen.LOGIN) addNotice(content, message)
        if (screen == Screen.MAIN) renderBottomNavigation(page)
    }

    private fun renderTopBar(parent: LinearLayout, showBack: Boolean = false) {
        val bar = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER_VERTICAL
            setPadding(dp(20), dp(12), dp(20), dp(12))
            setBackgroundColor(backgroundColor)
        }
        if (showBack) {
            val back = text("‹", 32f, greenColor, true).apply {
                contentDescription = "Kembali"
                gravity = Gravity.CENTER
                setOnClickListener {
                    screen = Screen.MAIN
                    message = ""
                    render()
                }
            }
            bar.addView(back, LinearLayout.LayoutParams(dp(42), dp(42)))
        } else {
            val mark = text("S", 17f, Color.WHITE, true).apply {
                gravity = Gravity.CENTER
                background = rounded(greenColor, 14)
                contentDescription = "SuksesCPNS"
            }
            bar.addView(mark, LinearLayout.LayoutParams(dp(38), dp(38)))
        }
        val title = text("SuksesCPNS", 18f, inkColor, true).apply {
            setPadding(dp(10), 0, 0, 0)
        }
        bar.addView(title, LinearLayout.LayoutParams(0, -2, 1f))
        if (!showBack) {
            val greeting = text(session?.email?.substringBefore("@") ?: "Belajar", 13f, mutedColor, false).apply {
                gravity = Gravity.END or Gravity.CENTER_VERTICAL
                maxLines = 1
            }
            bar.addView(greeting)
        }
        parent.addView(bar, LinearLayout.LayoutParams(-1, -2))
    }

    private fun renderBottomNavigation(parent: LinearLayout) {
        val nav = LinearLayout(this).apply {
            orientation = LinearLayout.HORIZONTAL
            gravity = Gravity.CENTER
            setPadding(dp(8), dp(7), dp(8), dp(7))
            setBackgroundColor(surfaceColor)
            elevation = dp(8).toFloat()
        }
        val items = listOf(
            Destination.HOME to "Beranda",
            Destination.PRACTICE to "Latihan",
            Destination.MATERIALS to "Materi",
            Destination.ACCOUNT to "Akun",
        )
        items.forEach { (item, label) ->
            val active = destination == item && screen == Screen.MAIN
            val tab = TextView(this).apply {
                text = label
                textSize = 12f
                gravity = Gravity.CENTER
                typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
                setTextColor(if (active) greenColor else mutedColor)
                contentDescription = label
                isFocusable = true
                setPadding(dp(5), dp(10), dp(5), dp(10))
                setOnClickListener {
                    destination = item
                    screen = Screen.MAIN
                    selectedMaterial = null
                    message = ""
                    render()
                    if (item == Destination.PRACTICE && questions.isEmpty()) loadPublicContent()
                    if (item == Destination.MATERIALS && materials.isEmpty()) loadPublicContent()
                }
            }
            nav.addView(tab, LinearLayout.LayoutParams(0, -2, 1f))
        }
        parent.addView(nav, LinearLayout.LayoutParams(-1, -2))
    }

    private fun renderHome(parent: LinearLayout) {
        addText(parent, "PERSIAPAN ASN", 12f, greenColor, true, bottom = 10)
        addText(parent, "Belajar terarah.\nMelangkah lebih siap.", 30f, inkColor, true, bottom = 12)
        addText(
            parent,
            "Latihan SKD dan materi ringkas untuk menemani persiapan CPNS-mu.",
            15f,
            mutedColor,
            bottom = 20,
        )

        val hero = card(parent, paleGreenColor, 22)
        addText(hero, "RITME BELAJAR HARI INI", 11f, greenColor, true, bottom = 8)
        addText(hero, "Satu sesi kecil lebih baik daripada menunggu sempurna.", 18f, inkColor, true, bottom = 8)
        addText(hero, "Soal dan materi dimuat langsung dari ruang belajar SuksesCPNS.", 13f, mutedColor, bottom = 16)
        primaryButton(hero, "Mulai latihan") {
            destination = Destination.PRACTICE
            screen = Screen.MAIN
            render()
        }

        addText(parent, "Pilih fokus belajar", 20f, inkColor, true, top = 25, bottom = 12)
        listOf(
            "TWK" to "Wawasan kebangsaan",
            "TIU" to "Kemampuan numerik dan verbal",
            "TKP" to "Karakteristik pribadi",
        ).forEach { (code, description) ->
            val item = card(parent, surfaceColor, 16)
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
            item.addView(row)
            val badge = text(code, 13f, greenColor, true).apply {
                gravity = Gravity.CENTER
                background = rounded(paleGreenColor, 12)
            }
            row.addView(badge, LinearLayout.LayoutParams(dp(52), dp(42)))
            val details = LinearLayout(this).apply {
                orientation = LinearLayout.VERTICAL
                setPadding(dp(12), 0, 0, 0)
            }
            row.addView(details, LinearLayout.LayoutParams(0, -2, 1f))
            addText(details, description, 14f, inkColor, true, bottom = 0)
            addText(details, "Buka latihan $code", 12f, mutedColor, bottom = 0)
            val open = text("›", 27f, greenColor, true).apply {
                contentDescription = "Buka latihan $code"
                gravity = Gravity.CENTER
                setOnClickListener {
                    selectedCategory = code
                    destination = Destination.PRACTICE
                    render()
                }
            }
            row.addView(open, LinearLayout.LayoutParams(dp(36), dp(44)))
            item.setOnClickListener {
                selectedCategory = code
                destination = Destination.PRACTICE
                render()
            }
        }

        val overview = card(parent, surfaceColor, 18)
        addText(overview, "Belajar dengan progres yang tersimpan", 16f, inkColor, true, bottom = 7)
        addText(
            overview,
            if (session == null) "Masuk untuk menyimpan hasil simulasi dan melihat riwayat latihan."
            else "Sesi masuk aktif untuk ${session?.email.orEmpty()}. Hasil simulasi akan masuk ke riwayat akunmu.",
            13f,
            mutedColor,
            bottom = 12,
        )
        if (session == null) secondaryButton(overview, "Masuk atau daftar") { openLogin() }
        else secondaryButton(overview, "Lihat akun") { destination = Destination.ACCOUNT; render() }
    }

    private fun renderPractice(parent: LinearLayout) {
        addText(parent, "LATIHAN SOAL", 12f, greenColor, true, bottom = 8)
        addText(parent, "Latihan sesuai fokusmu", 26f, inkColor, true, bottom = 8)
        addText(parent, "Pilih kategori untuk berlatih, atau mulai simulasi dengan waktu.", 14f, mutedColor, bottom = 16)

        val categories = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        parent.addView(categories, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(14) })
        listOf("Semua", "TWK", "TIU", "TKP").forEach { category ->
            val selected = selectedCategory == category
            val chip = TextView(this).apply {
                text = category
                textSize = 13f
                gravity = Gravity.CENTER
                typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
                setTextColor(if (selected) Color.WHITE else inkColor)
                background = rounded(if (selected) greenColor else surfaceColor, 20, if (selected) greenColor else borderColor)
                setPadding(dp(12), dp(9), dp(12), dp(9))
                contentDescription = "Filter kategori $category"
                isFocusable = true
                setOnClickListener { selectedCategory = category; render() }
            }
            categories.addView(chip, LinearLayout.LayoutParams(0, -2, 1f).apply {
                marginEnd = dp(5)
                marginStart = dp(5)
            })
        }

        val filtered = filteredQuestions()
        val countCard = card(parent, paleGreenColor, 16)
        addText(countCard, "${filtered.size} soal tersedia", 16f, inkColor, true, bottom = 4)
        addText(countCard, "Simulasi dapat berisi hingga 110 soal dan hasil tersimpan pada akun.", 12f, mutedColor, bottom = 12)
        primaryButton(countCard, if (session == null) "Masuk untuk mulai simulasi" else "Mulai simulasi") {
            if (session == null) {
                message = "Masuk terlebih dahulu agar hasil simulasi tersimpan."
                openLogin()
            } else startQuiz(filtered)
        }

        addText(parent, "Bank soal", 20f, inkColor, true, top = 20, bottom = 10)
        if (loading && questions.isEmpty()) addLoading(parent)
        if (filtered.isEmpty() && !loading) {
            addEmptyState(parent, "Belum ada soal untuk kategori ini.", "Coba kategori lain atau muat ulang nanti.")
        } else {
            filtered.take(30).forEachIndexed { index, question ->
                val item = card(parent, surfaceColor, 16)
                addText(item, "${question.category}  ·  ${question.topic.ifBlank { "Latihan umum" }}", 11f, greenColor, true, bottom = 7)
                addText(item, question.prompt, 14f, inkColor, true, bottom = 0, maxLines = 3)
                item.contentDescription = "Soal ${index + 1}, ${question.category}: ${question.prompt}"
            }
        }
    }

    private fun renderMaterials(parent: LinearLayout) {
        addText(parent, "RUANG MATERI", 12f, greenColor, true, bottom = 8)
        addText(parent, "Ringkas, jelas, siap dipelajari", 25f, inkColor, true, bottom = 8)
        addText(parent, "Materi gratis dari SuksesCPNS, diperbarui dari sumber belajar utama.", 14f, mutedColor, bottom = 16)
        if (loading && materials.isEmpty()) addLoading(parent)
        if (materials.isEmpty() && !loading) {
            addEmptyState(parent, "Materi belum tersedia.", "Materi yang dipublikasikan akan muncul di sini.")
        }
        materials.forEach { material ->
            val item = card(parent, surfaceColor, 18)
            addText(item, material.category.ifBlank { "MATERI" }.uppercase(), 11f, greenColor, true, bottom = 7)
            addText(item, material.title, 17f, inkColor, true, bottom = 7)
            addText(item, material.summary.ifBlank { material.content.take(135) }, 13f, mutedColor, bottom = 12, maxLines = 3)
            secondaryButton(item, "Baca materi") {
                selectedMaterial = material
                screen = Screen.MATERIAL_DETAIL
                render()
            }
        }
    }

    private fun renderMaterialDetail(parent: LinearLayout, material: StudyMaterial) {
        text("‹ Kembali ke materi", 14f, greenColor, true).apply {
            isFocusable = true
            setOnClickListener { selectedMaterial = null; screen = Screen.MAIN; render() }
        }.also { parent.addView(it, LinearLayout.LayoutParams(-1, dp(44))) }
        addText(parent, material.category.ifBlank { "MATERI" }.uppercase(), 12f, greenColor, true, top = 18, bottom = 8)
        addText(parent, material.title, 27f, inkColor, true, bottom = 14)
        if (material.summary.isNotBlank()) addText(parent, material.summary, 15f, mutedColor, bottom = 18)
        val body = card(parent, surfaceColor, 18)
        addText(body, material.content.ifBlank { material.summary.ifBlank { "Materi ini belum memiliki isi." } }, 15f, inkColor, bottom = 2)
        material.videoUrl?.let { url ->
            val safeUri = runCatching { Uri.parse(url) }.getOrNull()
            if (safeUri?.scheme in listOf("https", "http")) {
                secondaryButton(parent, "Buka video materi") {
                    startActivity(Intent(Intent.ACTION_VIEW, safeUri))
                }
            }
        }
    }

    private fun renderAccount(parent: LinearLayout) {
        addText(parent, "AKUN", 12f, greenColor, true, bottom = 8)
        addText(parent, "Ruang belajar pribadimu", 25f, inkColor, true, bottom = 16)
        val activeSession = session
        if (activeSession == null) {
            val card = card(parent, surfaceColor, 18)
            addText(card, "Masuk untuk menyimpan progres", 17f, inkColor, true, bottom = 8)
            addText(card, "Hasil simulasi dan riwayat latihan hanya tersimpan pada akunmu.", 13f, mutedColor, bottom = 12)
            primaryButton(card, "Masuk atau daftar") { openLogin() }
            return
        }

        val account = card(parent, surfaceColor, 18)
        addText(account, activeSession.email, 17f, inkColor, true, bottom = 6)
        addText(account, "Sesi dilindungi penyimpanan terenkripsi perangkat.", 12f, mutedColor, bottom = 14)
        secondaryButton(account, "Muat riwayat latihan") {
            perform(
                work = { api.loadHistory(freshSession() ?: throw IllegalStateException("Silakan masuk kembali.")) },
                onSuccess = { history = it; message = if (it.isEmpty()) "Belum ada hasil simulasi." else "Riwayat latihan diperbarui." },
            )
        }
        if (history.isNotEmpty()) {
            addText(parent, "Riwayat simulasi", 20f, inkColor, true, top = 20, bottom = 10)
            history.forEach { result ->
                val item = card(parent, surfaceColor, 16)
                addText(item, result.title.ifBlank { result.category }, 15f, inkColor, true, bottom = 5)
                addText(item, "${result.correctAnswers}/${result.totalQuestions} benar  ·  Skor ${result.score}", 13f, greenColor, true, bottom = 4)
                addText(item, result.completedAt.take(10), 12f, mutedColor, bottom = 0)
            }
        }
        val signOut = secondaryButton(parent, "Keluar dari akun") {
            session = null
            sessionStore.clear()
            history = emptyList()
            message = "Kamu sudah keluar."
            executor.execute { runCatching { api.signOut(activeSession.accessToken) } }
            render()
        }
        signOut.contentDescription = "Keluar dari akun ${activeSession.email}"
    }

    private fun renderLogin(parent: ViewGroup) {
        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(20), dp(18), dp(20), dp(30))
        }
        parent.addView(content)
        addText(content, "AKUN SUKSESCPNS", 12f, greenColor, true, bottom = 8)
        addText(content, if (loginMode) "Selamat datang kembali" else "Buat akun belajar", 27f, inkColor, true, bottom = 8)
        addText(content, "Gunakan email untuk menyimpan hasil simulasi dan riwayat belajar.", 14f, mutedColor, bottom = 18)
        if (!api.isConfigured) {
            addNotice(content, "Koneksi akun tidak tersedia karena konfigurasi backend belum ada di build ini.")
            return
        }
        if (message.isNotBlank()) addNotice(content, message)
        val form = card(content, surfaceColor, 18)
        val nameField = if (loginMode) null else inputField(form, "Nama lengkap", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_CAP_WORDS)
        val emailField = inputField(form, "Email", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS)
        val passwordField = inputField(form, "Kata sandi", InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_VARIATION_PASSWORD)
        if (!loginMode) addText(form, "Gunakan kata sandi minimal 8 karakter.", 12f, mutedColor, bottom = 12)
        primaryButton(form, if (loading) "Memproses..." else if (loginMode) "Masuk" else "Buat akun") {
            val email = emailField.text.toString().trim()
            val password = passwordField.text.toString()
            val fullName = nameField?.text?.toString().orEmpty().trim()
            if (email.isBlank() || password.length < 8 || (!loginMode && fullName.isBlank())) {
                message = "Isi semua kolom dan gunakan kata sandi minimal 8 karakter."
                render()
            } else if (!loading) {
                val signingUp = !loginMode
                perform(
                    work = {
                        if (signingUp) api.signUp(fullName, email, password)?.let { it to true }
                        else api.signIn(email, password).let { it to false }
                    },
                    onSuccess = { result ->
                        val (newSession, createdAccount) = result ?: (null to true)
                        if (newSession == null) {
                            loginMode = true
                            message = "Akun dibuat. Periksa email untuk verifikasi, lalu masuk."
                        } else {
                            sessionStore.write(newSession)
                            session = newSession
                            screen = Screen.MAIN
                            destination = Destination.ACCOUNT
                            message = if (createdAccount) "Akun berhasil dibuat." else "Berhasil masuk."
                        }
                    },
                )
            }
        }
        text(if (loginMode) "Belum punya akun? Daftar" else "Sudah punya akun? Masuk", 14f, greenColor, true).apply {
            gravity = Gravity.CENTER
            setPadding(0, dp(16), 0, dp(12))
            isFocusable = true
            setOnClickListener {
                loginMode = !loginMode
                message = ""
                render()
            }
        }.also { form.addView(it, LinearLayout.LayoutParams(-1, -2)) }
        if (loginMode) {
            secondaryButton(form, "Lupa kata sandi?") {
                val email = emailField.text.toString().trim()
                if (email.isBlank()) {
                    message = "Masukkan email untuk menerima tautan pemulihan."
                    render()
                } else {
                    perform(
                        work = { api.requestPasswordReset(email); true },
                        onSuccess = { message = "Jika email terdaftar, tautan pemulihan akan dikirim." },
                    )
                }
            }
        }
    }

    private fun renderQuiz(parent: LinearLayout) {
        val question = quizQuestions.getOrNull(questionIndex)
        if (question == null) {
            addEmptyState(parent, "Soal simulasi tidak tersedia.", "Kembali ke latihan dan coba lagi.")
            secondaryButton(parent, "Kembali ke latihan") { screen = Screen.MAIN; destination = Destination.PRACTICE; render() }
            return
        }
        val header = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        parent.addView(header, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(12) })
        val title = text("SIMULASI SKD", 12f, greenColor, true)
        header.addView(title, LinearLayout.LayoutParams(0, -2, 1f))
        timerLabel = text(formatTime(remainingMillis), 14f, inkColor, true).apply {
            gravity = Gravity.CENTER
            background = rounded(surfaceColor, 14, borderColor)
            setPadding(dp(12), dp(8), dp(12), dp(8))
            contentDescription = "Sisa waktu ${formatTime(remainingMillis)}"
        }
        header.addView(timerLabel)
        val progress = card(parent, paleGreenColor, 15)
        addText(progress, "SOAL ${questionIndex + 1} DARI ${quizQuestions.size}", 11f, greenColor, true, bottom = 5)
        addText(progress, "${question.category}  ·  ${question.topic.ifBlank { "Latihan umum" }}", 13f, mutedColor)
        addText(parent, question.prompt, 21f, inkColor, true, top = 18, bottom = 18)
        question.options.forEachIndexed { index, option ->
            val answerCode = ('A'.code + index).toChar().toString()
            val selected = selectedAnswers[question.id] == answerCode
            val optionCard = card(parent, if (selected) paleGreenColor else surfaceColor, 15, if (selected) greenColor else borderColor)
            val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.TOP }
            optionCard.addView(row)
            val letter = text(answerCode, 14f, if (selected) Color.WHITE else greenColor, true).apply {
                gravity = Gravity.CENTER
                background = rounded(if (selected) greenColor else paleGreenColor, 18)
            }
            row.addView(letter, LinearLayout.LayoutParams(dp(34), dp(34)))
            val label = text(option, 15f, inkColor, selected).apply { setPadding(dp(12), dp(5), 0, dp(4)) }
            row.addView(label, LinearLayout.LayoutParams(0, -2, 1f))
            optionCard.contentDescription = "Pilihan $answerCode: $option"
            optionCard.isFocusable = true
            optionCard.setOnClickListener {
                selectedAnswers[question.id] = answerCode
                render()
            }
        }
        val unanswered = quizQuestions.count { selectedAnswers[it.id] == null }
        addText(parent, "$unanswered soal belum dijawab", 12f, mutedColor, top = 6, bottom = 14)
        if (loading) addLoading(parent)
        primaryButton(parent, if (questionIndex == quizQuestions.lastIndex) "Kirim jawaban" else "Soal berikutnya") {
            if (questionIndex < quizQuestions.lastIndex) {
                questionIndex += 1
                render()
            } else submitQuiz()
        }
        secondaryButton(parent, "Akhiri simulasi") {
            AlertDialog.Builder(this)
                .setTitle("Kirim jawaban sekarang?")
                .setMessage("Jawaban yang belum dipilih akan dinilai sebagai kosong.")
                .setNegativeButton("Kembali", null)
                .setPositiveButton("Kirim") { _, _ -> submitQuiz() }
                .show()
        }
    }

    private fun renderResult(parent: LinearLayout) {
        val result = examOutcome
        addText(parent, "HASIL SIMULASI", 12f, greenColor, true, bottom = 8)
        addText(parent, "Satu langkah lebih dekat.", 26f, inkColor, true, bottom = 8)
        if (result == null) {
            addEmptyState(parent, "Hasil belum tersedia.", "Kembali ke latihan untuk memulai lagi.")
        } else {
            val card = card(parent, paleGreenColor, 22)
            addText(card, "${result.score}", 42f, greenColor, true, bottom = 4)
            addText(card, "SKOR SIMULASI", 11f, mutedColor, true, bottom = 14)
            addText(card, "${result.correctAnswers} dari ${result.totalQuestions} jawaban benar", 17f, inkColor, true, bottom = 6)
            addText(card, "Hasil sudah tersimpan di akunmu.", 13f, mutedColor, bottom = 0)
        }
        primaryButton(parent, "Kembali ke beranda") {
            screen = Screen.MAIN
            destination = Destination.HOME
            message = ""
            render()
        }
        secondaryButton(parent, "Lihat riwayat latihan") {
            screen = Screen.MAIN
            destination = Destination.ACCOUNT
            render()
        }
    }

    private fun loadPublicContent() {
        if (loading || !api.isConfigured) return
        perform(
            work = { api.loadQuestions(null) to api.loadMaterials(null) },
            onSuccess = { (loadedQuestions, loadedMaterials) ->
                questions = loadedQuestions
                materials = loadedMaterials
                message = if (loadedQuestions.isEmpty() && loadedMaterials.isEmpty()) "Belum ada soal atau materi yang dipublikasikan." else ""
            },
        )
    }

    private fun startQuiz(items: List<StudyQuestion>) {
        if (items.isEmpty()) {
            message = "Belum ada soal untuk memulai simulasi."
            render()
            return
        }
        if (session == null) {
            openLogin()
            return
        }
        quizQuestions = items.take(110)
        selectedAnswers.clear()
        questionIndex = 0
        remainingMillis = defaultDurationMillis
        examOutcome = null
        message = ""
        screen = Screen.QUIZ
        destination = Destination.PRACTICE
        startTimer()
        render()
    }

    private fun startTimer() {
        timer?.cancel()
        timer = object : CountDownTimer(remainingMillis, 1000L) {
            override fun onTick(millisUntilFinished: Long) {
                remainingMillis = millisUntilFinished
                timerLabel?.text = formatTime(millisUntilFinished)
                timerLabel?.contentDescription = "Sisa waktu ${formatTime(millisUntilFinished)}"
            }

            override fun onFinish() {
                remainingMillis = 0
                timerLabel?.text = "00:00"
                submitQuiz()
            }
        }.start()
    }

    private fun submitQuiz() {
        if (loading || quizQuestions.isEmpty()) return
        timer?.cancel()
        timerLabel = null
        perform(
            work = {
                val activeSession = freshSession() ?: throw IllegalStateException("Sesi berakhir. Masuk kembali sebelum mengirim hasil.")
                val answers = quizQuestions.map { ExamAnswer(it.id, selectedAnswers[it.id]) }
                val elapsed = ((defaultDurationMillis - remainingMillis).coerceAtLeast(0L) / 1000L).toInt()
                api.submitExam(
                    session = activeSession,
                    answers = answers,
                    durationSeconds = elapsed,
                    title = "Simulasi SKD",
                    category = if (selectedCategory == "Semua") "SKD" else selectedCategory,
                )
            },
            onSuccess = {
                examOutcome = it
                screen = Screen.RESULT
                message = ""
            },
        )
    }

    private fun freshSession(): UserSession? {
        val active = session ?: return null
        if (active.expiresAtMillis > System.currentTimeMillis() + 60_000L) return active
        val renewed = api.refresh(active.refreshToken)
        sessionStore.write(renewed)
        session = renewed
        return renewed
    }

    private fun filteredQuestions(): List<StudyQuestion> =
        if (selectedCategory == "Semua") questions
        else questions.filter { it.category.equals(selectedCategory, ignoreCase = true) }

    private fun openLogin() {
        message = ""
        loginMode = true
        screen = Screen.LOGIN
        render()
    }

    private fun <T> perform(work: () -> T, onSuccess: (T) -> Unit) {
        if (loading) return
        loading = true
        message = ""
        render()
        executor.execute {
            val result = runCatching(work)
            mainHandler.post {
                loading = false
                result.onSuccess(onSuccess).onFailure { error ->
                    message = error.message?.takeIf(String::isNotBlank) ?: "Terjadi kendala. Periksa koneksi lalu coba lagi."
                    if (screen == Screen.QUIZ && remainingMillis <= 0L) remainingMillis = 1_000L
                }
                render()
            }
        }
    }

    private fun makeScroll(): ScrollView = ScrollView(this).apply {
        isFillViewport = true
        overScrollMode = View.OVER_SCROLL_IF_CONTENT_SCROLLS
        importantForAccessibility = View.IMPORTANT_FOR_ACCESSIBILITY_YES
    }

    private fun card(
        parent: LinearLayout,
        color: Int = surfaceColor,
        radius: Int = 18,
        stroke: Int? = null,
    ): LinearLayout {
        val view = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(16), dp(16), dp(16))
            background = rounded(color, radius, stroke)
        }
        parent.addView(view, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(12) })
        return view
    }

    private fun addText(
        parent: LinearLayout,
        value: String,
        size: Float,
        color: Int,
        bold: Boolean = false,
        top: Int = 0,
        bottom: Int = 8,
        maxLines: Int = Int.MAX_VALUE,
    ): TextView {
        val view = text(value, size, color, bold).apply { this.maxLines = maxLines }
        parent.addView(view, LinearLayout.LayoutParams(-1, -2).apply {
            topMargin = dp(top)
            bottomMargin = dp(bottom)
        })
        return view
    }

    private fun text(value: String, size: Float, color: Int, bold: Boolean): TextView = TextView(this).apply {
        text = value
        textSize = size
        setTextColor(color)
        typeface = Typeface.create(if (bold) "sans-serif-medium" else "sans-serif", if (bold) Typeface.BOLD else Typeface.NORMAL)
        includeFontPadding = true
        accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE
    }

    private fun primaryButton(parent: LinearLayout, label: String, action: () -> Unit): Button =
        makeButton(parent, label, primary = true, action = action)

    private fun secondaryButton(parent: LinearLayout, label: String, action: () -> Unit): Button =
        makeButton(parent, label, primary = false, action = action)

    private fun makeButton(parent: LinearLayout, label: String, primary: Boolean, action: () -> Unit): Button {
        val view = Button(this).apply {
            text = label
            textSize = 14f
            isAllCaps = false
            typeface = Typeface.create("sans-serif-medium", Typeface.BOLD)
            setTextColor(if (primary) Color.WHITE else greenColor)
            background = rounded(if (primary) greenColor else surfaceColor, 15, if (primary) greenColor else borderColor)
            minimumHeight = dp(48)
            stateListAnimator = null
            contentDescription = label
            setOnClickListener { action() }
        }
        parent.addView(view, LinearLayout.LayoutParams(-1, -2).apply { bottomMargin = dp(9) })
        return view
    }

    private fun inputField(parent: LinearLayout, hint: String, inputType: Int): EditText {
        addText(parent, hint, 13f, inkColor, true, bottom = 5)
        val field = EditText(this).apply {
            this.hint = hint
            this.inputType = inputType
            textSize = 15f
            setTextColor(inkColor)
            setHintTextColor(mutedColor)
            setPadding(dp(13), dp(10), dp(13), dp(10))
            background = rounded(Color.rgb(248, 250, 248), 13, borderColor)
            importantForAutofill = View.IMPORTANT_FOR_AUTOFILL_YES
            contentDescription = hint
        }
        parent.addView(field, LinearLayout.LayoutParams(-1, dp(54)).apply { bottomMargin = dp(14) })
        return field
    }

    private fun addLoading(parent: LinearLayout) {
        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL; gravity = Gravity.CENTER_VERTICAL }
        row.addView(ProgressBar(this), LinearLayout.LayoutParams(dp(28), dp(28)))
        addText(row, "Memuat data belajar...", 13f, mutedColor, bottom = 0).setPadding(dp(10), 0, 0, 0)
        parent.addView(row, LinearLayout.LayoutParams(-1, dp(50)))
    }

    private fun addEmptyState(parent: LinearLayout, title: String, detail: String) {
        val empty = card(parent, surfaceColor, 18)
        addText(empty, title, 16f, inkColor, true, bottom = 5)
        addText(empty, detail, 13f, mutedColor, bottom = 0)
    }

    private fun addNotice(parent: LinearLayout, value: String) {
        val notice = TextView(this).apply {
            text = value
            textSize = 13f
            setTextColor(if (value.contains("gagal", ignoreCase = true) || value.contains("belum", ignoreCase = true)) warningColor else inkColor)
            setPadding(dp(13), dp(11), dp(13), dp(11))
            background = rounded(Color.rgb(255, 247, 232), 13)
            accessibilityLiveRegion = View.ACCESSIBILITY_LIVE_REGION_POLITE
            sendAccessibilityEvent(AccessibilityEvent.TYPE_ANNOUNCEMENT)
        }
        parent.addView(notice, LinearLayout.LayoutParams(-1, -2).apply {
            topMargin = dp(8)
            bottomMargin = dp(10)
        })
    }

    private fun rounded(color: Int, radius: Int, stroke: Int? = null): GradientDrawable =
        GradientDrawable().apply {
            setColor(color)
            cornerRadius = dp(radius).toFloat()
            if (stroke != null) setStroke(dp(1), stroke)
        }

    private fun formatTime(millis: Long): String {
        val totalSeconds = (millis / 1000L).coerceAtLeast(0L)
        return "%02d:%02d".format(totalSeconds / 60L, totalSeconds % 60L)
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}
