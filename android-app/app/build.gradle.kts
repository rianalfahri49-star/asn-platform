import java.io.File
import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

val projectEnv = Properties().apply {
    val envFile = File(rootProject.projectDir.parentFile, ".env.development.local")
    if (envFile.isFile) envFile.inputStream().use(::load)
}

fun buildConfigString(value: String): String = "\"${value.replace("\\", "\\\\").replace("\"", "\\\"")}\""

fun projectValue(name: String): String =
    providers.environmentVariable(name).orNull
        ?: projectEnv.getProperty(name)
        ?: ""

android {
    namespace = "com.suksescpns.nativeapp"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.suksescpns.nativeapp"
        minSdk = 26
        targetSdk = 36
        versionCode = 1
        versionName = "1.0.0"
        buildConfigField("String", "SUPABASE_URL", buildConfigString(projectValue("NEXT_PUBLIC_SUPABASE_URL")))
        buildConfigField("String", "SUPABASE_ANON_KEY", buildConfigString(projectValue("NEXT_PUBLIC_SUPABASE_ANON_KEY")))
    }

    buildFeatures {
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}
